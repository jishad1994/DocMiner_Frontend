import { Component, input, output } from '@angular/core';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-action-bar',
  imports: [SpinnerComponent],
  templateUrl: './action-bar.component.html',
  styleUrl: './action-bar.component.scss'
})
export class ActionBarComponent {
/** Number of pages currently selected. */
  readonly selectedCount = input.required<number>();
 
  /** Total number of pages in the PDF. */
  readonly totalPages = input.required<number>();
 
  /** True while the backend is processing the extraction request. */
  readonly isExtracting = input<boolean>(false);
 
  /** True while the PDF is still uploading to the backend. */
  readonly isUploading = input<boolean>(false);
 
  /** True while page thumbnails are being rendered. */
  readonly isRendering = input<boolean>(false);
 
  /** Fired when the user clicks "Extract & Download". */
  readonly extractClicked = output<void>();
 
  /** Fired when the user clicks "Upload new file". */
  readonly resetClicked = output<void>();
 
  protected get canExtract(): boolean {
    return (
      this.selectedCount() > 0 &&
      !this.isExtracting() &&
      !this.isUploading()
    );
  }
 
  protected onExtractClick(): void {
    this.extractClicked.emit();
  }
 
  protected onResetClick(): void {
    this.resetClicked.emit();
  }
}
