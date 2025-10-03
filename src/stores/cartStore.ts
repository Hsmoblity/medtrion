import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartProduct } from 'lib/interfaces'
import { parsePrice, calculateOrderTotal, debugPriceParsing } from 'lib/utils/priceUtils'
import React from 'react'

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
  removeOption: (cartItemId: string | number | null, optionIndex: number) => void
  updateCartItem: (cartItemId: string | number | null, updates: Partial<CartProduct>) => void
  updateQuantity: (cartItemId: string | number | null, quantity: number) => void
  clearCart: () => void
  cleanupDuplicates: () => void
  cleanupWrongOptions: () => void
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
  replaceCartItem: (cartItemId: string, newProduct: Omit<CartProduct, 'cartItemId'>) => void
  
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
        // Validate product data before adding
        if (!product.slug || !product.title) {
          console.error('🔧 Invalid product data: missing slug or title');
          return state;
        }
        
        // Check if an identical item already exists in cart
        const existingItem = state.cart.find(item => {
          // Check if it's the same product
          const sameProduct = item.slug === product.slug && item.productId === product.productId;
          
          if (!sameProduct) return false;
          
          // Check if options are identical
          const currentOptions = item.options || [];
          const newOptions = product.options || [];
          
          if (currentOptions.length !== newOptions.length) return false;
          
          // Compare options by name, value, and priceModifier
          const optionsMatch = currentOptions.every(currentOption => 
            newOptions.some(newOption => 
              currentOption.name === newOption.name &&
              currentOption.value === newOption.value &&
              currentOption.priceModifier === newOption.priceModifier &&
              (currentOption.quantity || 1) === (newOption.quantity || 1)
            )
          );
          
          return optionsMatch;
        });
        
        if (existingItem) {
          // Update quantity of existing item instead of adding duplicate
          console.log(`🔧 Updating quantity for existing cart item: ${existingItem.title}`);
          return {
            cart: state.cart.map(item => 
              item.cartItemId === existingItem.cartItemId
                ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) }
                : item
            )
          };
        }
        
        // Add new item if no duplicate found
        const cartItemId = generateCartItemId()
        const newItem: CartProduct = {
          ...product,
          cartItemId,
          quantity: product.quantity || 1
        }
        
        console.log(`🔧 Added new cart item: ${newItem.title} (${newItem.cartItemId}) with ${newItem.options?.length || 0} options`);
        
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

      removeOption: (cartItemId, optionIndex) => set((state) => ({
        cart: state.cart.map(item => {
          if (String(item.cartItemId) === String(cartItemId)) {
            const currentOptions = item.options || [];
            const newOptions = currentOptions.filter((_, index) => index !== optionIndex);
            return { ...item, options: newOptions };
          }
          return item;
        })
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
      
      // Clean up duplicate cart items
      cleanupDuplicates: () => set((state) => {
        const seenItems = new Set<string>();
        const cleanedCart = state.cart.filter(item => {
          const itemKey = `${item.slug}-${item.productId}-${JSON.stringify(item.options || [])}`;
          
          if (seenItems.has(itemKey)) {
            console.warn(`🔧 Removing duplicate cart item: ${item.title} (${item.cartItemId})`);
            return false;
          }
          
          seenItems.add(itemKey);
          return true;
        });
        
        if (cleanedCart.length !== state.cart.length) {
          console.log(`🔧 Cleaned up ${state.cart.length - cleanedCart.length} duplicate cart items`);
        }
        
        return { cart: cleanedCart };
      }),
      
      // Clean up cart items with wrong/generic options
      cleanupWrongOptions: () => set((state) => {
        const genericOptionNames = [
          'Extended Warranty', 'Warranty', 'Fabric Color', 'Color Upgrade', 
          'Factory Options', 'Delivery', 'Installation', 'Service', 'Maintenance'
        ];
        
        const cleanedCart = state.cart.map(item => {
          if (item.options && item.options.length > 0) {
            // Filter out generic options
            const validOptions = item.options.filter(option => {
              const isGeneric = genericOptionNames.some(genericName => 
                option.name?.toLowerCase().includes(genericName.toLowerCase())
              );
              
              if (isGeneric) {
                console.warn(`🔧 Removing generic option "${option.name}" from cart item "${item.title}"`);
                return false;
              }
              
              return true;
            });
            
            if (validOptions.length !== item.options.length) {
              console.log(`🔧 Cleaned ${item.options.length - validOptions.length} generic options from cart item "${item.title}"`);
              return { ...item, options: validOptions };
            }
          }
          
          return item;
        });
        
        const hasChanges = cleanedCart.some((item, index) => 
          JSON.stringify(item.options) !== JSON.stringify(state.cart[index].options)
        );
        
        if (hasChanges) {
          console.log(`🔧 Cleaned up generic options from cart items`);
        }
        
        return { cart: cleanedCart };
      }),
      
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
      
      replaceCartItem: (cartItemId, newProduct) => set((state) => ({
        cart: state.cart.map(item => 
          String(item.cartItemId) === String(cartItemId)
            ? { ...newProduct, cartItemId: item.cartItemId }
            : item
        )
      })),
      
      // Computed Values
      getCartTotal: () => {
        const { cart } = get()
        
        // Calculate order total efficiently without debug logging
        const orderTotal = calculateOrderTotal(cart);
        
        return orderTotal.total;
      },
      
      getCartCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + (item.quantity || 1), 0)
      },
      
      getCartSubtotal: () => {
        const { cart } = get()
        
        // Calculate order total efficiently without debug logging
        const orderTotal = calculateOrderTotal(cart);
        
        return orderTotal.subtotal;
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
  
  // Debug logging for cart hydration
  if (typeof window !== 'undefined' && !isHydrated) {
    console.log('🔧 useCartItems: Store not hydrated yet, returning empty array')
    
    // Fallback: Try to hydrate manually if not hydrated after a delay
    setTimeout(() => {
      const store = useCartStore.getState()
      if (!store.isHydrated) {
        console.log('🔧 useCartItems: Fallback hydration attempt')
        const storedData = localStorage.getItem('hsm-cart-storage')
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (parsedData.state && parsedData.state.cart) {
              console.log('🔧 useCartItems: Fallback - Found stored cart data:', parsedData.state.cart.length, 'items')
              useCartStore.setState({ 
                cart: parsedData.state.cart,
                isHydrated: true 
              })
            }
          } catch (parseError) {
            console.error('🔧 useCartItems: Fallback hydration failed:', parseError)
          }
        }
      }
    }, 100) // Small delay to allow other hydration attempts
  }
  
  return isHydrated ? items : []
}

