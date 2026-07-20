import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  type: 'totem' | 'cloture' | 'store' | 'massif';
  name: string;
  price: number;
  quantity: number;
  details: any;
  windComplianceChecked?: boolean;
}

interface CartContextType {
  items: CartItem[];
  lastAddedItem: CartItem | null;
  lastAddedItems: CartItem[];
  addItem: (item: CartItem) => void;
  addItems: (batch: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateWindCompliance: (id: string, checked: boolean) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function mergeInto(prev: CartItem[], item: CartItem): CartItem[] {
  // Logique spéciale pour les lests : tous les lests sont fusionnés en un seul item
  if (item.details?.itemType === 'balast') {
    const existingBalastIndex = prev.findIndex(i => i.details?.itemType === 'balast');
    if (existingBalastIndex >= 0) {
      // Fusionner avec le lest existant
      const next = [...prev];
      next[existingBalastIndex] = {
        ...next[existingBalastIndex],
        quantity: next[existingBalastIndex].quantity + item.quantity,
      };
      return next;
    }
    // Ajouter le premier lest avec un ID fixe
    return [...prev, { ...item, id: 'balast-unique' }];
  }

  // Logique normale pour les autres items
  const existingIndex = prev.findIndex(i => i.id === item.id);
  if (existingIndex >= 0) {
    if (item.details?.itemType === 'installation') return prev;
    const next = [...prev];
    next[existingIndex] = {
      ...next[existingIndex],
      quantity: next[existingIndex].quantity + item.quantity,
    };
    return next;
  }
  return [...prev, item];
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [lastAddedItems, setLastAddedItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setLastAddedItem(item);
    setLastAddedItems([item]);
    setItems(prev => mergeInto(prev, item));
    setIsSidebarOpen(true);
  };

  const addItems = (batch: CartItem[]) => {
    if (batch.length === 0) return;
    setLastAddedItem(batch[0]);
    setLastAddedItems(batch);
    setItems(prev => batch.reduce((acc, item) => mergeInto(acc, item), prev));
    setIsSidebarOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const removed = prev.find(item => item.id === id);
      const next = prev.filter(item => item.id !== id);
      // Si c'était le dernier item de ce type, supprimer ses services du sessionStorage
      if (removed) {
        const typeStillPresent = next.some(item => item.type === removed.type);
        if (!typeStillPresent) {
          const TYPE_TO_PARAM: Record<string, string> = {
            totem: 'totem',
            cloture: 'palissade',
            massif: 'massif-beton',
          };
          const param = TYPE_TO_PARAM[removed.type];
          if (param) {
            const saved = sessionStorage.getItem('servicesSpecifiques');
            if (saved) {
              try {
                const parsed = JSON.parse(saved);
                if (!Array.isArray(parsed)) {
                  delete parsed[param];
                  sessionStorage.setItem('servicesSpecifiques', JSON.stringify(parsed));
                }
              } catch {}
            }
          }
        }
      }
      return next;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity } : item
    ));
  };

  const updateWindCompliance = (id: string, checked: boolean) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, windComplianceChecked: checked } : item
    ));
  };

  const clearCart = () => {
    sessionStorage.removeItem('servicesSpecifiques');
    setItems([]);
  };

  const getTotalPrice = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const getTotalItems = () =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <CartContext.Provider value={{
      items,
      lastAddedItem,
      lastAddedItems,
      addItem,
      addItems,
      removeItem,
      updateQuantity,
      updateWindCompliance,
      clearCart,
      getTotalPrice,
      getTotalItems,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
