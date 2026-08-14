import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { fetchCartSnapshot, saveCartSnapshot } from '../api/cart'
import { isBuyer } from '../lib/session'
import { useAuth } from './AuthContext'

export interface CartItem {
  id: string
  type: 'totem' | 'cloture' | 'store' | 'massif'
  name: string
  price: number
  quantity: number
  details: any
  windComplianceChecked?: boolean
}

interface CartContextType {
  items: CartItem[]
  lastAddedItem: CartItem | null
  lastAddedItems: CartItem[]
  hydrated: boolean
  addItem: (item: CartItem) => void
  addItems: (batch: CartItem[]) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateWindCompliance: (id: string, checked: boolean) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  isSidebarOpen: boolean
  openSidebar: () => void
  closeSidebar: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const GUEST_CART_KEY = 'urbyn_guest_cart'
const USER_CART_CACHE_PREFIX = 'urbyn_cart_u_'

function userCacheKey(userId: number) {
  return `${USER_CART_CACHE_PREFIX}${userId}`
}

function readStorage(storage: Storage, key: string): CartItem[] {
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

function writeStorage(storage: Storage, key: string, items: CartItem[]) {
  try {
    storage.setItem(key, JSON.stringify(items))
  } catch {
    /* quota / private mode */
  }
}

function mergeInto(prev: CartItem[], item: CartItem): CartItem[] {
  if (item.details?.itemType === 'balast') {
    const existingBalastIndex = prev.findIndex((i) => i.details?.itemType === 'balast')
    if (existingBalastIndex >= 0) {
      const next = [...prev]
      next[existingBalastIndex] = {
        ...next[existingBalastIndex],
        quantity: next[existingBalastIndex].quantity + item.quantity,
      }
      return next
    }
    return [...prev, { ...item, id: 'balast-unique' }]
  }

  const existingIndex = prev.findIndex((i) => i.id === item.id)
  if (existingIndex >= 0) {
    if (item.details?.itemType === 'installation') return prev
    const next = [...prev]
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: next[existingIndex].quantity + item.quantity,
    }
    return next
  }
  return [...prev, item]
}

function mergeCarts(base: CartItem[], incoming: CartItem[]): CartItem[] {
  return incoming.reduce((acc, item) => mergeInto(acc, item), base)
}

function normalizeItems(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (x): x is CartItem =>
      !!x &&
      typeof x === 'object' &&
      typeof (x as CartItem).id === 'string' &&
      typeof (x as CartItem).name === 'string',
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { session, ready: authReady, isLoggedIn } = useAuth()
  const buyerSession = isLoggedIn && isBuyer(session) ? session : null

  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null)
  const [lastAddedItems, setLastAddedItems] = useState<CartItem[]>([])

  const skipNextPersist = useRef(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const itemsRef = useRef(items)
  itemsRef.current = items

  // Hydrate: guest → sessionStorage ; buyer → API (+ merge guest)
  useEffect(() => {
    if (!authReady) return
    let cancelled = false

    async function hydrate() {
      const guestItems = readStorage(sessionStorage, GUEST_CART_KEY)

      if (!buyerSession) {
        if (!cancelled) {
          skipNextPersist.current = true
          setItems(guestItems)
          setHydrated(true)
        }
        return
      }

      let remoteItems: CartItem[] = []
      try {
        const snap = await fetchCartSnapshot(buyerSession)
        remoteItems = normalizeItems(snap.items)
      } catch {
        remoteItems = readStorage(localStorage, userCacheKey(buyerSession.user_id))
      }

      const merged = guestItems.length
        ? mergeCarts(remoteItems, guestItems)
        : remoteItems

      if (!cancelled) {
        skipNextPersist.current = true
        setItems(merged)
        setHydrated(true)
        sessionStorage.removeItem(GUEST_CART_KEY)
        writeStorage(localStorage, userCacheKey(buyerSession.user_id), merged)
        if (guestItems.length) {
          try {
            await saveCartSnapshot(buyerSession, merged)
          } catch {
            /* offline ok — cache local */
          }
        }
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [authReady, buyerSession?.user_id, buyerSession?.email])

  // Persist on change
  useEffect(() => {
    if (!hydrated || !authReady) return
    if (skipNextPersist.current) {
      skipNextPersist.current = false
      return
    }

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const current = itemsRef.current
      if (!buyerSession) {
        writeStorage(sessionStorage, GUEST_CART_KEY, current)
        return
      }
      writeStorage(localStorage, userCacheKey(buyerSession.user_id), current)
      void saveCartSnapshot(buyerSession, current).catch(() => {
        /* keep local cache */
      })
    }, 400)

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [items, hydrated, authReady, buyerSession])

  const addItem = useCallback((item: CartItem) => {
    setLastAddedItem(item)
    setLastAddedItems([item])
    setItems((prev) => mergeInto(prev, item))
    setIsSidebarOpen(true)
  }, [])

  const addItems = useCallback((batch: CartItem[]) => {
    if (batch.length === 0) return
    setLastAddedItem(batch[0])
    setLastAddedItems(batch)
    setItems((prev) => batch.reduce((acc, item) => mergeInto(acc, item), prev))
    setIsSidebarOpen(true)
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id)
      const next = prev.filter((item) => item.id !== id)
      if (removed) {
        const typeStillPresent = next.some((item) => item.type === removed.type)
        if (!typeStillPresent) {
          const TYPE_TO_PARAM: Record<string, string> = {
            totem: 'totem',
            cloture: 'palissade',
            massif: 'massif-beton',
          }
          const param = TYPE_TO_PARAM[removed.type]
          if (param) {
            const saved = sessionStorage.getItem('servicesSpecifiques')
            if (saved) {
              try {
                const parsed = JSON.parse(saved)
                if (!Array.isArray(parsed)) {
                  delete parsed[param]
                  sessionStorage.setItem('servicesSpecifiques', JSON.stringify(parsed))
                }
              } catch {
                /* ignore */
              }
            }
          }
        }
      }
      return next
    })
  }, [])

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item)),
    )
  }, [])

  const updateWindCompliance = useCallback((id: string, checked: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, windComplianceChecked: checked } : item,
      ),
    )
  }, [])

  const clearCart = useCallback(() => {
    sessionStorage.removeItem('servicesSpecifiques')
    setItems([])
  }, [])

  const getTotalPrice = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getTotalItems = () => items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        lastAddedItem,
        lastAddedItems,
        hydrated,
        addItem,
        addItems,
        removeItem,
        updateQuantity,
        updateWindCompliance,
        clearCart,
        getTotalPrice,
        getTotalItems,
        isSidebarOpen,
        openSidebar: () => setIsSidebarOpen(true),
        closeSidebar: () => setIsSidebarOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
