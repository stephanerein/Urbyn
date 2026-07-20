import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  User, 
  TrendingUp, 
  LogOut, 
  ShoppingBag, 
  Download,
  Building2,
  ExternalLink,
  Plus,
  ClipboardList
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from './ui/utils';

const SALES_DATA = [
  { name: 'Jan', sales: 4000, orders: 24 },
  { name: 'Feb', sales: 3000, orders: 18 },
  { name: 'Mar', sales: 2000, orders: 15 },
  { name: 'Apr', sales: 2780, orders: 20 },
  { name: 'May', sales: 1890, orders: 12 },
  { name: 'Jun', sales: 2390, orders: 17 },
  { name: 'Jul', sales: 3490, orders: 26 },
];

const INVOICES = [
  { id: 'INV-2026-001', date: '01/02/2026', amount: '249.00 €', status: 'Payé' },
  { id: 'INV-2026-002', date: '01/01/2026', amount: '249.00 €', status: 'Payé' },
  { id: 'INV-2025-012', date: '01/12/2025', amount: '249.00 €', status: 'Payé' },
];

const CATALOG = [
  { name: 'Totem Lumineux 4m', category: 'Totem', price: '4 850 €', status: 'Actif' },
  { name: 'Massif Cubique 800', category: 'Massif', price: '217.30 €', status: 'Actif' },
  { name: 'Palissade Bois Classique', category: 'Palissade', price: '85 €/ml', status: 'Actif' },
  { name: 'Totem Acier Corten', category: 'Totem', price: '3 200 €', status: 'Indisponible' },
];

const RECENT_ORDERS = [
  { id: 'ORD-782', customer: 'BTP Service Plus', amount: '5 420.00 €', date: '12/02/2026' },
  { id: 'ORD-781', customer: 'Vinci Construction', amount: '12 850.00 €', date: '10/02/2026' },
  { id: 'ORD-779', customer: 'Eiffage Route', amount: '2 140.00 €', date: '08/02/2026' },
];

const RECENT_QUOTES = [
  { id: 'DEV-2026-104', customer: 'Société Travaux Publics', project: 'Chantier Gare Lyon', amount: '8 900.00 €', date: '15/02/2026', status: 'En attente' },
  { id: 'DEV-2026-103', customer: 'Promoteur Immo-Zen', project: 'Résidence les Pins', amount: '3 250.00 €', date: '14/02/2026', status: 'Validé' },
  { id: 'DEV-2026-102', customer: 'Ville de Marseille', project: 'Aménagement Port', amount: '15 600.00 €', date: '11/02/2026', status: 'En cours' },
  { id: 'DEV-2026-101', customer: 'SNCF Réseau', project: 'Signalétique Quai 4', amount: '1 850.00 €', date: '09/02/2026', status: 'Expiré' },
];

