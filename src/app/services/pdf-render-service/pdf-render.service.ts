import { Injectable } from "@angular/core";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy, PDFPageProxy, PageViewport } from "pdfjs-dist";
export type PageRenderedCallback = (pageIndex: number, dataUrl: string) => void;

@Injectable({
    providedIn: "root",
})
export class PdfRenderService {
    private static readonly WORKER_SRC = "/assets/pdf.worker.min.mjs";

    /** Thumbnail scale factor. 0.5 ≈ half the PDF's native resolution. */
    private static readonly THUMBNAIL_SCALE = 0.5;

    constructor() {
        pdfjs.GlobalWorkerOptions.workerSrc = PdfRenderService.WORKER_SRC;
    }

    /**
     * Render every page of the PDF as a JPEG data URL.
     *
     * @param arrayBuffer  — Raw PDF bytes (e.g. from FileReader or HTTP arraybuffer).
     * @param onPageRendered — Optional callback fired after each page (for progress UI).
     * @returns Ordered array of data URL strings, one per page.
     */
    async renderAllPages(arrayBuffer: ArrayBuffer, onPageRendered?: PageRenderedCallback): Promise<string[]> {
        const typedArray = new Uint8Array(arrayBuffer);
        const loadingTask = pdfjs.getDocument({ data: typedArray });
        const pdfDocument: PDFDocumentProxy = await loadingTask.promise;

        const totalPages = pdfDocument.numPages;
        const thumbnails: string[] = new Array<string>(totalPages);

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
            const dataUrl = await this.renderSinglePage(pdfDocument, pageNumber);
            const index = pageNumber - 1;
            thumbnails[index] = dataUrl;
            onPageRendered?.(index, dataUrl);
        }

        await pdfDocument.destroy();

        return thumbnails;
    }

    private async renderSinglePage(pdfDocument: PDFDocumentProxy, pageNumber: number): Promise<string> {
        const page: PDFPageProxy = await pdfDocument.getPage(pageNumber);

        const viewport: PageViewport = page.getViewport({
            scale: PdfRenderService.THUMBNAIL_SCALE,
        });

        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const context = canvas.getContext("2d");
        if (context === null) {
            throw new Error(`Failed to acquire 2D rendering context for page ${pageNumber}.`);
        }

        await page.render({ canvas, canvasContext: context, viewport }).promise;

        // Free page resources before moving on
        page.cleanup();

        return canvas.toDataURL("image/jpeg", 0.82);
    }
}
