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
  duplicateCards?: number;
  duplicateDetails?: {
    row: number;
    cardFront: string;
    existingCardFront: string;
  }[];
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

export interface ConfirmImportRequest {
  importId: string;
}

export interface CancelImportRequest {
  importId: string;
}

export interface CancelImportResponse {
  status: string;
  data: {
    message: string;
  };
}

export interface ConfirmImportResponse {
  status: string;
  data: {
    importId: string;
    status: 'completed' | 'failed';
    summary: {
      totalRows: number;
      validRows: number;
      invalidRows: number;
      errors?: ImportError[];
    };
  };
}

export interface ImportHistoryItem {
  id: string;
  deckId: string;
  status: 'pending' | 'completed' | 'failed';
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors?: ImportError[];
    skippedHeaderRows?: number[];
  };
  createdAt: string;
  expiresAt: string;
}

export interface ImportHistoryResponse {
  status: string;
  data: {
    imports: ImportHistoryItem[];
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
   * Confirm an import
   */
  async confirmImport(data: ConfirmImportRequest): Promise<ApiResponse<ConfirmImportResponse>> {
    return apiClient.post<ConfirmImportResponse>(API_ENDPOINTS.imports.confirm, data);
  }

  /**
   * Cancel an import
   */
  async cancelImport(data: CancelImportRequest): Promise<ApiResponse<CancelImportResponse>> {
    return apiClient.post<CancelImportResponse>(API_ENDPOINTS.imports.cancel, data);
  }

  /**
   * Get import history
   * @param limit Maximum number of imports to return (default: 10, max: 50)
   */
  async getImportHistory(limit: number = 10): Promise<ApiResponse<ImportHistoryResponse>> {
    return apiClient.get<ImportHistoryResponse>(`${API_ENDPOINTS.imports.history}?limit=${limit}`);
  }
}

// Create and export a default instance
export const importService = new ImportService(); 