import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-slate-800 to-slate-900 text-slate-300 mt-20 border-t-4 border-slate-600">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Section principale */}
        <div className="border-b border-slate-700 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-sm text-slate-500">
              © {currentYear} Urbanize. Tous droits réservés.
            </p>

            {/* Liens légaux et navigation */}
            <div className="flex flex-wrap gap-6 text-sm justify-center">
              <Link
                to="/a-propos"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                À propos
              </Link>
              <Link
                to="/contact"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Contact
              </Link>
              <Link
                to="/mentions-legales"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Mentions légales
              </Link>
              <Link
                to="/plan-du-site"
                className="text-slate-400 hover:text-white transition-colors hover:underline"
              >
                Plan du site
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}