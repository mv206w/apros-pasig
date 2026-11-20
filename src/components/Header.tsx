import type { MouseEvent } from 'react';
import { CATEGORY_ROUTES } from '../data/services';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentPath: string;
  trayCount: number;
  onNavigate: (path: string) => void;
  onOpenTray: () => void;
}

function handleNavLink(
  e: MouseEvent<HTMLAnchorElement>,
  path: string,
  onNavigate: (path: string) => void
) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
    return;
  }
  e.preventDefault();
  onNavigate(path);
}

export function Header({ currentPath, trayCount, onNavigate, onOpenTray }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-[#0F0D0C]/95 backdrop-blur-md border-b border-[#2D2622]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 h-14 md:h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Circular logo crest + single-line wordmark linking to / */}
        <a
          href="/"
          onClick={(e) => handleNavLink(e, '/', onNavigate)}
          className="inline-flex items-center gap-2.5 sm:gap-3 min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF6A]"
        >
          <BrandLogo size="sm" className="!w-8 !h-8 sm:!w-9 sm:!h-9" />
          <span className="font-serif text-lg sm:text-2xl font-medium tracking-tight text-[#F9F6F1] whitespace-nowrap truncate">
            Apros Wellness Spa
          </span>
        </a>

        {/* Zone 2: Concise single-line semantic route links (shown on home / only) */}
        {currentPath === '/' && (
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs xl:text-sm text-[#D6CEC7]"
          >
            {CATEGORY_ROUTES.map((cat) => (
              <a
                key={cat.id}
                href={cat.path}
                onClick={(e) => handleNavLink(e, cat.path, onNavigate)}
                className="hover:text-[#F9F6F1] hover:underline underline-offset-4 decoration-[#D4AF6A] transition-colors whitespace-nowrap shrink-0"
              >
                {cat.shortLabel}
              </a>
            ))}
          </nav>
        )}

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenTray}
            className="px-3.5 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-full bg-[#5C2434] text-[#F9F6F1] border border-[#9E7B4F]/40 hover:bg-[#702D40] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A]"
          >
            Session Tray{trayCount > 0 ? ` (${trayCount})` : ''}
          </button>
        </div>
      </div>
    </header>
  );
}
