import visaSvg from '@/imports/visa.svg';
import mastercardSvg from '@/imports/master-card.svg';

export function PaymentIcons() {
  return (
    <div className="flex items-center justify-center gap-2.5">
      <img src={visaSvg} alt="Visa" className="h-7 w-auto" />
      <img src={mastercardSvg} alt="Mastercard" className="h-7 w-auto" />

      {/* Virement bancaire */}
      <svg viewBox="0 0 60 38" className="h-7 w-auto" aria-label="Virement bancaire" role="img">
        <rect width="60" height="38" rx="5" fill="white" />
        <rect width="60" height="38" rx="5" fill="none" stroke="#E5E7EB" strokeWidth="1" />
        <polygon points="30,6 48,15 12,15" fill="#6B7280" />
        <rect x="15" y="16" width="4" height="12" fill="#9CA3AF" />
        <rect x="22" y="16" width="4" height="12" fill="#9CA3AF" />
        <rect x="29" y="16" width="4" height="12" fill="#9CA3AF" />
        <rect x="36" y="16" width="4" height="12" fill="#9CA3AF" />
        <rect x="43" y="16" width="4" height="12" fill="#9CA3AF" />
        <rect x="12" y="29" width="36" height="3" rx="1" fill="#6B7280" />
      </svg>

      <span className="text-xs text-gray-400">Virement</span>
    </div>
  );
}
