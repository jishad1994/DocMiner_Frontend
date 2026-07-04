import { Component, computed, inject, signal } from '@angular/core';
import { PdfApiService } from '../../services/pdf-api-service/pdf-api.service';
import { PdfRenderService } from '../../services/pdf-render-service/pdf-render.service';
import { ToastService } from '../../services/toast-service/toast.service';
import { UploadPdfResponseDto } from '../../dtos/upload-pdf.response.dto';
import { ExtractPagesRequestDto } from '../../dtos/extract-pages-request.dto';
import { firstValueFrom } from 'rxjs';
import { ToastComponent } from '../toast-component/toast.component';
import { PageGridComponent } from '../page-grid/page-grid.component';
import { ActionBarComponent } from '../action-bar/action-bar.component';
import { SpinnerComponent } from '../spinner/spinner.component';
import { UploadZoneComponent } from '../upload-zone/upload-zone.component';

@Component({
  selector: 'app-pdf-extractor',
  imports: [ToastComponent,PageGridComponent,ActionBarComponent,SpinnerComponent,UploadZoneComponent],
  templateUrl: './pdf-extractor.component.html',
  styleUrl: './pdf-extractor.component.scss'
})
export class PdfExtractorComponent {
 private readonly pdfApiService = inject(PdfApiService);
  private readonly pdfRenderService = inject(PdfRenderService);
  private readonly toastService = inject(ToastService);
 
  // ── Private writable state ─────────────────────────────────────────────── //
 
  private readonly _uploadedPdf = signal<UploadPdfResponseDto | null>(null);
  private readonly _thumbnailUrls = signal<string[]>([])
  private readonly _selectedPages = signal<ReadonlySet<number>>(new Set<number>());
  private readonly _isUploading = signal<boolean>(false);
  private readonly _isRendering = signal<boolean>(false);
  private readonly _isExtracting = signal<boolean>(false);
  private readonly _renderProgress = signal<number>(0);
 
  // ── Public readonly signals (bound in template) ───────────────────────── //
 
  readonly uploadedPdf = this._uploadedPdf.asReadonly();
  readonly thumbnailUrls = this._thumbnailUrls.asReadonly();
  readonly selectedPages = this._selectedPages.asReadonly();
  readonly isUploading = this._isUploading.asReadonly();
  readonly isRendering = this._isRendering.asReadonly();
  readonly isExtracting = this._isExtracting.asReadonly();
  readonly renderProgress = this._renderProgress.asReadonly();
 
  // ── Computed signals ──────────────────────────────────────────────────── //
 
  readonly selectedCount = computed<number>(() => this._selectedPages().size);
 
  readonly hasUploadedPdf = computed<boolean>(() => this._uploadedPdf() !== null);
 
  readonly isReady = computed<boolean>(
    () =>
      this._uploadedPdf() !== null &&
      !this._isUploading() &&
      !this._isRendering(),
  );
 
  // ── Handlers ─────────────────────────────────────────────────────────── //
 
  /**
   * Called when UploadZoneComponent emits a valid PDF File.
   * Runs thumbnail rendering and backend upload concurrently.
   */
  async onFileSelected(file: File): Promise<void> {
    this.resetState();
    this._isUploading.set(true);
    this._isRendering.set(true);
 
    // Pre-initialise the thumbnails array with empty strings so the
    // grid renders skeleton cards immediately with the correct count.
    // We need to read the page count locally first.
    const localBuffer = await this.readFileAsArrayBuffer(file);
 
    // Run upload and rendering concurrently for best UX
    const uploadPromise = this.uploadFile(file);
    const renderPromise = this.renderThumbnailsProgressively(localBuffer);
 
    await Promise.all([uploadPromise, renderPromise]);
  }
 
