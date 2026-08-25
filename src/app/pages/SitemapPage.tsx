import { useState } from "react";

type NodeStatus = "active" | "planned" | "info";

interface SitemapNode {
  label: string;
  path?: string;
  status?: NodeStatus;
  description?: string;
  children?: SitemapNode[];
}

const sitemapData: SitemapNode = {
  label: "Urbyn",
  path: "/",
  status: "active",
  description: "Page d'accueil",
  children: [
    {
      label: "Parcours Devis",
      status: "active",
      description: "Tunnel de configuration",
      children: [
        {
          label: "1. Définir votre besoin",
          path: "/definir-besoin",
          status: "active",
          description: "Choix du type de projet",
          children: [
            {
              label: "Palissade",
              path: "/palissade",
              status: "active",
              description: "Choix du sous-type",
              children: [
                {
                  label: "Habiller une palissade",
                  path: "/palissade/habillage",
                  status: "active",
                  description: "Config matériaux & bardage",
                },
                {
                  label: "Monter + habiller",
                  path: "/palissade/montage",
                  status: "active",
                  description: "Config montage & matériaux",
                },
                {
                  label: "Résultats Palissade",
                  path: "/palissade/resultats",
                  status: "active",
                  description: "Estimation & récapitulatif",
                },
              ],
            },
            {
              label: "Totem",
              path: "/totem",
              status: "active",
              description: "Sélection du modèle",
              children: [
                {
                  label: "Caisson Bois → Format",
                  path: "/totem/caisson-bois/format",
                  status: "active",
                },
                {
                  label: "Caisson Bois → Comparer",
                  path: "/totem/caisson-bois/compare",
                  status: "active",
                },
                {
                  label: "Caisson Bois → Config",
                  path: "/totem/caisson-bois/:format",
                  status: "active",
                },
                {
                  label: "Gabion → Config",
                  path: "/totem/gabion/config",
                  status: "active",
                },
                {
                  label: "LIZ → Config",
                  path: "/totem/liz/config",
                  status: "active",
                },
                {
                  label: "Résultats Totem",
                  path: "/totem/resultats",
                  status: "active",
                },
                {
                  label: "Conformité Totem",
                  path: "/totem/conformite",
                  status: "active",
                },
                {
                  label: "Résultats Conformité",
                  path: "/totem/conformite/resultats",
                  status: "active",
                },
              ],
            },
            {
              label: "Massif",
              path: "/massif",
              status: "active",
              description: "Calcul massif",
              children: [
                {
                  label: "Résultats Massif",
                  path: "/massif/resultats",
                  status: "active",
                },
              ],
            },
            {
              label: "BET",
              path: "/bet",
              status: "active",
              description: "Bureau d'études techniques",
              children: [
                {
                  label: "Résultats BET",
                  path: "/bet/resultats",
                  status: "active",
                },
              ],
            },
          ],
        },
        {
          label: "2. Choisir le service",
          path: "/select-service/:product",
          status: "active",
          description: "Services d'accompagnement",
          children: [
            {
              label: "Services additionnels",
              path: "/services-additionnels/:product",
              status: "active",
            },
            {
              label: "Services spécifiques",
              path: "/services-specifiques/:product",
              status: "active",
            },
          ],
        },
        {
          label: "3. Obtenir l'estimation",
          status: "active",
          description: "Résultats selon le produit",
        },
        {
          label: "4. Échanger avec un spécialiste",
          status: "active",
          description: "Chat & prise de contact",
        },
      ],
    },
    {
      label: "Commande",
      status: "active",
      description: "Tunnel d'achat",
      children: [
        {
          label: "Panier",
          path: "/panier",
          status: "active",
          description: "Récapitulatif des articles",
        },
        {
          label: "Livraison",
          path: "/livraison",
          status: "active",
          description: "Adresse & options de livraison",
        },
        {
          label: "Paiement",
          path: "/paiement",
          status: "active",
          description: "Stripe Checkout",
        },
      ],
    },
    {
      label: "Compte & Accès",
      status: "active",
      children: [
        {
          label: "Connexion",
          path: "/login",
          status: "active",
        },
        {
          label: "Espace Partenaire",
          path: "/partner/login",
          status: "active",
          description: "Dashboard partenaire",
        },
      ],
    },
    {
      label: "Informations",
      status: "info",
      children: [
        { label: "À propos", path: "/a-propos", status: "active" },
        { label: "Contact", path: "/contact", status: "active" },
      ],
    },
    {
      label: "Légal",
      status: "info",
      children: [
        { label: "Mentions légales", path: "/mentions-legales", status: "active" },
        { label: "Confidentialité", path: "/confidentialite", status: "active" },
        { label: "Cookies", path: "/cookies", status: "active" },
        { label: "CGV", path: "/cgv", status: "active" },
      ],
    },
  ],
};

const statusColors: Record<NodeStatus, { bg: string; border: string; text: string; dot: string }> = {
  active: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-800",
    dot: "bg-emerald-500",
  },
  planned: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-800",
    dot: "bg-amber-400",
  },
  info: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-600",
    dot: "bg-slate-400",
  },
};

