import { Component, ElementRef, output, signal, ViewChild } from "@angular/core";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
@Component({
    selector: "app-upload-zone",
    imports: [],
    templateUrl: "./upload-zone.component.html",
    styleUrl: "./upload-zone.component.scss",
})
export class UploadZoneComponent {
    @ViewChild("fileInput") private readonly fileInputRef!: ElementRef<HTMLInputElement>;

    /** Emits once a valid PDF File is chosen by the user. */
    readonly fileSelected = output<File>();

    protected readonly isDragOver = signal<boolean>(false);
    protected readonly validationError = signal<string | null>(null);

    protected onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    protected onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    protected onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        const file = event.dataTransfer?.files?.[0];
        if (file !== undefined) {
            this.processFile(file);
        }
    }

    protected onFileInputChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file !== undefined) {
            this.processFile(file);
        }
        // Reset so the same file can be re-selected if the user dismisses and re-opens
        input.value = "";
    }

    protected openFileBrowser(): void {
        this.fileInputRef.nativeElement.click();
    }

    protected handleKeyDown(event: KeyboardEvent): void {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.openFileBrowser();
        }
    }

    private processFile(file: File): void {
        this.validationError.set(null);

        const error = this.validateFile(file);
        if (error !== null) {
            this.validationError.set(error);
            return;
        }

        this.fileSelected.emit(file);
    }

    private validateFile(file: File): string | null {
        if (file.type !== "application/pdf") {
            return `"${file.name}" is not a PDF file. Please upload a .pdf document.`;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
            return `File size (${sizeMb} MB) exceeds the 50 MB limit.`;
        }

        if (file.size === 0) {
            return "The selected file is empty.";
        }

        return null;
    }
}