  /** Toggle a single page's selection state. */
  onPageToggled(pageNumber: number): void {
    this._selectedPages.update((current) => {
      const next = new Set(current);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  }
 
  /** Select or deselect all pages at once. */
  onSelectAllToggled(selectAll: boolean): void {
    const pdf = this._uploadedPdf();
    if (pdf === null) return;
 
    if (selectAll) {
      const allPages = new Set<number>(
        Array.from({ length: pdf.totalPages }, (_, i) => i + 1),
      );
      this._selectedPages.set(allPages);
    } else {
      this._selectedPages.set(new Set<number>());
    }
  }
 
  /** POST the selected pages to the backend and trigger a browser download. */
  async onExtractClicked(): Promise<void> {
    const pdf = this._uploadedPdf();
    if (pdf === null || this._selectedPages().size === 0) return;
 
    this._isExtracting.set(true);
 
    const sortedPages = [...this._selectedPages()].sort((a, b) => a - b);
    const dto: ExtractPagesRequestDto = { pages: sortedPages };
 
    try {
      const blob = await firstValueFrom(this.pdfApiService.extractPages(pdf.id, dto));
      this.triggerDownload(blob, `extracted_from_${pdf.originalName}`);
      this.toastService.success(
        `Downloaded ${sortedPages.length} page${sortedPages.length !== 1 ? 's' : ''} successfully.`,
      );
    } catch {
      // The HTTP interceptor already shows a toast; nothing extra needed here.
    } finally {
      this._isExtracting.set(false);
    }
  }
 
  /** Reset to the initial state so the user can upload a new file. */
  onResetClicked(): void {
    this.resetState();
  }
 
  // ── Private helpers ────────────────────────────────────────────────────── //
 
  private async uploadFile(file: File): Promise<void> {
    try {
      const response = await firstValueFrom(this.pdfApiService.uploadPdf(file));
      if (response.success && response.data !== undefined) {
        this._uploadedPdf.set(response.data);
      }
    } catch {
      // HTTP interceptor shows the toast; we reset state to let user retry.
      this.resetState();
    } finally {
      this._isUploading.set(false);
    }
  }
 
  private async renderThumbnailsProgressively(buffer: ArrayBuffer): Promise<void> {
    try {
      const total = await this.getPdfPageCount(buffer);
 
      // Pre-fill with empty strings so cards render as skeletons immediately
      this._thumbnailUrls.set(new Array<string>(total).fill(''));
 
      await this.pdfRenderService.renderAllPages(buffer, (index, dataUrl) => {
        this._thumbnailUrls.update((current) => {
          const next = [...current];
          next[index] = dataUrl;
          return next;
        });
        this._renderProgress.set(Math.round(((index + 1) / total) * 100));
      });
    } catch (err) {
      this.toastService.error(
        err instanceof Error ? err.message : 'Failed to render PDF previews.',
      );
    } finally {
      this._isRendering.set(false);
    }
  }
 
  /**
   * Load the PDF with PDF.js just to read numPages, then destroy immediately.
   * This runs before the full render so we can pre-fill the skeleton array.
   */
  private async getPdfPageCount(buffer: ArrayBuffer): Promise<number> {
    // Use a copy of the buffer — PDF.js detaches the original TypedArray
    const copy = buffer.slice(0);
    const pdf = await import('pdfjs-dist').then(({ getDocument }) =>
      getDocument({ data: new Uint8Array(copy) }).promise,
    );
    const count = pdf.numPages;
    await pdf.destroy();
    return count;
  }
 
  private readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(new Error('Failed to read the selected file.'));
      reader.readAsArrayBuffer(file);
    });
  }
 
  private triggerDownload(blob: Blob, suggestedName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = suggestedName.endsWith('.pdf') ? suggestedName : `${suggestedName}.pdf`;
    anchor.click();
    // Revoke after a brief delay to allow the browser to initiate the download
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
 
  private resetState(): void {
    this._uploadedPdf.set(null);
    this._thumbnailUrls.set([]);
    this._selectedPages.set(new Set<number>());
    this._isUploading.set(false);
    this._isRendering.set(false);
    this._isExtracting.set(false);
    this._renderProgress.set(0);
  }

}
