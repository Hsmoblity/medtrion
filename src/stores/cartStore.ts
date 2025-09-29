import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartProduct } from 'lib/interfaces'

// Generate unique cart item ID
const generateCartItemId = (): string => 
  'ci_' + Math.random().toString(36).slice(2, 9)

// Edit status for cart items
type EditStatus = 'idle' | 'editing' | 'saving';

interface CartStore {
  // State
  cart: CartProduct[]
  cartVisibility: boolean
  editStatuses: Record<string, EditStatus>
  isHydrated: boolean
  
  // Cart Actions
  addToCart: (product: Omit<CartProduct, 'cartItemId'>) => void
  removeFromCart: (cartItemId: string | number | null) => void
  removeSingleItem: (cartItemId: string | number | null) => void
  updateCartItem: (cartItemId: string | number | null, updates: Partial<CartProduct>) => void
  updateQuantity: (cartItemId: string | number | null, quantity: number) => void
  clearCart: () => void
  bulkAddToCart: (products: Omit<CartProduct, 'cartItemId'>[]) => void
  
  // UI Actions
  toggleCartVisibility: () => void
  setCartVisibility: (visible: boolean) => void
  setHydrated: () => void
  
  // Edit-specific Actions
  findCartItemById: (cartItemId: string) => CartProduct | undefined
  getEditStatus: (cartItemId: string) => EditStatus
  setEditStatus: (cartItemId: string, status: EditStatus) => void
  updateCartItemSafe: (cartItemId: string, updates: Partial<CartProduct>, rollback?: () => void) => boolean
  
  // Computed Values
  getCartTotal: () => number
  getCartCount: () => number
  getCartSubtotal: () => number
  findCartItem: (cartItemId: string | number | null) => CartProduct | undefined
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      // Initial State
      cart: [],
      cartVisibility: false,
      editStatuses: {},
      isHydrated: false,
      
      // Cart Actions
      addToCart: (product) => set((state) => {
        const cartItemId = generateCartItemId()
        const newItem: CartProduct = {
          ...product,
          cartItemId,
          quantity: product.quantity || 1
        }
        return {
          cart: [...state.cart, newItem]
        }
      }),
      
      removeFromCart: (cartItemId) => set((state) => ({
        cart: state.cart.filter(item => String(item.cartItemId) !== String(cartItemId))
      })),
      
      removeSingleItem: (cartItemId) => set((state) => ({
        cart: state.cart.map(item => {
          if (String(item.cartItemId) === String(cartItemId)) {
            const newQuantity = (item.quantity || 1) - 1
            return newQuantity <= 0 
              ? null // Will be filtered out
              : { ...item, quantity: newQuantity }
          }
          return item
        }).filter(Boolean) as CartProduct[]
      })),
      
      updateCartItem: (cartItemId, updates) => set((state) => ({
        cart: state.cart.map(item => 
          String(item.cartItemId) === String(cartItemId)
            ? { ...item, ...updates }
            : item
        )
      })),
      
