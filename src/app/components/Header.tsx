import { Building2, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function Header() {
  const { items } = useCart();
  const cartItemsCount = items
    .filter(i => i.details?.itemType === 'totem' || i.details?.itemType === 'panels')
    .reduce((s, i) => s + i.quantity, 0)
    + (items.some(i => i.details?.itemType === 'installation') ? 1 : 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md border-2 border-black">
              <Building2 className="w-7 h-7 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-bold text-2xl tracking-tight text-black">Urbyn</h1>
            </div>
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              to="/panier"
              className="relative text-black hover:text-gray-700 font-medium transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-md"
            >
              Connexion
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}