import { Component, computed, input, output } from "@angular/core";
import { UploadPdfResponseDto } from "../../dtos/upload-pdf.response.dto";
import { PageCardComponent } from "../page-card/page-card.component";

@Component({
    selector: "app-page-grid",
    imports: [PageCardComponent],
    templateUrl: "./page-grid.component.html",
    styleUrl: "./page-grid.component.scss",
})
export class PageGridComponent {
    readonly pdfMetadata = input.required<UploadPdfResponseDto>();

    readonly thumbnailUrls = input.required<string[]>();

    readonly selectedPages = input.required<ReadonlySet<number>>();

    readonly isRendering = input<boolean>(false);

    readonly renderProgress = input<number>(0);

    readonly pageToggled = output<number>();

    readonly selectAllToggled = output<boolean>();

    protected readonly pageNumbers = computed<number[]>(() => {
        const total = this.pdfMetadata().totalPages;
        return Array.from({ length: total }, (_, i) => i + 1);
    });

    protected readonly allSelected = computed<boolean>(() => {
        const total = this.pdfMetadata().totalPages;
        return this.selectedPages().size === total && total > 0;
    });

    protected readonly selectedCount = computed<number>(() => this.selectedPages().size);

    protected isPageSelected(pageNumber: number): boolean {
        return this.selectedPages().has(pageNumber);
    }

    protected isPageRendering(pageIndex: number): boolean {
        return this.thumbnailUrls()[pageIndex] === undefined || this.thumbnailUrls()[pageIndex] === "";
    }

    protected thumbnailAt(pageIndex: number): string {
        return this.thumbnailUrls()[pageIndex] ?? "";
    }

    protected onPageToggled(pageNumber: number): void {
        this.pageToggled.emit(pageNumber);
    }

    protected onSelectAll(): void {
        this.selectAllToggled.emit(true);
    }

    protected onDeselectAll(): void {
        this.selectAllToggled.emit(false);
    }
}