function SitemapNodeCard({
  node,
  depth = 0,
}: {
  node: SitemapNode;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const status = node.status ?? "active";
  const colors = statusColors[status];
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative rounded-lg border ${colors.border} ${colors.bg} px-3 py-2 min-w-[140px] max-w-[180px] text-center shadow-sm transition-all duration-150 ${hasChildren ? "cursor-pointer hover:shadow-md" : ""}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
          <span className={`text-xs font-semibold leading-tight ${colors.text}`}>{node.label}</span>
          {hasChildren && (
            <span className={`text-xs ${colors.text} opacity-60`}>{expanded ? "▲" : "▼"}</span>
          )}
        </div>
        {node.path && (
          <span className="block text-[10px] text-slate-400 font-mono truncate">{node.path}</span>
        )}
        {node.description && (
          <span className="block text-[10px] text-slate-500 mt-0.5 leading-tight">{node.description}</span>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="flex flex-col items-center mt-0">
          {/* Vertical connector */}
          <div className="w-px h-4 bg-slate-300" />
          {/* Horizontal bar */}
          {node.children!.length > 1 && (
            <div className="relative flex items-start">
              <div
                className="absolute top-0 h-px bg-slate-300"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: `calc(100% - 0px)`,
                }}
              />
            </div>
          )}
          <div className="flex flex-row items-start gap-2 relative">
            {/* Top horizontal line across all children */}
            {node.children!.length > 1 && (
              <div
                className="absolute top-0 bg-slate-300"
                style={{ left: "12px", right: "12px", height: "1px" }}
              />
            )}
            {node.children!.map((child, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-px h-4 bg-slate-300" />
                <SitemapNodeCard node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SitemapPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--header-height)] pb-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800">Sitemap — Application Urbyn</h1>
          <p className="text-sm text-slate-500 mt-1">Architecture des pages et parcours utilisateur</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-8">
          {(Object.entries(statusColors) as [NodeStatus, typeof statusColors[NodeStatus]][]).map(([status, colors]) => (
            <div key={status} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
              <span className="text-xs text-slate-600 capitalize">
                {status === "active" ? "Page active" : status === "planned" ? "Planifié" : "Informatif"}
              </span>
            </div>
          ))}
        </div>

        {/* Sitemap tree */}
        <div className="overflow-x-auto pb-8">
          <div className="inline-block min-w-full">
            <SitemapNodeCard node={sitemapData} depth={0} />
          </div>
        </div>

        {/* Route table */}
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">Toutes les routes</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Route</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Page / Composant</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Catégorie</th>
                  <th className="text-left px-4 py-3 text-slate-600 font-semibold">Statut</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { path: "/", page: "HomePage", category: "Accueil", status: "active" },
                  { path: "/definir-besoin", page: "DefinirBesoinPage", category: "Parcours devis", status: "active" },
                  { path: "/select-service/:product", page: "SelectServicePage", category: "Parcours devis", status: "active" },
                  { path: "/services-additionnels/:product", page: "ServicesAdditionnelsPage", category: "Parcours devis", status: "active" },
                  { path: "/services-specifiques/:product", page: "ServicesSpecifiquesPage", category: "Parcours devis", status: "active" },
                  { path: "/palissade", page: "PalissadeSubTypePage", category: "Palissade", status: "active" },
                  { path: "/palissade/habillage", page: "PalissadeHabillagePage", category: "Palissade", status: "active" },
                  { path: "/palissade/montage", page: "PalissadeMontagePage", category: "Palissade", status: "active" },
                  { path: "/palissade/resultats", page: "PalissadeResultsPage", category: "Palissade", status: "active" },
                  { path: "/totem", page: "TotemModelPage", category: "Totem", status: "active" },
                  { path: "/totem/caisson-bois/format", page: "TotemFormatPage", category: "Totem", status: "active" },
                  { path: "/totem/caisson-bois/compare", page: "TotemComparePage", category: "Totem", status: "active" },
                  { path: "/totem/caisson-bois/:format", page: "TotemConfigPage", category: "Totem", status: "active" },
                  { path: "/totem/gabion/config", page: "TotemConfigPage", category: "Totem", status: "active" },
                  { path: "/totem/liz/config", page: "TotemConfigPage", category: "Totem", status: "active" },
                  { path: "/totem/resultats", page: "TotemResultsPage", category: "Totem", status: "active" },
                  { path: "/totem/conformite", page: "TotemCompliancePage", category: "Totem", status: "active" },
                  { path: "/totem/conformite/resultats", page: "TotemComplianceResultsPage", category: "Totem", status: "active" },
                  { path: "/massif", page: "MassifCalculatorPage", category: "Massif", status: "active" },
                  { path: "/massif/resultats", page: "MassifResultsPage", category: "Massif", status: "active" },
                  { path: "/bet", page: "BETCalculatorPage", category: "BET", status: "active" },
                  { path: "/bet/resultats", page: "BETResultsPage", category: "BET", status: "active" },
                  { path: "/panier", page: "CartPage", category: "Commande", status: "active" },
                  { path: "/livraison", page: "DeliveryPage", category: "Commande", status: "active" },
                  { path: "/paiement", page: "PaymentPage", category: "Commande", status: "active" },
                  { path: "/login", page: "LoginPage", category: "Accès", status: "active" },
                  { path: "/partner/login", page: "PartnerLoginPage", category: "Accès", status: "active" },
                  { path: "/a-propos", page: "AboutPage", category: "Informations", status: "active" },
                  { path: "/contact", page: "ContactPage", category: "Informations", status: "active" },
                  { path: "/mentions-legales", page: "MentionsLegalesPage", category: "Légal", status: "active" },
                  { path: "/confidentialite", page: "ConfidentialitePage", category: "Légal", status: "active" },
                  { path: "/cookies", page: "CookiesPage", category: "Légal", status: "active" },
                  { path: "/cgv", page: "CGVPage", category: "Légal", status: "active" },
                ].map((row, i) => (
                  <tr key={i} className={`border-b border-slate-100 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                    <td className="px-4 py-2.5 font-mono text-xs text-slate-700">{row.path}</td>
                    <td className="px-4 py-2.5 text-xs text-slate-600">{row.page}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">{row.category}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
