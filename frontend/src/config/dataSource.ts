/**
 * Data Source Configuration
 * Controls whether to use backend API or local storage for data persistence
 */

const DATA_SOURCE_KEY = 'data_source_backend';

/**
 * Check if backend API mode is enabled
 * @returns true if backend API should be used, false for local storage
 */
export function isBackendEnabled(): boolean {
  const value = localStorage.getItem(DATA_SOURCE_KEY);
  return value === 'true';
}

/**
 * Enable or disable backend API mode
 * @param enabled - true to use backend API, false to use local storage
 */
export function setBackendEnabled(enabled: boolean): void {
  localStorage.setItem(DATA_SOURCE_KEY, enabled.toString());
  console.log(`[DataSource] Switched to ${enabled ? 'BACKEND API' : 'LOCAL STORAGE'} mode`);
}

/**
 * Get current data source mode as a string
 * @returns 'backend' or 'localStorage'
 */
export function getDataSourceMode(): 'backend' | 'localStorage' {
  return isBackendEnabled() ? 'backend' : 'localStorage';
}

