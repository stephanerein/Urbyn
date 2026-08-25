import { LogOut, ShoppingCart, User, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import logoAtelierUrbanize from '../../assets/logo-atelier-urbanize.png';

export function Header() {
  const { items } = useCart();
  const { isLoggedIn, isBuyer, isSupplier, userLabel, openAuth, logout } = useAuth();
  const cartItemsCount = items
    .filter(i => i.details?.itemType === 'totem' || i.details?.itemType === 'panels')
    .reduce((s, i) => s + i.quantity, 0)
    + (items.some(i => i.details?.itemType === 'installation') ? 1 : 0);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b-2 border-slate-200 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="flex items-center justify-between gap-4">
          <Link to={isSupplier ? '/fournisseur' : '/'} className="flex items-center shrink-0">
            <img src={logoAtelierUrbanize} alt="Atelier Urbanize" className="h-[54px] w-auto" />
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4 flex-wrap justify-end">
            {isLoggedIn && isSupplier ? (
              <>
                <Link
                  to="/fournisseur"
                  className="px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Accueil
                </Link>
                <Link
                  to="/fournisseur/expedition"
                  className="px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Expédition
                </Link>
                <Link
                  to="/fournisseur/paiement"
                  className="px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Paiement
                </Link>
              </>
            ) : null}

            {!isSupplier ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors outline-none">
                    Expertise
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem asChild>
                      <Link to="/habillage-urbain">Urbain</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/habillage-thermique">Thermique</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Link
                  to="/definir-besoin"
                  className="px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Configurateur
                </Link>
                <Link
                  to="/contact"
                  className="px-3 py-2 text-sm font-medium text-black hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Contact
                </Link>
                <Link
                  to="/panier"
                  className="relative text-black hover:text-gray-700 font-medium transition-colors p-1"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>
              </>
            ) : null}

            {isLoggedIn ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-black max-w-[160px] truncate">
                  <User className="w-4 h-4 shrink-0" />
                  {userLabel}
                  {isBuyer ? (
                    <span className="text-xs text-slate-500 font-normal">(client)</span>
                  ) : isSupplier ? (
                    <span className="text-xs text-slate-500 font-normal">(partenaire)</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 px-3 py-2 border-2 border-black text-black font-medium rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Déconnexion</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuth()}
                className="px-4 py-2 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors shadow-md"
              >
                Connexion
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
