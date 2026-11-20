import { ArrowUpRight, MapPin, MessageCircle, MessageSquare, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/services';

interface FooterProps {
  onOpenTray: () => void;
}

export function Footer({ onOpenTray }: FooterProps) {
  return (
    <footer className="bg-[#0F0D0C] text-[#F5EFE6] border-t border-[#2D2622] pb-24 md:pb-0">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-start">
          {/* Brand Title & Location */}
          <div className="lg:col-span-5">
            <div className="mb-4">
              <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                Visit Our Sanctuary
              </p>
              <h2 className="mt-1.5 font-serif text-2xl sm:text-3xl font-normal text-[#F9F6F1]">
                {BUSINESS_INFO.name}
              </h2>
            </div>

            <p className="mt-3 text-sm sm:text-base text-[#D6CEC7] leading-relaxed flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D4AF6A] shrink-0 mt-1" strokeWidth={1.75} />
              <span>{BUSINESS_INFO.address}</span>
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href={BUSINESS_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#5C2434] text-[#F9F6F1] border border-[#9E7B4F]/40 hover:bg-[#702D40] transition-colors whitespace-nowrap"
              >
                <span>Google Maps Directions</span>
                <ArrowUpRight className="w-4 h-4" strokeWidth={1.75} />
              </a>

              <button
                type="button"
                onClick={onOpenTray}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#211C1A] border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Open Session Tray</span>
              </button>
            </div>
          </div>

          {/* Direct Reservations */}
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-[#2C2522] pt-8 lg:pt-0 lg:pl-10">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
              Reservations &amp; Inquiries
            </p>
            <p className="mt-2 font-serif text-3xl text-[#F9F6F1] tabular-nums">
              {BUSINESS_INFO.phoneDisplay}
            </p>
            <p className="mt-2 text-sm text-[#B6ABA3] leading-relaxed">
              Call, SMS, Viber, or Messenger to book a room, hammam suite, or outcall session.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5">
              <a
                href={BUSINESS_INFO.phoneHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#211C1A] border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors whitespace-nowrap"
              >
                <Phone className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>Call</span>
              </a>
              <a
                href={BUSINESS_INFO.smsHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#211C1A] border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors whitespace-nowrap"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>SMS</span>
              </a>
              <a
                href={BUSINESS_INFO.viberHref}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#211C1A] border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>Viber</span>
              </a>
              <a
                href={BUSINESS_INFO.messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#211C1A] border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>Messenger</span>
              </a>
            </div>
          </div>

          {/* Official Channels */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[#2C2522] pt-8 lg:pt-0 lg:pl-10">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
              Official Channels
            </p>
            <ul className="mt-3.5 space-y-3 text-sm">
              <li>
                <a
                  href={BUSINESS_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D6CEC7] hover:text-[#F9F6F1] underline decoration-[#38302C] underline-offset-4 transition-colors"
                >
                  <span>Facebook Page</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_INFO.messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D6CEC7] hover:text-[#F9F6F1] underline decoration-[#38302C] underline-offset-4 transition-colors"
                >
                  <span>Direct Messenger</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_INFO.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D6CEC7] hover:text-[#F9F6F1] underline decoration-[#38302C] underline-offset-4 transition-colors"
                >
                  <span>Instagram (@apros.wellness)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                </a>
              </li>
              <li>
                <a
                  href={BUSINESS_INFO.xUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#D6CEC7] hover:text-[#F9F6F1] underline decoration-[#38302C] underline-offset-4 transition-colors"
                >
                  <span>X (@apros_spa)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-[#2C2522] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#B6ABA3]">
          <span>Apros Wellness Spa · Pasig City</span>
          <span>2nd Floor, JML Bldg. 3 Octagon Dela Paz · {BUSINESS_INFO.phoneDisplay}</span>
        </div>
      </div>
    </footer>
  );
}
