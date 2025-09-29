import { CartProduct } from './cart';

/**
 * Edit Session Interface
 * Manages user sessions for editing cart item configurations
 */
export interface EditSession {
  /** Unique session identifier */
  id: string;
  
  /** ID of the cart item being edited */
  cartItemId: string;
  
  /** Product slug for the item being edited */
  productSlug: string;
  
  /** Original selected option IDs when edit session started */
  originalSelectedOptionIds: string[];
  
  /** Current selected option IDs during editing */
  currentSelectedOptionIds: string[];
  
  /** Timestamp when session was created */
  startTime: Date;
  
  /** Timestamp when session expires */
  expiresAt: Date;
  
  /** Browser tab ID that initiated the session */
  tabId: string;
}

/**
 * Edit Session Storage Structure
 * Stored in localStorage under "app_session" key
 */
export interface EditSessionStorage {
  /** Map of session ID to edit session data */
  editSessions: Record<string, EditSession>;
  
  /** Current active tab ID */
  activeTabId: string;
  
  /** Storage version for future migrations */
  version: number;
  
  /** Last cleanup timestamp */
  lastCleanup: number;
}

/**
 * Cart Item Update Payload
 * Data structure for updating cart items after editing
 */
export interface CartItemUpdate {
  /** ID of the cart item to update */
  cartItemId: string;
  
  /** Updated selected option IDs */
  selectedOptionIds: string[];
  
  /** Updated total price including options */
  updatedPrice: number;
  
  /** Updated product name/title with options */
  updatedName: string;
  
  /** Updated options array with pricing */
  options?: Array<{
    id: string;
    name: string;
    price: number;
    categoryId?: string;
  }>;
}

/**
 * Edit Session Event Types
 * For cross-tab communication
 */
export type EditSessionEvent = 
  | { type: 'session_updated'; sessionId: string; session: EditSession }
  | { type: 'session_expired'; sessionId: string }
  | { type: 'cart_updated'; cartItemId: string; updates: CartItemUpdate }
  | { type: 'session_cleanup'; cleanedSessions: string[] };

/**
 * Edit Session Status
 * Tracks the current state of an edit session
 */
export type EditSessionStatus = 'idle' | 'active' | 'saving' | 'expired' | 'error';

/**
 * Edit Session Error Types
 */
export interface EditSessionError {
  type: 'storage_quota' | 'corrupted_data' | 'session_expired' | 'network_error' | 'validation_error';
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}