export const useEditStatus = (cartItemId: string) => useCartStore(state => state.getEditStatus(cartItemId))

export const useIsHydrated = () => useCartStore(state => state.isHydrated)

// Custom hook for immediate hydration
export const useCartHydration = () => {
  const isHydrated = useCartStore(state => state.isHydrated)
  const cleanupDuplicates = useCartStore(state => state.cleanupDuplicates)
  
  React.useEffect(() => {
    if (!isHydrated && typeof window !== 'undefined') {
      console.log('🔧 useCartHydration: Triggering immediate hydration')
      
      // Immediate hydration attempt
      const storedData = localStorage.getItem('hsm-cart-storage')
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData)
          if (parsedData.state && parsedData.state.cart) {
            console.log('🔧 useCartHydration: Immediate - Found stored cart data:', parsedData.state.cart.length, 'items')
            useCartStore.setState({ 
              cart: parsedData.state.cart,
              isHydrated: true 
            })
            
            // Clean up any duplicates after hydration
            setTimeout(() => {
              console.log('🔧 Running cleanupDuplicates after hydration...');
              cleanupDuplicates()
            }, 100)
          } else {
            console.log('🔧 useCartHydration: Immediate - No stored cart data found')
            useCartStore.setState({ isHydrated: true })
          }
        } catch (parseError) {
          console.error('🔧 useCartHydration: Immediate hydration failed:', parseError)
          useCartStore.setState({ isHydrated: true })
        }
      } else {
        console.log('🔧 useCartHydration: Immediate - No localStorage data found')
        useCartStore.setState({ isHydrated: true })
      }
    }
  }, [isHydrated, cleanupDuplicates])
  
  return isHydrated
}

// Hydration effect - ensure store is hydrated on client
if (typeof window !== 'undefined') {
  // Trigger hydration after component mount
  const hydrateStore = () => {
    try {
      const store = useCartStore.getState()
      if (!store.isHydrated) {
        console.log('🔧 Cart Store: Hydrating from localStorage...')
        
        // Manually trigger Zustand persist rehydration
        const persist = useCartStore.persist
        if (persist && persist.rehydrate) {
          persist.rehydrate()
        }
        
        // Check if data was loaded from localStorage
        const storedData = localStorage.getItem('hsm-cart-storage')
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData)
            if (parsedData.state && parsedData.state.cart) {
              console.log('🔧 Cart Store: Found stored cart data:', parsedData.state.cart.length, 'items')
              // Update the store with the stored cart data
              useCartStore.setState({ 
                cart: parsedData.state.cart,
                isHydrated: true 
              })
            } else {
              console.log('🔧 Cart Store: No stored cart data found')
              store.setHydrated()
            }
          } catch (parseError) {
            console.error('🔧 Cart Store: Failed to parse stored data:', parseError)
            store.setHydrated()
          }
        } else {
          console.log('🔧 Cart Store: No localStorage data found')
          store.setHydrated()
        }
        
        console.log('🔧 Cart Store: Hydration complete')
      }
    } catch (error) {
      console.error('🔧 Cart Store: Hydration failed:', error)
      // Set hydrated anyway to prevent infinite loading
      const store = useCartStore.getState()
      if (!store.isHydrated) {
        store.setHydrated()
      }
    }
  }
  
  // Hydrate immediately if DOM is ready
  if (document.readyState === 'complete') {
    hydrateStore()
  } else {
    window.addEventListener('load', hydrateStore)
  }
  
  // Also hydrate on DOMContentLoaded as a fallback
  document.addEventListener('DOMContentLoaded', hydrateStore)
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