import { environment } from "../environments/environment";

export const base_url = `${environment.apiBaseUrl}/pdfs`;

export const API_ENDPOINTS = {
    UPLOAD_PDF: `${base_url}/upload`,

    GET_PDF_METADATA: (fileId: string) => `${base_url}/${fileId}/metadata`,

    GET_PDF_AS_ARRAY_BUFFER: (fileId: string) => `${base_url}/${fileId}`,

    EXTRACT_PAGES: (fileId: string) => `${base_url}/${fileId}/extract`,
} as const;