      updateQuantity: (cartItemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            cart: state.cart.filter(item => item.cartItemId !== cartItemId)
          }
        }
        return {
          cart: state.cart.map(item => 
            item.cartItemId === cartItemId 
              ? { ...item, quantity }
              : item
          )
        }
      }),
      
      clearCart: () => set({ cart: [] }),
      
      bulkAddToCart: (products) => set((state) => {
        const newItems = products.map(product => ({
          ...product,
          cartItemId: generateCartItemId(),
          quantity: product.quantity || 1
        }))
        return {
          cart: [...state.cart, ...newItems]
        }
      }),
      
      // UI Actions
      toggleCartVisibility: () => set((state) => ({
        cartVisibility: !state.cartVisibility
      })),
      
      setCartVisibility: (visible) => set({
        cartVisibility: visible
      }),
      
      setHydrated: () => set({
        isHydrated: true
      }),
      
      // Edit-specific Actions
      findCartItemById: (cartItemId) => {
        const { cart } = get()
        return cart.find(item => String(item.cartItemId) === String(cartItemId))
      },
      
      getEditStatus: (cartItemId) => {
        const { editStatuses } = get()
        return editStatuses[cartItemId] || 'idle'
      },
      
      setEditStatus: (cartItemId, status) => set((state) => ({
        editStatuses: { ...state.editStatuses, [cartItemId]: status }
      })),
      
      updateCartItemSafe: (cartItemId, updates, rollback) => {
        try {
          const { cart } = get()
          const itemIndex = cart.findIndex(item => String(item.cartItemId) === String(cartItemId))
          
          if (itemIndex === -1) {
            console.warn('Cart item not found for update:', cartItemId)
            return false
          }
          
          // Store original item for potential rollback
          const originalItem = { ...cart[itemIndex] }
          
          // Apply optimistic update
          set((state) => ({
            cart: state.cart.map(item => 
              String(item.cartItemId) === String(cartItemId)
                ? { ...item, ...updates }
                : item
            )
          }))
          
          // If rollback function is provided, it can be called later if needed
          if (rollback) {
            // Store rollback function for potential use
            (window as any).__cartRollback = () => {
              set((state) => ({
                cart: state.cart.map(item => 
                  String(item.cartItemId) === String(cartItemId)
                    ? originalItem
                    : item
                )
              }))
            }
          }
          
          return true
        } catch (error) {
          console.error('Failed to update cart item:', error)
          if (rollback) rollback()
          return false
        }
      },
      
      // Computed Values
      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => {
          const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0)
          const quantity = item.quantity || 1
          
          // Add option prices if any
          let optionPrice = 0
          if (item.options && Array.isArray(item.options)) {
            optionPrice = item.options.reduce((sum, option: any) => {
              const optPrice = typeof option.price === 'number' ? option.price : Number(option.price || 0)
              return sum + optPrice
            }, 0)
          }
          
          return total + ((basePrice + optionPrice) * quantity)
        }, 0)
      },
      
      getCartCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + (item.quantity || 1), 0)
      },
      
      getCartSubtotal: () => {
        const { cart } = get()
        return cart.reduce((subtotal, item) => {
          const basePrice = typeof item.price === 'number' ? item.price : Number(item.price || 0)
          const quantity = item.quantity || 1
          return subtotal + (basePrice * quantity)
        }, 0)
      },
      
      findCartItem: (cartItemId) => {
        const { cart } = get()
        return cart.find(item => item.cartItemId === cartItemId)
      }
    }),
    {
      name: 'hsm-cart-storage', // Storage key (replaces your cookie logic)
      partialize: (state) => ({ 
        cart: state.cart // Only persist cart data, not UI state
      }),
      version: 1, // For future migrations
      skipHydration: true, // Prevent automatic hydration to avoid SSR mismatches
      onRehydrateStorage: () => (state) => {
        // Mark as hydrated after rehydration completes
        if (state) {
          state.isHydrated = true
        }
      }
    }
  )
)

// Selectors for better performance with hydration safety
export const useCartCount = () => {
  const count = useCartStore(state => state.getCartCount())
  const isHydrated = useCartStore(state => state.isHydrated)
  return isHydrated ? count : 0
}

export const useCartTotal = () => {
  const total = useCartStore(state => state.getCartTotal())
  const isHydrated = useCartStore(state => state.isHydrated)
  return isHydrated ? total : 0
}

export const useCartVisibility = () => useCartStore(state => state.cartVisibility)

export const useCartItems = () => {
  const items = useCartStore(state => state.cart)
  const isHydrated = useCartStore(state => state.isHydrated)
  return isHydrated ? items : []
}

export const useEditStatus = (cartItemId: string) => useCartStore(state => state.getEditStatus(cartItemId))

export const useIsHydrated = () => useCartStore(state => state.isHydrated)

// Hydration effect - ensure store is hydrated on client
if (typeof window !== 'undefined') {
  // Trigger hydration after component mount
  const hydrateStore = () => {
    const store = useCartStore.getState()
    if (!store.isHydrated) {
      store.setHydrated()
    }
  }
  
  // Hydrate immediately if DOM is ready
  if (document.readyState === 'complete') {
    hydrateStore()
  } else {
    window.addEventListener('load', hydrateStore)
  }
}

// Cross-tab synchronization
if (typeof window !== 'undefined') {
  // Listen for storage events to sync cart across tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'hsm-cart-storage' && event.newValue) {
      try {
        const newState = JSON.parse(event.newValue)
        if (newState.state?.cart) {
          // Update cart if it changed in another tab
          useCartStore.setState({ cart: newState.state.cart })
        }
      } catch (error) {
        console.error('Failed to sync cart from storage event:', error)
      }
    }
  })
}