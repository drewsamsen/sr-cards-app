import { apiClient, ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Types for user settings
export interface FSRSParams {
  requestRetention: number;
  maximumInterval: number;
  w: number[];
  enableFuzz: boolean;
  enableShortTerm: boolean;
}

export interface UserNotifications {
  enabled: boolean;
  reminderTime: string;
  reminderDays: string[];
}

export interface LearningSettings {
  newCardsPerDay?: number;
  maxReviewsPerDay?: number;
}

export interface UserSettings {
  theme: string;
  showAnswerTimer: boolean;
  notifications: UserNotifications;
  fsrsParams: FSRSParams;
  learning: LearningSettings;
}

export interface UserSettingsResponse {
  id: string;
  userId: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettingsApiResponse {
  status: string;
  data: {
    settings: UserSettingsResponse;
  };
}

/**
 * User service for handling user-related API calls
 */
export class UserService {
  /**
   * Get user settings
   */
  async getUserSettings(): Promise<ApiResponse<UserSettingsApiResponse>> {
    return apiClient.get<UserSettingsApiResponse>(API_ENDPOINTS.users.settings);
  }

  /**
   * Update user settings
   */
  async updateUserSettings(settings: Partial<UserSettings>): Promise<ApiResponse<UserSettingsApiResponse>> {
    return apiClient.put<UserSettingsApiResponse>(API_ENDPOINTS.users.settings, { settings });
  }
}

// Create and export a default instance
export const userService = new UserService(); 