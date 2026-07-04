
export interface UploadPdfResponseDto {
  readonly id: string;
  readonly originalName: string;
  readonly fileSize: number;
  readonly totalPages: number;
  readonly mimeType: string;
  readonly uploadedAt: string; // ISO 8601
}
 