import { getTodayDateString } from './dateUtils';

const SESSION_KEYS = {
  DEVICE_TOKEN: 'dilkhoosh_device_token_v2',
  LAST_LOGIN_DATE: 'dilkhoosh_last_login_date_v2',
  LAST_LOGIN_TIME: 'dilkhoosh_last_login_time_v2',
  ACTIVE_SESSION: 'dilkhoosh_active_session_v2'
};

// 15 Minutes (900,000 ms) minimized timeout
export const MINIMIZE_TIMEOUT_MS = 15 * 60 * 1000;

// 5 Minutes (300,000 ms) idle inactivity timeout
export const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000;

export type LoginReason = 
  | 'first_login_today' 
  | 'new_device' 
  | 'minimized_timeout' 
  | 'inactivity_timeout' 
  | 'manual_logout' 
  | null;

/**
 * Retrieves or verifies device token stored in localStorage
 */
export const getDeviceToken = (): string | null => {
  try {
    return localStorage.getItem(SESSION_KEYS.DEVICE_TOKEN);
  } catch (e) {
    return null;
  }
};

/**
 * Checks if current device is new (no token registered)
 */
export const isNewDevice = (): boolean => {
  return !getDeviceToken();
};

/**
 * Checks if this is the user's first login attempt today
 */
export const isFirstLoginToday = (): boolean => {
  try {
    const lastDate = localStorage.getItem(SESSION_KEYS.LAST_LOGIN_DATE);
    return lastDate !== getTodayDateString();
  } catch (e) {
    return true;
  }
};

/**
 * Checks if active session flag is set
 */
export const isSessionActive = (): boolean => {
  try {
    return localStorage.getItem(SESSION_KEYS.ACTIVE_SESSION) === 'true';
  } catch (e) {
    return false;
  }
};

/**
 * Records successful PIN login and updates device and date tokens
 */
export const recordSuccessfulLogin = () => {
  try {
    let devToken = localStorage.getItem(SESSION_KEYS.DEVICE_TOKEN);
    if (!devToken) {
      devToken = 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem(SESSION_KEYS.DEVICE_TOKEN, devToken);
    }
    localStorage.setItem(SESSION_KEYS.LAST_LOGIN_DATE, getTodayDateString());
    localStorage.setItem(SESSION_KEYS.LAST_LOGIN_TIME, Date.now().toString());
    localStorage.setItem(SESSION_KEYS.ACTIVE_SESSION, 'true');
  } catch (e) {
    console.error('Session record error:', e);
  }
};

/**
 * Clears active session on logout or lock
 */
export const clearActiveSession = () => {
  try {
    localStorage.setItem(SESSION_KEYS.ACTIVE_SESSION, 'false');
  } catch (e) {
    console.error('Session clear error:', e);
  }
};
