import { useEffect, type MouseEvent } from 'react';
import { ArrowRight, LayoutGrid, MapPin, X } from 'lucide-react';
import { CATEGORY_ROUTES } from '../data/services';

interface MobileMenuSheetProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
  onNavigate: (path: string) => void;
  onJumpVisit: () => void;
}

function handleSheetLink(
  e: MouseEvent<HTMLAnchorElement>,
  path: string,
  onNavigate: (path: string) => void,
  onClose: () => void
) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  onNavigate(path);
  onClose();
}

export function MobileMenuSheet({
  isOpen,
  currentPath,
  onClose,
  onNavigate,
  onJumpVisit,
}: MobileMenuSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 md:hidden flex items-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-menu-sheet-title"
    >
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full bg-[#161311] text-[#F5EFE6] border-t border-[#322B27] rounded-t-3xl max-h-[84dvh] flex flex-col">
        {/* Sheet Header */}
        <div className="px-4 sm:px-5 py-4 border-b border-[#2D2622] flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
              Service Directory
            </p>
            <h2 id="mobile-menu-sheet-title" className="font-serif text-2xl text-[#F5EFE6]">
              Browse Categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu selector"
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6] shrink-0"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Sheet Category List */}
        <div className="overflow-y-auto px-4 sm:px-5 pt-2 pb-[max(1rem,env(safe-area-inset-bottom))] divide-y divide-[#2D2622]">
          <a
            href="/"
            onClick={(e) => handleSheetLink(e, '/', onNavigate, onClose)}
            className="w-full py-3.5 text-left flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="w-4 h-4 text-[#D4AF6A] shrink-0" strokeWidth={1.75} />
              <div>
                <span
                  className={`font-serif text-xl block ${
                    currentPath === '/' ? 'text-[#D4AF6A] font-medium' : 'text-[#F5EFE6]'
                  }`}
                >
                  All Categories Overview
                </span>
                <p className="text-xs text-[#BEB3A8]">
                  Return to home category cards
                </p>
              </div>
            </div>
            <ArrowRight
              className={`w-4 h-4 shrink-0 ${
                currentPath === '/' ? 'text-[#D4AF6A]' : 'text-[#786E65]'
              }`}
              strokeWidth={1.75}
            />
          </a>

          {CATEGORY_ROUTES.map((cat) => {
            const isSelected = currentPath === cat.path;
            return (
              <a
                key={cat.id}
                href={cat.path}
                onClick={(e) => handleSheetLink(e, cat.path, onNavigate, onClose)}
                className="w-full py-3.5 text-left flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xs font-medium text-[#D4AF6A] tabular-nums">
                      {cat.number}
                    </span>
                    <span
                      className={`font-serif text-xl ${
                        isSelected ? 'text-[#D4AF6A] font-medium' : 'text-[#F5EFE6]'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </div>
                  <p className="mt-0.5 pl-6 text-xs text-[#BEB3A8] tabular-nums truncate">
                    {cat.itemCountLabel} · {cat.rateRange}
                  </p>
                </div>
                <ArrowRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected ? 'text-[#D4AF6A]' : 'text-[#786E65]'
                  }`}
                  strokeWidth={1.75}
                />
              </a>
            );
          })}

          <button
            type="button"
            onClick={() => {
              onClose();
              onJumpVisit();
            }}
            className="w-full py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-[#D4AF6A] shrink-0" strokeWidth={1.75} />
              <span className="font-serif text-xl text-[#F5EFE6]">
                Pasig Location &amp; Contact
              </span>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0 text-[#786E65]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
