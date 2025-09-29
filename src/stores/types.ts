// Store action types (equivalent to your old reducer types)
export enum CartActionTypes {
  ADD_TO_CART = 'ADD_TO_CART',
  REMOVE_FROM_CART = 'REMOVE_FROM_CART',
  REMOVE_SINGLE_ITEM = 'REMOVE_SINGLE_ITEM',
  UPDATE_CART_ITEM = 'UPDATE_CART_ITEM',
  UPDATE_QUANTITY = 'UPDATE_QUANTITY',
  CLEAR_CART = 'CLEAR_CART',
  BULK_ADD = 'BULK_ADD',
  TOGGLE_CART_VISIBILITY = 'TOGGLE_CART_VISIBILITY',
  SET_CART_VISIBILITY = 'SET_CART_VISIBILITY'
}

// Store state interface
export interface StoreState {
  cart: {
    items: any[]
    visibility: boolean
    count: number
    total: number
  }
  ui: {
    loading: boolean
    error: string | null
  }
}

// Zustand store type helpers
export type StoreSlice<T> = (
  set: (partial: T | Partial<T> | ((state: T) => T | Partial<T>)) => void,
  get: () => T
) => T

export type PersistOptions = {
  name: string
  version?: number
  partialize?: (state: any) => any
  onRehydrateStorage?: () => void
}