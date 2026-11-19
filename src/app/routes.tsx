import { Routes, Route, Navigate, matchPath, useLocation } from 'react-router-dom';
import vercelConfig from '../../vercel.json';
import { HomePage } from './pages/HomePage';
import { HabillageUrbainPage } from './pages/HabillageUrbainPage';
import { SolutionsOmbragePage } from './pages/SolutionsOmbragePage';
import { PatioSolutionsPage } from './pages/ombrage/PatioSolutionsPage';
import { PatioServicesPage } from './pages/ombrage/PatioServicesPage';
import { PatioConfigPage } from './pages/ombrage/PatioConfigPage';
import { PatioCalibragePage } from './pages/ombrage/PatioCalibragePage';
import { PatioChiffragePage } from './pages/ombrage/PatioChiffragePage';
import { PatioCoordonneesPage } from './pages/ombrage/PatioCoordonneesPage';
import { DefinirBesoinPage } from './pages/DefinirBesoinPage';
import { ServicesAdditionnelsPage } from './pages/ServicesAdditionnelsPage';
import { ServicesSpecifiquesPage } from './pages/ServicesSpecifiquesPage';
import { SelectServicePage } from './pages/SelectServicePage';
import { PalissadeSubTypePage } from './pages/PalissadeSubTypePage';
import { PalissadeHabillagePage } from './pages/PalissadeHabillagePage';
import { PalissadeMontagePage } from './pages/PalissadeMontagePage';
import { PalissadeResultsPage } from './pages/PalissadeResultsPage';
import { TotemModelPage } from './pages/totem/TotemModelPage';
import { TotemAcquisitionPage } from './pages/totem/TotemAcquisitionPage';
import { TotemLocationPage } from './pages/totem/TotemLocationPage';
import { TotemFamilyProductsPage } from './pages/totem/TotemFamilyProductsPage';
import { TotemProductDetailPage } from './pages/totem/TotemProductDetailPage';
import { TotemFormatPage } from './pages/totem/TotemFormatPage';
import { TotemComparePage } from './pages/totem/TotemComparePage';
import { TotemConfigPage } from './pages/totem/TotemConfigPage';
import { TotemSignIzPage } from './pages/totem/TotemSignIzPage';
import { TotemSignIzAcquisitionPage } from './pages/totem/TotemSignIzAcquisitionPage';
import { TotemSignIzLocationPage } from './pages/totem/TotemSignIzLocationPage';
import { TotemCaissonBoisLocationPage } from './pages/totem/TotemCaissonBoisLocationPage';
import { TotemResultsPage } from './pages/TotemResultsPage';
import { TotemCompliancePage } from './pages/TotemCompliancePage';
import { TotemComplianceResultsPage } from './pages/TotemComplianceResultsPage';
import { MassifCalculatorPage } from './pages/MassifCalculatorPage';
import { MassifSelectionPage } from './pages/MassifSelectionPage';
import { MassifResultsPage } from './pages/MassifResultsPage';
import { BETCalculatorPage } from './pages/BETCalculatorPage';
import { BETResultsPage } from './pages/BETResultsPage';
import { CartPage } from './pages/CartPage';
import { LoginPage } from './pages/LoginPage';
import { PartnerLoginPage } from './pages/PartnerLoginPage';
import { MentionsLegalesPage } from './pages/MentionsLegalesPage';
import { ConfidentialitePage } from './pages/ConfidentialitePage';
import { CookiesPage } from './pages/CookiesPage';
import { CGVPage } from './pages/CGVPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { DeliveryPage } from './pages/DeliveryPage';
import { PaymentPage } from './pages/PaymentPage';
import { ChiffrageFinalPage } from './pages/ChiffrageFinalPage';
import { OrdersPage } from './pages/OrdersPage';
import { LeadsPage } from './pages/LeadsPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { SitemapPage } from './pages/SitemapPage';
import { PlanDuSitePage } from './pages/PlanDuSitePage';
import { RealisationsPage } from './pages/RealisationsPage';
import { RealisationDetailPage } from './pages/RealisationDetailPage';
import { SupplierLayout } from './pages/supplier/SupplierLayout';
import {
  SupplierCatalogRoute,
  SupplierDashboardRoute,
  SupplierPaymentBankCreateRoute,
  SupplierPaymentBankEditRoute,
  SupplierPaymentMethodCreateRoute,
  SupplierPaymentMethodEditRoute,
  SupplierPaymentPickRoute,
  SupplierProductRoute,
  SupplierShippingPickRoute,
  SupplierShippingPricingCreateRoute,
  SupplierShippingPricingEditRoute,
  SupplierShippingZoneCreateRoute,
  SupplierShippingZoneEditRoute,
} from './pages/supplier/supplierRouteElements';
import { PaymentHub } from './pages/supplier/payment/PaymentHub';
import { ShippingHub } from './pages/supplier/shipping/ShippingHub';
import { AdminGuard, AdminLayout } from './pages/admin/AdminLayout';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage';
import { AdminProductDetailPage } from './pages/admin/AdminProductDetailPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminUserDetailPage } from './pages/admin/AdminUserDetailPage';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage';
import { AdminCompanyDetailPage } from './pages/admin/AdminCompanyDetailPage';

