import { EditSession, EditSessionStorage, EditSessionEvent, EditSessionError } from '../lib/interfaces/editSession';

/**
 * Session Storage Utilities
 * Handles encrypted/compressed storage of edit session data
 */

const STORAGE_KEY = 'app_session';
const SESSION_TIMEOUT = 1800000; // 30 minutes in milliseconds
const CLEANUP_INTERVAL = 300000; // 5 minutes in milliseconds
const STORAGE_VERSION = 1;

/**
 * Generate cryptographically secure session ID
 */
export const generateSessionId = (): string => {
  if (typeof window === 'undefined') return 'session_' + Math.random().toString(36).slice(2, 11);
  
  // Use crypto.randomUUID if available, fallback to crypto.getRandomValues
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  
  if (window.crypto?.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for older browsers
  return 'session_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

/**
 * Generate unique tab ID
 */
export const generateTabId = (): string => {
  return 'tab_' + Math.random().toString(36).slice(2, 9) + '_' + Date.now();
};

/**
 * Simple compression using JSON stringify with reduced whitespace
 */
const compress = (data: any): string => {
  return JSON.stringify(data);
};

/**
 * Simple decompression
 */
const decompress = (compressed: string): any => {
  return JSON.parse(compressed);
};

/**
 * Simple encryption using base64 encoding (for basic obfuscation)
 * Note: This is not cryptographically secure, just prevents casual inspection
 */
const encrypt = (data: string): string => {
  if (typeof window === 'undefined') return data;
  return btoa(data);
};

/**
 * Simple decryption
 */
const decrypt = (encrypted: string): string => {
  if (typeof window === 'undefined') return encrypted;
  try {
    return atob(encrypted);
  } catch (error) {
    throw new Error('Failed to decrypt session data');
  }
};

/**
 * Get default session storage structure
 */
const getDefaultStorage = (): EditSessionStorage => ({
  editSessions: {},
  activeTabId: generateTabId(),
  version: STORAGE_VERSION,
  lastCleanup: Date.now()
});

/**
 * Load session storage from localStorage
 */
export const loadSessionStorage = (): EditSessionStorage => {
  if (typeof window === 'undefined') return getDefaultStorage();
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return getDefaultStorage();
    
    const decrypted = decrypt(stored);
    const decompressed = decompress(decrypted);
    
    // Validate storage structure
    if (!decompressed || typeof decompressed !== 'object') {
      console.warn('Invalid session storage structure, resetting');
      return getDefaultStorage();
    }
    
    // Handle version migration if needed
    if (decompressed.version !== STORAGE_VERSION) {
      console.warn('Session storage version mismatch, resetting');
      return getDefaultStorage();
    }
    
    // Convert date strings back to Date objects
    Object.values(decompressed.editSessions || {}).forEach((session: any) => {
      if (session.startTime) session.startTime = new Date(session.startTime);
      if (session.expiresAt) session.expiresAt = new Date(session.expiresAt);
    });
    
    return {
      ...getDefaultStorage(),
      ...decompressed
    };
  } catch (error) {
    console.error('Failed to load session storage:', error);
    return getDefaultStorage();
  }
};

/**
 * Save session storage to localStorage
 */
export const saveSessionStorage = (storage: EditSessionStorage): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const compressed = compress(storage);
    const encrypted = encrypt(compressed);
    localStorage.setItem(STORAGE_KEY, encrypted);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.code === 22) {
      // Storage quota exceeded
      console.error('localStorage quota exceeded');
      return false;
    }
    console.error('Failed to save session storage:', error);
    return false;
  }
};

/**
 * Clear session storage
 */
export const clearSessionStorage = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Create new edit session
 */
export const createEditSession = (
  cartItemId: string,
  productSlug: string,
  originalSelectedOptionIds: string[] = []
): EditSession => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TIMEOUT);
  
  return {
    id: generateSessionId(),
    cartItemId,
    productSlug,
    originalSelectedOptionIds: [...originalSelectedOptionIds],
    currentSelectedOptionIds: [...originalSelectedOptionIds],
    startTime: now,
    expiresAt,
    tabId: generateTabId()
  };
};

/**
 * Check if session is expired
 */
export const isSessionExpired = (session: EditSession): boolean => {
  return new Date() > new Date(session.expiresAt);
};

/**
 * Clean up expired sessions
 */
export const cleanupExpiredSessions = (): string[] => {
  const storage = loadSessionStorage();
  const cleanedSessions: string[] = [];
  
  Object.entries(storage.editSessions).forEach(([sessionId, session]) => {
    if (isSessionExpired(session)) {
      delete storage.editSessions[sessionId];
      cleanedSessions.push(sessionId);
    }
  });
  
  if (cleanedSessions.length > 0) {
    storage.lastCleanup = Date.now();
    saveSessionStorage(storage);
  }
  
  return cleanedSessions;
};

/**
 * Cross-tab communication using BroadcastChannel
 */
class SessionBroadcaster {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: EditSessionEvent) => void)[] = [];
  
  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('hsm-edit-sessions');
      this.channel.addEventListener('message', this.handleMessage.bind(this));
    }
  }
  
  private handleMessage(event: MessageEvent<EditSessionEvent>) {
    this.listeners.forEach(listener => {
      try {
        listener(event.data);
      } catch (error) {
        console.error('Error in session broadcast listener:', error);
      }
    });
  }
  
  broadcast(event: EditSessionEvent) {
    if (this.channel) {
      this.channel.postMessage(event);
    }
  }
  
  subscribe(listener: (event: EditSessionEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  close() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners = [];
  }
}

// Singleton instance
let broadcaster: SessionBroadcaster | null = null;

export const getSessionBroadcaster = (): SessionBroadcaster => {
  if (!broadcaster) {
    broadcaster = new SessionBroadcaster();
  }
  return broadcaster;
};

/**
 * Cleanup broadcaster on page unload
 */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (broadcaster) {
      broadcaster.close();
    }
  });
}

/**
 * Automatic cleanup interval
 */
if (typeof window !== 'undefined') {
  setInterval(() => {
    const storage = loadSessionStorage();
    const timeSinceLastCleanup = Date.now() - storage.lastCleanup;
    
    if (timeSinceLastCleanup >= CLEANUP_INTERVAL) {
      const cleaned = cleanupExpiredSessions();
      if (cleaned.length > 0) {
        getSessionBroadcaster().broadcast({
          type: 'session_cleanup',
          cleanedSessions: cleaned
        });
      }
    }
  }, CLEANUP_INTERVAL);
}