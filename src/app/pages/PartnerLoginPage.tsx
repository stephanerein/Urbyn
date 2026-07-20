import { SEOMeta } from '../components/SEOMeta';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Building2, ArrowLeft, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { PartnerDashboard } from '../components/PartnerDashboard';

export function PartnerLoginPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    
    // Simulation d'authentification basée sur les instructions (admin / admin)
    setTimeout(() => {
      setLoading(false);
      if (email === 'admin' && password === 'admin') {
        setIsAuthenticated(true);
      } else {
        setError(true);
      }
    }, 1200);
  };

  if (isAuthenticated) {
    return <PartnerDashboard />;
  }

  return (
    <>
      <SEOMeta noIndex />
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-black hover:text-black transition-colors font-bold text-sm uppercase tracking-tight">
        <ArrowLeft className="w-4 h-4" />
        Retour à l'accueil
      </Link>

      <div className="mb-8 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-xl border-2 border-black">
          <Building2 className="w-9 h-9 text-black" />
        </div>
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase">Urbyn</h1>
        <p className="text-black font-bold text-xs uppercase tracking-widest mt-2">Espace Partenaire Officiel</p>
      </div>

      <Card className="w-full max-w-md border-2 border-black shadow-2xl overflow-hidden rounded-2xl bg-white">
        <div className="h-2 bg-black w-full" />
        <CardHeader className="space-y-2 py-8">
          <CardTitle className="text-2xl font-black text-center text-black uppercase tracking-tight">Accès Back-Office</CardTitle>
          <CardDescription className="text-center font-medium text-black">
            Identifiez-vous pour piloter vos ventes et votre catalogue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase text-slate-500 ml-1">Login (Email)</Label>
              <Input 
                id="email" 
                placeholder="admin" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-slate-100 focus:border-slate-900 transition-all font-bold"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" name="password" className="text-xs font-bold uppercase text-slate-500 ml-1">Mot de passe</Label>
                <a href="#" className="text-[10px] font-bold text-slate-400 hover:text-slate-900 uppercase">Oublié ?</a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-slate-100 focus:border-slate-900 transition-all font-bold"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-3 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-xs font-bold text-red-700">Identifiants incorrects. Utilisez admin / admin.</p>
              </div>
            )}

            <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-tight" disabled={loading}>
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
              Se connecter
            </Button>
          </form>
        </CardContent>
        <CardFooter className="bg-slate-50 px-8 py-6 border-t border-slate-100 flex flex-col gap-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase text-center leading-relaxed">
            Accès réservé aux partenaires agréés Urbyn.
            <br />Toute tentative de connexion frauduleuse est enregistrée.
          </div>
        </CardFooter>
      </Card>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 p-4 rounded-xl max-w-sm text-center">
        <p className="text-xs font-bold text-blue-700 italic">
          💡 Pour la démo, utilisez les identifiants :
          <br />
          <span className="text-blue-900 underline">Login: admin</span> / <span className="text-blue-900 underline">Pass: admin</span>
        </p>
      </div>
    </div>
  </>
  );
}
