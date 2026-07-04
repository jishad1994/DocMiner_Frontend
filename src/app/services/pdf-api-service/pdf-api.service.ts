import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiResponseDto } from "../../dtos/api-response.dto";
import { UploadPdfResponseDto } from "../../dtos/upload-pdf.response.dto";
import { ExtractPagesRequestDto } from "../../dtos/extract-pages-request.dto";
import { API_ENDPOINTS } from "../../constants/api-endpoints.constants";

@Injectable({
    providedIn: "root",
})
export class PdfApiService {
  
    private readonly http = inject(HttpClient);

    uploadPdf(file: File): Observable<ApiResponseDto<UploadPdfResponseDto>> {
        const formData = new FormData();
        formData.append("file", file);
        return this.http.post<ApiResponseDto<UploadPdfResponseDto>>(API_ENDPOINTS.UPLOAD_PDF, formData);
    }

    getPdfMetadata(fileId: string): Observable<ApiResponseDto<UploadPdfResponseDto>> {
        return this.http.get<ApiResponseDto<UploadPdfResponseDto>>(API_ENDPOINTS.GET_PDF_METADATA(fileId));
    }

    getPdfAsArrayBuffer(fileId: string): Observable<ArrayBuffer> {
        return this.http.get(API_ENDPOINTS.GET_PDF_AS_ARRAY_BUFFER(fileId), {
            responseType: "arraybuffer",
        });
    }

    extractPages(fileId: string, dto: ExtractPagesRequestDto): Observable<Blob> {
        return this.http.post(API_ENDPOINTS.EXTRACT_PAGES(fileId), dto, {
            responseType: "blob",
        });
    }
}
