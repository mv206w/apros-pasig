import { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  MessageCircle,
  MessageSquare,
  Minus,
  Phone,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { BUSINESS_INFO, formatPeso } from '../data/services';
import type { TrayItem } from '../types/booking';
import { BrandLogo } from './BrandLogo';

interface BookingTrayDrawerProps {
  isOpen: boolean;
  items: TrayItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearTray: () => void;
}

export function BookingTrayDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearTray,
}: BookingTrayDrawerProps) {
  const [guestName, setGuestName] = useState('');
  const [preferredSchedule, setPreferredSchedule] = useState('');
  const [notes, setNotes] = useState('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'messenger'>('idle');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalTimedMinutes = items.reduce(
    (sum, item) => sum + (item.durationMinutes ? item.durationMinutes * item.quantity : 0),
    0
  );
  const hasTranspoNote = items.some((item) => item.note?.includes('Transpo'));
  const hasUnlimitedWetArea = items.some(
    (item) =>
      item.note?.includes('Unlimited Wet Area') ||
      item.durationLabel.includes('Unlimited') ||
      item.details?.some((d) => d.includes('Unlimited'))
  );

  const buildBookingSummary = (): string => {
    const lines: string[] = ['Hello Apros Wellness Spa – Pasig Branch, I would like to request a booking:'];
    lines.push('');

    items.forEach((item, idx) => {
      const qtyPrefix = item.quantity > 1 ? `${item.quantity}x ` : '';
      const lineTotal = formatPeso(item.price * item.quantity);
      const transpoSuffix = item.note?.includes('Transpo') ? ' + Transpo' : '';
      lines.push(`${idx + 1}. ${qtyPrefix}${item.title} — ${lineTotal}${transpoSuffix}`);
      if (item.details && item.details.length > 0) {
        item.details.forEach((detail) => lines.push(`   • ${detail}`));
      }
    });

    lines.push('');
    if (totalTimedMinutes > 0) {
      lines.push(`Estimated Treatment Time: ${totalTimedMinutes} minutes${hasUnlimitedWetArea ? ' + Unlimited Wet Area' : ''}`);
    }
    lines.push(`Total Rate: ${formatPeso(totalAmount)}${hasTranspoNote ? ' (+ Transpo for Home/Hotel Service)' : ''}`);

    if (guestName.trim()) {
      lines.push(`Guest Name: ${guestName.trim()}`);
    }
    if (preferredSchedule.trim()) {
      lines.push(`Preferred Date & Time: ${preferredSchedule.trim()}`);
    }
    if (notes.trim()) {
      lines.push(`Notes / Location: ${notes.trim()}`);
    }

    return lines.join('\n');
  };

  const copySummaryToClipboard = async (mode: 'copied' | 'messenger') => {
    const text = buildBookingSummary();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopyStatus(mode);
    window.setTimeout(() => setCopyStatus('idle'), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-tray-heading"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over drawer */}
      <aside className="relative z-10 w-full max-w-md bg-[#0F0D0C] text-[#F5EFE6] border-l border-[#2D2622] h-full flex flex-col">
        {/* Drawer Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#2D2622] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <BrandLogo size="sm" />
            <div className="min-w-0">
              <h2
                id="session-tray-heading"
                className="font-serif text-2xl font-medium text-[#F5EFE6] leading-none"
              >
                Session Tray
              </h2>
              <p className="text-xs text-[#BEB3A8] tabular-nums mt-1 truncate">
                {totalCount === 0
                  ? 'No treatments selected yet'
                  : `${totalCount} ${totalCount === 1 ? 'treatment' : 'treatments'} · ${formatPeso(totalAmount)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Session Planner Tray"
            className="w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[#BEB3A8] hover:text-[#F5EFE6] border border-[#322B27] hover:border-[#D4AF6A] transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
          {items.length === 0 ? (
            <div className="py-10 sm:py-12 text-center rounded-2xl border border-dashed border-[#322B27] px-5 sm:px-6 bg-[#161311]">
              <p className="font-serif text-xl text-[#F5EFE6]">
                Your session tray is empty.
              </p>
              <p className="mt-2 text-sm text-[#BEB3A8] leading-relaxed">
                Pick treatments from the menu to calculate your session time and book via Messenger or SMS.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 px-5 py-2.5 rounded-full text-xs font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187]">
                  Selected Treatments
                </span>
                <button
                  type="button"
                  onClick={onClearTray}
                  className="text-xs text-[#BEB3A8] hover:text-[#D4AF6A] underline underline-offset-4 cursor-pointer"
                >
                  Clear All
                </button>
              </div>

              <ul className="divide-y divide-[#2D2622] border-t border-b border-[#2D2622]">
                {items.map((item) => (
                  <li key={item.id} className="py-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#D4AF6A]">
                          {item.category}
                        </p>
                        <h3 className="font-serif text-lg font-medium text-[#F5EFE6] leading-snug mt-0.5">
                          {item.title}
                        </h3>
                        <p className="text-xs text-[#BEB3A8] mt-0.5 tabular-nums">
                          {item.durationLabel}
                          {item.note ? ` · ${item.note}` : ''}
                        </p>
                        {item.details && item.details.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 text-xs text-[#BEB3A8]">
                            {item.details.map((detail) => (
                              <li key={detail}>— {detail}</li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-semibold text-[#D4AF6A] tabular-nums">
                          {formatPeso(item.price * item.quantity)}
                        </span>
                        {item.note?.includes('Transpo') && (
                          <span className="block text-[11px] text-[#9C9187]">+ Transpo</span>
                        )}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-[#322B27] bg-[#1E1A17] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          aria-label={`Decrease quantity for ${item.title}`}
                          className="p-2.5 sm:p-2 text-[#F5EFE6] hover:bg-[#2A2420] transition-colors cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" strokeWidth={1.75} />
                        </button>
                        <span className="px-3 text-xs font-medium text-[#F5EFE6] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          aria-label={`Increase quantity for ${item.title}`}
                          className="p-2.5 sm:p-2 text-[#F5EFE6] hover:bg-[#2A2420] transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" strokeWidth={1.75} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="inline-flex items-center gap-1 py-1 text-xs text-[#9C9187] hover:text-[#D4AF6A] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.75} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Optional Guest Details */}
              <div className="mt-6 space-y-3">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187]">
                  Booking Details (Optional)
                </p>
                <div>
                  <label htmlFor="tray-guest-name" className="block text-xs text-[#BEB3A8] mb-1">
                    Your Name
                  </label>
                  <input
                    id="tray-guest-name"
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Marco Santos"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl text-base sm:text-sm bg-[#161311] border border-[#322B27] text-[#F5EFE6] placeholder:text-[#786E65] focus:outline-none focus:border-[#D4AF6A]"
                  />
                </div>
                <div>
                  <label htmlFor="tray-schedule" className="block text-xs text-[#BEB3A8] mb-1">
                    Preferred Date &amp; Time
                  </label>
                  <input
                    id="tray-schedule"
                    type="text"
                    value={preferredSchedule}
                    onChange={(e) => setPreferredSchedule(e.target.value)}
                    placeholder="e.g. Saturday, 4:00 PM"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl text-base sm:text-sm bg-[#161311] border border-[#322B27] text-[#F5EFE6] placeholder:text-[#786E65] focus:outline-none focus:border-[#D4AF6A]"
                  />
                </div>
                <div>
                  <label htmlFor="tray-notes" className="block text-xs text-[#BEB3A8] mb-1">
                    Address or Pressure Notes
                  </label>
                  <textarea
                    id="tray-notes"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Firm Hilot pressure or outcall address"
                    className="w-full px-3.5 py-2.5 sm:py-2 rounded-xl text-base sm:text-sm bg-[#161311] border border-[#322B27] text-[#F5EFE6] placeholder:text-[#786E65] focus:outline-none focus:border-[#D4AF6A] resize-none"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Drawer Footer Totals & Direct Booking Actions */}
        <div className="px-4 sm:px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] border-t border-[#2D2622] bg-[#161311]">
          {items.length > 0 && (
            <div className="mb-4 space-y-1.5 text-sm">
              {totalTimedMinutes > 0 && (
                <div className="flex items-center justify-between text-[#BEB3A8] text-xs">
                  <span>Total Timed Duration</span>
                  <span className="tabular-nums font-medium text-[#F5EFE6]">
                    {totalTimedMinutes} min{hasUnlimitedWetArea ? ' + Unlimited Wet Area' : ''}
                  </span>
                </div>
              )}
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-lg text-[#F5EFE6]">Estimated Total</span>
                <div className="text-right">
                  <span className="text-xl font-semibold text-[#D4AF6A] tabular-nums">
                    {formatPeso(totalAmount)}
                  </span>
                  {hasTranspoNote && (
                    <span className="block text-[11px] text-[#9C9187]">
                      + Transpo for Home / Hotel Service
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {copyStatus !== 'idle' && (
            <div
              role="status"
              className="mb-3 px-3.5 py-2 rounded-xl text-xs bg-[#1E1A17] border border-[#D4AF6A]/60 text-[#F5EFE6] flex items-center gap-2"
            >
              <Check className="w-3.5 h-3.5 text-[#D4AF6A] shrink-0" strokeWidth={2.2} />
              <span>
                {copyStatus === 'messenger'
                  ? 'Reservation summary copied — paste it into Messenger to send.'
                  : 'Reservation summary copied to your clipboard.'}
              </span>
            </div>
          )}

          <div className="space-y-2.5">
            <a
              href={BUSINESS_INFO.messengerUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                if (items.length > 0) {
                  void copySummaryToClipboard('messenger');
                }
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={1.75} />
              <span>Book via Messenger</span>
            </a>

            <div className="grid grid-cols-3 gap-2">
              {items.length > 0 && (
                <button
                  type="button"
                  onClick={() => void copySummaryToClipboard('copied')}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Copy className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                  <span>Copy List</span>
                </button>
              )}

              <a
                href={BUSINESS_INFO.phoneHref}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] transition-colors whitespace-nowrap ${
                  items.length === 0 ? 'col-span-2' : ''
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>Call Direct</span>
              </a>

              <a
                href={BUSINESS_INFO.smsHref}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>SMS</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
