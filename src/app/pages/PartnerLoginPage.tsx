import { SEOMeta } from '../components/SEOMeta';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/** Page /partner/login : ouvre le modal (côté partenaire via UI) puis redirige. */
export function PartnerLoginPage() {
  const navigate = useNavigate();
  const { openAuth, isLoggedIn, isSupplier } = useAuth();

  useEffect(() => {
    if (isLoggedIn && isSupplier) {
      navigate('/fournisseur', { replace: true });
      return;
    }
    if (isLoggedIn) {
      navigate('/', { replace: true });
      return;
    }
    openAuth('partner');
    navigate('/', { replace: true });
  }, [isLoggedIn, isSupplier, navigate, openAuth]);

  return (
    <>
      <SEOMeta noIndex />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 pt-[var(--header-height)]">
        <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-black font-bold text-sm uppercase tracking-tight">
          <ArrowLeft className="w-4 h-4" />
          Retour à l'accueil
        </Link>
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl border-2 border-black">
            <Building2 className="w-9 h-9 text-black" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase">Urbyn</h1>
          <p className="text-black font-bold text-xs uppercase tracking-widest mt-2">
            Ouverture connexion partenaire…
          </p>
        </div>
      </div>
    </>
  );
}
