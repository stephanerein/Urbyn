import { SEOMeta } from '../components/SEOMeta';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Page /login : ouvre le modal auth et renvoie vers l'accueil. */
export function LoginPage() {
  const navigate = useNavigate();
  const { openAuth, isLoggedIn, isSupplier } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(isSupplier ? '/fournisseur' : '/', { replace: true });
      return;
    }
    openAuth();
    navigate('/', { replace: true });
  }, [isLoggedIn, isSupplier, navigate, openAuth]);

  return (
    <>
      <SEOMeta noIndex />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-black hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-white border-2 border-black rounded mx-auto flex items-center justify-center mb-4">
            <Construction className="w-7 h-7 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-black">Urbyn</h1>
          <p className="text-sm text-slate-600 mt-2">Ouverture de la connexion…</p>
        </div>
      </div>
    </>
  );
}
