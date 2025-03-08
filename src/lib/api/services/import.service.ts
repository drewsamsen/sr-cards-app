import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for import preview
export interface ImportPreviewRequest {
  deckId: string;
  csvData: string;
}

export interface ImportRowPreview {
  front: string;
  back: string;
  status: 'valid' | 'invalid';
  error?: string;
}

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors?: ImportError[];
}

export interface ImportPreview {
  id: string;
  deckId: string;
  status: 'pending' | 'completed' | 'failed';
  summary: ImportSummary;
  expiresAt: string;
}

export interface ImportPreviewResponse {
  status: string;
  data: {
    import: ImportPreview;
    preview: ImportRowPreview[];
  };
}

export interface ExecuteImportRequest {
  importId: string;
}

export interface ExecuteImportResponse {
  status: string;
  data: {
    import: {
      id: string;
      deckId: string;
      status: 'completed';
      summary: {
        totalRows: number;
        importedRows: number;
        skippedRows: number;
      };
      completedAt: string;
    };
  };
}

/**
 * Import service for handling import-related API calls
 */
export class ImportService {
  /**
   * Create an import preview
   */
  async createImportPreview(data: ImportPreviewRequest): Promise<ApiResponse<ImportPreviewResponse>> {
    return apiClient.post<ImportPreviewResponse>(API_ENDPOINTS.imports.preview, data);
  }

  /**
   * Execute an import
   */
  async executeImport(data: ExecuteImportRequest): Promise<ApiResponse<ExecuteImportResponse>> {
    return apiClient.post<ExecuteImportResponse>(API_ENDPOINTS.imports.execute, data);
  }
}

// Create and export a default instance
export const importService = new ImportService(); 