export function PartnerDashboard() {
  const [activeTab, setActiveTab] = useState<'stats' | 'catalog' | 'billing' | 'orders' | 'profile' | 'quotes'>('stats');
  const [profile, setProfile] = useState({
    company: 'Urbyn Partner Pro',
    description: 'Spécialiste de l\'aménagement urbain et signalétique de chantier.',
    logo: 'https://images.unsplash.com/photo-1541724551460-142217c45872?q=80&w=200&h=200&auto=format&fit=crop',
    email: 'admin@urbyn-pro.fr',
    phone: '01 23 45 67 89'
  });

  const SidebarItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
        activeTab === id 
          ? "bg-slate-900 text-white shadow-lg" 
          : "text-slate-500 hover:bg-slate-100"
      )}
    >
      <Icon className="w-5 h-5" />
      {label}
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r-2 border-slate-200 p-6 flex flex-col hidden md:flex">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="font-black text-xl tracking-tighter">PARTNER</span>
        </div>

        <nav className="space-y-2 flex-1">
          <SidebarItem id="stats" icon={LayoutDashboard} label="Tableau de bord" />
          <SidebarItem id="quotes" icon={ClipboardList} label="Devis Clients" />
          <SidebarItem id="orders" icon={ShoppingBag} label="Ventes en ligne" />
          <SidebarItem id="catalog" icon={Package} label="Catalogue produits" />
          <SidebarItem id="billing" icon={FileText} label="Facturation" />
          <SidebarItem id="profile" icon={User} label="Profil Entreprise" />
        </nav>

        <div className="pt-6 border-t border-slate-100">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                {activeTab === 'stats' && "Pilotage des ventes"}
                {activeTab === 'quotes' && "Gestion des devis clients"}
                {activeTab === 'orders' && "Suivi des commandes"}
                {activeTab === 'catalog' && "Catalogue Produits"}
                {activeTab === 'billing' && "Facturation & Abonnements"}
                {activeTab === 'profile' && "Mon Profil Entreprise"}
              </h2>
              <p className="text-slate-500 font-medium">
                Bonjour Admin, voici l'état de votre activité aujourd'hui.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button className="bg-white border-2 border-slate-200 text-slate-900 hover:bg-slate-50 font-bold h-11">
                <Download className="w-4 h-4 mr-2" /> Exporter (.csv)
              </Button>
              <Button className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-6">
                <Plus className="w-4 h-4 mr-2" /> Nouveau Devis
              </Button>
            </div>
          </div>

          {/* Tab Content: Stats */}
          {activeTab === 'stats' && (
            <div className="space-y-8">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: "Chiffre d'affaires", val: "32 450 €", growth: "+12.5%", icon: TrendingUp, color: "text-emerald-600" },
                  { label: "Commandes totales", val: "142", growth: "+4.2%", icon: ShoppingBag, color: "text-blue-600" },
                  { label: "Conversion moyenne", val: "3.2%", growth: "-0.5%", icon: TrendingUp, color: "text-slate-600" },
                  { label: "Clients actifs", val: "84", growth: "+8.1%", icon: User, color: "text-slate-600" },
                ].map((stat, i) => (
                  <Card key={i} className="border-2 border-slate-200 shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={cn("w-5 h-5", stat.color)} />
                        <span className={cn("text-[10px] font-black px-1.5 py-0.5 rounded-full bg-slate-100", 
                          stat.growth.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                        )}>
                          {stat.growth}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-slate-900">{stat.val}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-2 border-slate-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Volume des ventes (mensuel)</CardTitle>
                    <CardDescription>Évolution du CA HT sur les 7 derniers mois</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={SALES_DATA}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34495E" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#34495E" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#34495E" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-2 border-slate-200 shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">Commandes par période</CardTitle>
                    <CardDescription>Nombre de transactions validées</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={SALES_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="orders" fill="#546E7A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Tab Content: Quotes */}
          {activeTab === 'quotes' && (
            <Card className="border-2 border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Référence</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Client / Projet</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Montant HT</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Statut</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RECENT_QUOTES.map((quote) => (
                      <tr key={quote.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{quote.id}</td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{quote.customer}</div>
                          <div className="text-[10px] text-slate-400 uppercase font-black">{quote.project}</div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 font-medium text-sm">{quote.date}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{quote.amount}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 text-[10px] font-black rounded uppercase",
                            quote.status === 'Validé' ? "bg-emerald-50 text-emerald-700" : 
                            quote.status === 'En attente' ? "bg-amber-50 text-amber-700" : 
                            quote.status === 'En cours' ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"
                          )}>
                            {quote.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Télécharger PDF">
                              <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Détails">
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab Content: Orders */}
          {activeTab === 'orders' && (
            <Card className="border-2 border-slate-200 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Commande</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Client</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Date</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Montant HT</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500">Statut</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {RECENT_ORDERS.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{order.id}</td>
                        <td className="px-6 py-4 font-medium text-slate-700">{order.customer}</td>
                        <td className="px-6 py-4 text-slate-500">{order.date}</td>
                        <td className="px-6 py-4 font-black text-slate-900">{order.amount}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded uppercase">Livré</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-slate-900 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab Content: Catalog */}
          {activeTab === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {CATALOG.map((item, i) => (
                <Card key={i} className="border-2 border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-0">
                    <div className="h-40 bg-slate-100 relative">
                       <div className="absolute top-3 right-3">
                         <span className={cn("px-2 py-1 rounded text-[10px] font-black uppercase", 
                           item.status === 'Actif' ? "bg-emerald-500 text-white" : "bg-slate-400 text-white"
                         )}>
                           {item.status}
                         </span>
                       </div>
                    </div>
                    <div className="p-5">
                      <div className="text-[10px] font-black text-slate-400 uppercase mb-1">{item.category}</div>
                      <h4 className="font-bold text-lg text-slate-900 mb-4">{item.name}</h4>
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-black text-slate-900">{item.price}</div>
                        <Button variant="outline" size="sm" className="font-bold">Modifier</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Tab Content: Billing */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden">
                <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                   <div className="space-y-2 text-center md:text-left">
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Abonnement Actuel</div>
                     <h3 className="text-3xl font-black">Plan Partenaire Premium</h3>
                     <p className="text-slate-400">249.00 € / mois - Renouvellement le 01/03/2026</p>
                   </div>
                   <Button className="bg-white text-slate-900 hover:bg-slate-100 font-black h-12 px-8 rounded-xl shadow-lg">
                     Gérer mon abonnement
                   </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 shadow-md">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Historique de facturation</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400">Numéro</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400">Date</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400">Montant</th>
                        <th className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 text-right">Facture</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {INVOICES.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{inv.id}</td>
                          <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                          <td className="px-6 py-4 font-black text-slate-900">{inv.amount}</td>
                          <td className="px-6 py-4 text-right">
                             <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 ml-auto font-bold text-xs uppercase">
                               <Download className="w-4 h-4" /> PDF
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tab Content: Profile */}
          {activeTab === 'profile' && (
            <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-slate-600 to-slate-800" />
              <CardContent className="p-8 -mt-16">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="shrink-0 space-y-4">
                    <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-2xl border-2 border-white overflow-hidden">
                      <img src={profile.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <Button variant="outline" className="w-full font-bold text-xs uppercase">Changer le logo</Button>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Nom de l'entreprise</Label>
                        <Input 
                          value={profile.company} 
                          onChange={e => setProfile({...profile, company: e.target.value})}
                          className="h-11 border-2 border-slate-100 focus:border-slate-900 font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Email professionnel</Label>
                        <Input 
                          value={profile.email} 
                          onChange={e => setProfile({...profile, email: e.target.value})}
                          className="h-11 border-2 border-slate-100 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-slate-500">Téléphone</Label>
                        <Input 
                          value={profile.phone} 
                          onChange={e => setProfile({...profile, phone: e.target.value})}
                          className="h-11 border-2 border-slate-100 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-slate-500">Description publique</Label>
                      <textarea 
                        className="w-full h-32 p-4 rounded-xl border-2 border-slate-100 focus:border-slate-900 transition-colors font-medium text-sm"
                        value={profile.description}
                        onChange={e => setProfile({...profile, description: e.target.value})}
                      />
                    </div>

                    <div className="pt-4 flex justify-end">
                      <Button className="bg-slate-900 hover:bg-slate-800 text-white font-black h-12 px-10 rounded-xl shadow-lg">
                        Mettre à jour mes informations
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </main>
    </div>
  );
}
