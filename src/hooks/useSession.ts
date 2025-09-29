import { useSession as useSessionContext } from '../contexts/SessionContext';

// Re-export the main session hook for convenience
export const useSession = useSessionContext;

// Additional convenience hooks for specific session data
export const useTheme = () => {
  const { session, updateSession } = useSessionContext();
  
  return {
    theme: session.theme,
    setTheme: (theme: 'light' | 'dark' | 'auto') => 
      updateSession({ theme })
  };
};

export const useRecentlyViewed = () => {
  const { session, addToRecentlyViewed } = useSessionContext();
  
  return {
    recentlyViewed: session.recentlyViewedProducts,
    addToRecentlyViewed
  };
};

export const useWishlist = () => {
  const { session, addToWishlist, removeFromWishlist } = useSessionContext();
  
  return {
    wishlist: session.wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist: (productSlug: string) => session.wishlist.includes(productSlug)
  };
};

export const useNotifications = () => {
  const { session, addNotification, removeNotification, clearNotifications } = useSessionContext();
  
  return {
    notifications: session.notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    unreadCount: session.notifications.length
  };
};

export const useFormPersistence = () => {
  const { saveFormData, getFormData, clearFormData } = useSessionContext();
  
  return {
    saveFormData,
    getFormData,
    clearFormData
  };
};

export const useNavigationState = () => {
  const { session, updateSession } = useSessionContext();
  
  return {
    lastVisitedPage: session.lastVisitedPage,
    breadcrumbs: session.breadcrumbs,
    updateLastVisitedPage: (page: string) => 
      updateSession({ lastVisitedPage: page }),
    updateBreadcrumbs: (breadcrumbs: string[]) => 
      updateSession({ breadcrumbs })
  };
};

export const useAppState = () => {
  const { session, updateSession } = useSessionContext();
  
  return {
    sidebarCollapsed: session.sidebarCollapsed,
    toggleSidebar: () => 
      updateSession({ sidebarCollapsed: !session.sidebarCollapsed }),
    setSidebarCollapsed: (collapsed: boolean) => 
      updateSession({ sidebarCollapsed: collapsed })
  };
};

export const useSessionPersistence = () => {
  const { session, clearSession } = useSessionContext();
  
  return {
    sessionId: session.cartSessionId,
    clearSession,
    isSessionActive: !!session.cartSessionId
  };
};