// Anciennes URL : la source de vérité est `vercel.json` (redirections 301 servies
// aux moteurs de recherche). Ce composant rejoue les mêmes règles côté navigateur,
// pour le développement local et les liens internes qui n'auraient pas été migrés.
// Syntaxe Vercel : « :param » pour un segment, « :reste* » pour la fin du chemin.
const REDIRECTIONS_HERITEES = vercelConfig.redirects.map(({ source, destination }) => ({
  motif: source.replace(/\/:\w+\*$/, '/*'),
  destination,
}));

function RedirectionHeritee() {
  const { pathname, search, hash } = useLocation();
  for (const { motif, destination } of REDIRECTIONS_HERITEES) {
    const correspondance = matchPath({ path: motif, end: true }, pathname);
    if (!correspondance) continue;
    const params = correspondance.params;
    const cible = destination
      .replace(/:\w+\*/, (params['*'] ?? '').replace(/\/$/, ''))
      .replace(/:(\w+)/g, (_, nom: string) => params[nom] ?? '')
      .replace(/\/$/, '');
    return <Navigate to={`${cible || '/'}${search}${hash}`} replace />;
  }
  return null;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/habillage-urbain" element={<HabillageUrbainPage />} />
      <Route path="/solutions-ombrage" element={<SolutionsOmbragePage />} />
      <Route path="/solutions-ombrage/patio" element={<PatioSolutionsPage />} />
      <Route path="/solutions-ombrage/patio/services" element={<PatioServicesPage />} />
      <Route path="/solutions-ombrage/patio/dimensions" element={<PatioConfigPage />} />
      <Route path="/solutions-ombrage/patio/calibrage" element={<PatioCalibragePage />} />
      <Route path="/solutions-ombrage/patio/chiffrage" element={<PatioChiffragePage />} />
      <Route path="/solutions-ombrage/patio/coordonnees" element={<PatioCoordonneesPage />} />
      <Route path="/configurateur" element={<DefinirBesoinPage />} />
      <Route path="/configurateur/:product/services-additionnels" element={<ServicesAdditionnelsPage />} />
      <Route path="/configurateur/:product/services-specifiques" element={<ServicesSpecifiquesPage />} />
      <Route path="/configurateur/:product/choix-service" element={<SelectServicePage />} />

      {/* Palissade Routes */}
      <Route path="/habillage-urbain/palissades" element={<PalissadeSubTypePage />} />
      <Route path="/habillage-urbain/palissades/habillage" element={<PalissadeHabillagePage />} />
      <Route path="/habillage-urbain/palissades/montage" element={<PalissadeMontagePage />} />
      <Route path="/habillage-urbain/palissades/resultats" element={<PalissadeResultsPage />} />

      {/* Totem Routes */}
      <Route path="/habillage-urbain/totems" element={<TotemModelPage />} />
      <Route path="/habillage-urbain/totems/acquisition" element={<TotemAcquisitionPage />} />
      <Route path="/habillage-urbain/totems/location" element={<TotemLocationPage />} />
      <Route path="/habillage-urbain/totems/:offer/famille/:familyId" element={<TotemFamilyProductsPage />} />
      <Route path="/habillage-urbain/totems/:offer/comparer" element={<TotemComparePage />} />
      <Route path="/habillage-urbain/totems/:offer/produit/:productId" element={<TotemProductDetailPage />} />
      <Route path="/habillage-urbain/totems/caisson-bois/format" element={<TotemFormatPage />} />
      <Route path="/habillage-urbain/totems/caisson-bois/comparer" element={<TotemComparePage />} />
      <Route path="/habillage-urbain/totems/caisson-bois/:format" element={<TotemConfigPage />} />
      <Route path="/habillage-urbain/totems/sign-iz" element={<TotemSignIzPage />} />
      <Route path="/habillage-urbain/totems/sign-iz/acquisition" element={<TotemSignIzAcquisitionPage />} />
      <Route path="/habillage-urbain/totems/sign-iz/location" element={<TotemSignIzLocationPage />} />
      <Route path="/habillage-urbain/totems/caisson-bois-120/location" element={<TotemCaissonBoisLocationPage />} />
      <Route path="/habillage-urbain/totems/gabion/configuration" element={<TotemConfigPage />} />
      <Route path="/habillage-urbain/totems/liz/configuration" element={<TotemConfigPage />} />
      <Route path="/habillage-urbain/totems/resultats" element={<TotemResultsPage />} />
      <Route path="/habillage-urbain/totems/conformite" element={<TotemCompliancePage />} />
      <Route path="/habillage-urbain/totems/conformite/resultats" element={<TotemComplianceResultsPage />} />

      {/* Massif Routes */}
      <Route path="/habillage-urbain/massifs-beton" element={<MassifSelectionPage />} />
      <Route path="/habillage-urbain/massifs-beton/calcul" element={<MassifCalculatorPage />} />
      <Route path="/habillage-urbain/massifs-beton/resultats" element={<MassifResultsPage />} />

      {/* BET Routes */}
      <Route path="/bureau-d-etudes" element={<BETCalculatorPage />} />
      <Route path="/bureau-d-etudes/resultats" element={<BETResultsPage />} />

      {/* Cart */}
      <Route path="/panier" element={<CartPage />} />

      {/* Delivery and Payment (client) */}
      <Route path="/livraison" element={<DeliveryPage />} />
      <Route path="/chiffrage-final" element={<ChiffrageFinalPage />} />
      <Route path="/paiement" element={<PaymentPage />} />
      <Route path="/compte/commandes" element={<OrdersPage />} />
      <Route path="/compte/parametres" element={<AccountSettingsPage />} />
      <Route path="/fournisseur/leads" element={<LeadsPage />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/partner/login" element={<PartnerLoginPage />} />

      {/* Admin (mêmes URLs que frontend) */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminGuard>
            <AdminLayout />
          </AdminGuard>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="catalogues" element={<AdminCatalogPage />} />
        <Route path="produits/:id" element={<AdminProductDetailPage />} />
        <Route path="utilisateurs" element={<AdminUsersPage />} />
        <Route path="utilisateurs/:id" element={<AdminUserDetailPage />} />
        <Route path="societes" element={<AdminCompaniesPage />} />
        <Route path="societes/:tva" element={<AdminCompanyDetailPage />} />
      </Route>

      {/* Portail fournisseur */}
      <Route path="/fournisseur" element={<SupplierLayout />}>
        <Route index element={<SupplierDashboardRoute />} />
        <Route path="offres/catalogue" element={<SupplierCatalogRoute />} />
        <Route path="offres/produit" element={<SupplierProductRoute />} />
        <Route path="offres/service" element={<Navigate to="/fournisseur/offres/catalogue" replace />} />
        <Route path="offres/liaison" element={<Navigate to="/fournisseur/offres/catalogue" replace />} />
        <Route path="offres/prix" element={<Navigate to="/fournisseur/offres/produit" replace />} />
        <Route path="expedition" element={<ShippingHub />} />
        <Route path="expedition/creer/zones" element={<SupplierShippingZoneCreateRoute />} />
        <Route path="expedition/creer/tarifs" element={<SupplierShippingPricingCreateRoute />} />
        <Route path="expedition/modifier/choix" element={<SupplierShippingPickRoute />} />
        <Route path="expedition/modifier/zones" element={<SupplierShippingZoneEditRoute />} />
        <Route path="expedition/modifier/tarifs" element={<SupplierShippingPricingEditRoute />} />
        <Route path="paiement" element={<PaymentHub />} />
        <Route path="paiement/creer/methode" element={<SupplierPaymentMethodCreateRoute />} />
        <Route path="paiement/creer/banque" element={<SupplierPaymentBankCreateRoute />} />
        <Route path="paiement/modifier/choix" element={<SupplierPaymentPickRoute />} />
        <Route path="paiement/modifier/methode" element={<SupplierPaymentMethodEditRoute />} />
        <Route path="paiement/modifier/banque" element={<SupplierPaymentBankEditRoute />} />
      </Route>

      {/* Legal & Info Pages */}
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/confidentialite" element={<ConfidentialitePage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/cgv" element={<CGVPage />} />
      <Route path="/sitemap" element={<SitemapPage />} />
      <Route path="/plan-du-site" element={<PlanDuSitePage />} />
      <Route path="/realisations" element={<RealisationsPage />} />
      <Route path="/realisations/:slug" element={<RealisationDetailPage />} />
      <Route path="/a-propos" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Anciennes URL (voir vercel.json) */}
      <Route path="*" element={<RedirectionHeritee />} />
    </Routes>
  );
}
