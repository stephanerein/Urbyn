import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
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
import { SitemapPage } from './pages/SitemapPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/definir-besoin" element={<DefinirBesoinPage />} />
      <Route path="/services-additionnels/:product" element={<ServicesAdditionnelsPage />} />
      <Route path="/services-specifiques/:product" element={<ServicesSpecifiquesPage />} />
      <Route path="/select-service/:product" element={<SelectServicePage />} />

      {/* Palissade Routes */}
      <Route path="/palissade" element={<PalissadeSubTypePage />} />
      <Route path="/palissade/habillage" element={<PalissadeHabillagePage />} />
      <Route path="/palissade/montage" element={<PalissadeMontagePage />} />
      <Route path="/palissade/resultats" element={<PalissadeResultsPage />} />

      {/* Totem Routes - New multi-step flow */}
      <Route path="/totem" element={<TotemModelPage />} />
      <Route path="/totem/acquisition" element={<TotemAcquisitionPage />} />
      <Route path="/totem/location" element={<TotemLocationPage />} />
      <Route path="/totem/caisson-bois/format" element={<TotemFormatPage />} />
      <Route path="/totem/caisson-bois/compare" element={<TotemComparePage />} />
      <Route path="/totem/caisson-bois/:format" element={<TotemConfigPage />} />
      <Route path="/totem/sign-iz" element={<TotemSignIzPage />} />
      <Route path="/totem/sign-iz/acquisition" element={<TotemSignIzAcquisitionPage />} />
      <Route path="/totem/sign-iz/location" element={<TotemSignIzLocationPage />} />
      <Route path="/totem/caisson-bois-120/location" element={<TotemCaissonBoisLocationPage />} />
      <Route path="/totem/gabion/config" element={<TotemConfigPage />} />
      <Route path="/totem/liz/config" element={<TotemConfigPage />} />
      <Route path="/totem/resultats" element={<TotemResultsPage />} />
      <Route path="/totem/conformite" element={<TotemCompliancePage />} />
      <Route path="/totem/conformite/resultats" element={<TotemComplianceResultsPage />} />

      {/* Massif Routes */}
      <Route path="/massif/selection" element={<MassifSelectionPage />} />
      <Route path="/massif" element={<MassifCalculatorPage />} />
      <Route path="/massif/resultats" element={<MassifResultsPage />} />

      {/* BET Routes */}
      <Route path="/bet" element={<BETCalculatorPage />} />
      <Route path="/bet/resultats" element={<BETResultsPage />} />

      {/* Cart */}
      <Route path="/panier" element={<CartPage />} />
      <Route path="/cart" element={<CartPage />} /> {/* Alias */}

      {/* Delivery and Payment */}
      <Route path="/livraison" element={<DeliveryPage />} />
      <Route path="/chiffrage-final" element={<ChiffrageFinalPage />} />
      <Route path="/paiement" element={<PaymentPage />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/partner/login" element={<PartnerLoginPage />} />

      {/* Legal & Info Pages */}
      <Route path="/mentions-legales" element={<MentionsLegalesPage />} />
      <Route path="/confidentialite" element={<ConfidentialitePage />} />
      <Route path="/cookies" element={<CookiesPage />} />
      <Route path="/cgv" element={<CGVPage />} />
      <Route path="/sitemap" element={<SitemapPage />} />
      <Route path="/a-propos" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  );
}
