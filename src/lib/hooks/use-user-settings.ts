import { useState, useEffect } from 'react';
import { userService, UserSettingsResponse, UserSettings, FSRSParams } from '../api/services/user.service';
import { useAuth } from './useAuth';

interface UseUserSettingsReturn {
  settings: UserSettingsResponse | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  updateFSRSParams: (newParams: Partial<FSRSParams>) => Promise<void>;
}

export function useUserSettings(): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettingsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isInitialized } = useAuth();

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userService.getUserSettings();
      
      if (response.data.status === 'success') {
        setSettings(response.data.data.settings);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      setError('An error occurred while fetching settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userService.updateUserSettings(newSettings);
      
      if (response.data.status === 'success') {
        setSettings(response.data.data.settings);
      } else {
        setError('Failed to update settings');
      }
    } catch (err) {
      setError('An error occurred while updating settings');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFSRSParams = async (newParams: Partial<FSRSParams>) => {
    if (!settings || !settings.settings || !settings.settings.fsrsParams) return;
    
    const updatedSettings: Partial<UserSettings> = {
      fsrsParams: {
        ...settings.settings.fsrsParams,
        ...newParams
      }
    };
    
    await updateSettings(updatedSettings);
  };

  useEffect(() => {
    if (isInitialized && user) {
      fetchSettings();
    }
  }, [isInitialized, user]);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    updateFSRSParams
  };
} 