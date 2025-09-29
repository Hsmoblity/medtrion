import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { EditSession, EditSessionEvent } from '../lib/interfaces/editSession';
import { 
  loadSessionStorage, 
  saveSessionStorage, 
  createEditSession, 
  isSessionExpired,
  cleanupExpiredSessions,
  getSessionBroadcaster 
} from '../utils/sessionStorage';

// Session data interface
interface SessionData {
  // User preferences
  theme: 'light' | 'dark' | 'auto';
  language: string;
  
  // Navigation state
  lastVisitedPage: string;
  breadcrumbs: string[];
  
  // Product interaction
  recentlyViewedProducts: string[];
  wishlist: string[];
  
  // Cart persistence (complement existing Zustand store)
  cartSessionId: string;
  
  // Form data persistence
  formData: Record<string, any>;
  
  // App state
  sidebarCollapsed: boolean;
  notifications: Array<{
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: number;
  }>;
}

// Default session state
const defaultSession: SessionData = {
  theme: 'auto',
  language: 'en',
  lastVisitedPage: '/',
  breadcrumbs: [],
  recentlyViewedProducts: [],
  wishlist: [],
  cartSessionId: '',
  formData: {},
  sidebarCollapsed: false,
  notifications: []
};

// Session context type
interface SessionContextType {
  session: SessionData;
  updateSession: (updates: Partial<SessionData>) => void;
  clearSession: () => void;
  addToRecentlyViewed: (productSlug: string) => void;
  addToWishlist: (productSlug: string) => void;
  removeFromWishlist: (productSlug: string) => void;
  addNotification: (notification: Omit<SessionData['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  saveFormData: (formId: string, data: any) => void;
  getFormData: (formId: string) => any;
  clearFormData: (formId: string) => void;
  
  // Edit Session Management
  startEditSession: (cartItemId: string, productSlug: string, originalSelectedOptionIds?: string[]) => Promise<EditSession | null>;
  stopEditSession: (sessionId: string, saveChanges?: boolean) => Promise<boolean>;
  getActiveEditSession: () => EditSession | null;
  updateEditSession: (sessionId: string, updates: Partial<EditSession>) => void;
  subscribeToSessionUpdates: (callback: (event: EditSessionEvent) => void) => () => void;
}

// Create context
const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Session storage key - updated to align with edit session storage
const SESSION_STORAGE_KEY = 'hsm-session-data';

// Session provider component
interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<SessionData>(defaultSession);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeEditSession, setActiveEditSession] = useState<EditSession | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsedSession = JSON.parse(stored);
        setSession({ ...defaultSession, ...parsedSession });
      } else {
        // Generate new cart session ID if none exists
        const newSession = {
          ...defaultSession,
          cartSessionId: 'session_' + Math.random().toString(36).slice(2, 9)
        };
        setSession(newSession);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      }
    } catch (error) {
      console.warn('Failed to load session from localStorage:', error);
      setSession(defaultSession);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save session to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized || typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.warn('Failed to save session to localStorage:', error);
    }
  }, [session, isInitialized]);

  // Update session data
  const updateSession = (updates: Partial<SessionData>) => {
    setSession(prev => ({ ...prev, ...updates }));
  };

  // Clear entire session
  const clearSession = () => {
    const clearedSession = {
      ...defaultSession,
      cartSessionId: 'session_' + Math.random().toString(36).slice(2, 9)
    };
    setSession(clearedSession);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(clearedSession));
    }
  };

  // Add product to recently viewed (max 20 items)
  const addToRecentlyViewed = (productSlug: string) => {
    setSession(prev => ({
      ...prev,
      recentlyViewedProducts: [
        productSlug,
        ...prev.recentlyViewedProducts.filter(slug => slug !== productSlug)
      ].slice(0, 20)
    }));
  };

  // Add product to wishlist
  const addToWishlist = (productSlug: string) => {
    setSession(prev => ({
      ...prev,
      wishlist: prev.wishlist.includes(productSlug) 
        ? prev.wishlist 
        : [...prev.wishlist, productSlug]
    }));
  };

  // Remove product from wishlist
  const removeFromWishlist = (productSlug: string) => {
    setSession(prev => ({
      ...prev,
      wishlist: prev.wishlist.filter(slug => slug !== productSlug)
    }));
  };

  // Add notification
  const addNotification = (notification: Omit<SessionData['notifications'][0], 'id' | 'timestamp'>) => {
    const newNotification = {
      ...notification,
      id: 'notif_' + Math.random().toString(36).slice(2, 9),
      timestamp: Date.now()
    };
    
    setSession(prev => ({
      ...prev,
      notifications: [...prev.notifications, newNotification]
    }));
  };

  // Remove notification
  const removeNotification = (id: string) => {
    setSession(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notif => notif.id !== id)
    }));
  };

  // Clear all notifications
  const clearNotifications = () => {
    setSession(prev => ({ ...prev, notifications: [] }));
  };

  // Save form data
  const saveFormData = (formId: string, data: any) => {
    setSession(prev => ({
      ...prev,
      formData: { ...prev.formData, [formId]: data }
    }));
  };

  // Get form data
  const getFormData = (formId: string) => {
    return session.formData[formId] || null;
  };

  // Clear form data
  const clearFormData = (formId: string) => {
    setSession(prev => {
      const newFormData = { ...prev.formData };
      delete newFormData[formId];
      return { ...prev, formData: newFormData };
    });
  };

  // Edit Session Management Methods
  
  // Start new edit session
  const startEditSession = async (
    cartItemId: string, 
    productSlug: string, 
    originalSelectedOptionIds: string[] = []
  ): Promise<EditSession | null> => {
    try {
      // Clean up expired sessions first
      cleanupExpiredSessions();
      
      // Load current storage
      const storage = loadSessionStorage();
      
      // Check if there's already an active session for this cart item
      const existingSession = Object.values(storage.editSessions).find(
        session => session.cartItemId === cartItemId && !isSessionExpired(session)
      );
      
      if (existingSession) {
        setActiveEditSession(existingSession);
        return existingSession;
      }
      
      // Create new session
      const newSession = createEditSession(cartItemId, productSlug, originalSelectedOptionIds);
      
      // Save to storage
      storage.editSessions[newSession.id] = newSession;
      const saved = saveSessionStorage(storage);
      
      if (!saved) {
        addNotification({
          type: 'error',
          message: 'Unable to start edit session. Storage may be full.'
        });
        return null;
      }
      
      setActiveEditSession(newSession);
      
      // Broadcast session creation
      getSessionBroadcaster().broadcast({
        type: 'session_updated',
        sessionId: newSession.id,
        session: newSession
      });
      
      return newSession;
    } catch (error) {
      console.error('Failed to start edit session:', error);
      addNotification({
        type: 'error',
        message: 'Failed to start edit session'
      });
      return null;
    }
  };

  // Stop edit session
  const stopEditSession = async (sessionId: string, saveChanges: boolean = false): Promise<boolean> => {
    try {
      const storage = loadSessionStorage();
      const session = storage.editSessions[sessionId];
      
      if (!session) {
        console.warn('Session not found:', sessionId);
        return false;
      }
      
      // Clear from storage
      delete storage.editSessions[sessionId];
      const saved = saveSessionStorage(storage);
      
      // Clear active session if it matches
      if (activeEditSession?.id === sessionId) {
        setActiveEditSession(null);
      }
      
      // Broadcast session expiry
      getSessionBroadcaster().broadcast({
        type: 'session_expired',
        sessionId
      });
      
      return saved;
    } catch (error) {
      console.error('Failed to stop edit session:', error);
      return false;
    }
  };

  // Get active edit session
  const getActiveEditSession = (): EditSession | null => {
    if (activeEditSession && isSessionExpired(activeEditSession)) {
      setActiveEditSession(null);
      return null;
    }
    return activeEditSession;
  };

  // Update edit session
  const updateEditSession = (sessionId: string, updates: Partial<EditSession>): void => {
    try {
      const storage = loadSessionStorage();
      const session = storage.editSessions[sessionId];
      
      if (!session) {
        console.warn('Session not found for update:', sessionId);
        return;
      }
      
      // Update session
      const updatedSession = { ...session, ...updates };
      storage.editSessions[sessionId] = updatedSession;
      saveSessionStorage(storage);
      
      // Update active session if it matches
      if (activeEditSession?.id === sessionId) {
        setActiveEditSession(updatedSession);
      }
      
      // Broadcast update
      getSessionBroadcaster().broadcast({
        type: 'session_updated',
        sessionId,
        session: updatedSession
      });
    } catch (error) {
      console.error('Failed to update edit session:', error);
    }
  };

  // Subscribe to session updates from other tabs
  const subscribeToSessionUpdates = (callback: (event: EditSessionEvent) => void): (() => void) => {
    return getSessionBroadcaster().subscribe(callback);
  };

  // Load active edit session on mount
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      const storage = loadSessionStorage();
      
      // Find any active session for this tab or the most recent one
      const activeSessions = Object.values(storage.editSessions).filter(
        session => !isSessionExpired(session)
      );
      
      if (activeSessions.length > 0) {
        // Use the most recent session
        const mostRecent = activeSessions.reduce((latest, current) => 
          new Date(current.startTime) > new Date(latest.startTime) ? current : latest
        );
        setActiveEditSession(mostRecent);
      }
    } catch (error) {
      console.error('Failed to load active edit session:', error);
    }
  }, [isInitialized]);

  const contextValue: SessionContextType = {
    session,
    updateSession,
    clearSession,
    addToRecentlyViewed,
    addToWishlist,
    removeFromWishlist,
    addNotification,
    removeNotification,
    clearNotifications,
    saveFormData,
    getFormData,
    clearFormData,
    startEditSession,
    stopEditSession,
    getActiveEditSession,
    updateEditSession,
    subscribeToSessionUpdates
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
};

// Custom hook to use session context
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export default SessionContext;