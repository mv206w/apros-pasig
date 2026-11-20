import { ArrowDown, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '../data/services';
import { useCatalog } from '../context/CatalogContext';
import { EditorialImage } from './EditorialImage';

export function Hero() {
  const { siteConfig, loadingCatalog } = useCatalog();
  const hasHeroPhoto = !loadingCatalog && siteConfig.heroImageUrl.trim().length > 0;

  return (
    <section id="top" className="bg-[#0F0D0C] text-[#F5EFE6] border-b border-[#2D2622]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 pb-10 sm:pt-10 sm:pb-12 lg:pt-16 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-stretch">
          {/* Editorial Copy Column */}
          <div
            className={`${
              hasHeroPhoto || loadingCatalog ? 'lg:col-span-6' : 'lg:col-span-10'
            } flex flex-col justify-between py-1`}
          >
            <div>
              <p className="text-[11px] sm:text-xs tracking-[0.14em] uppercase text-[#D4AF6A] mb-3.5 sm:mb-5">
                Pasig City <span aria-hidden="true" className="mx-1.5 text-[#9E7B4F]">·</span> Dela Paz Sanctuary
              </p>

              <h1
                className="font-serif font-normal text-[#F9F6F1] leading-[1.06] tracking-tight text-balance"
                style={{ fontSize: 'clamp(2.15rem, 4.1vw, 4.2rem)' }}
              >
                Traditional Filipino bodywork, unhurried and deeply restorative.
              </h1>

              <p className="mt-4 sm:mt-6 text-sm sm:text-base text-[#D6CEC7] leading-relaxed max-w-xl">
                Quiet{' '}
                <em className="font-serif italic text-[#F9F6F1] text-base sm:text-lg">haplos</em> and{' '}
                <em className="font-serif italic text-[#F9F6F1] text-base sm:text-lg">hilot</em>{' '}
                bodywork with warm coconut oil, heated basalt stones, and Moroccan steam rituals in Dela Paz, Pasig.
              </p>
            </div>

            <div className="mt-7 sm:mt-9 pt-6 sm:pt-7 border-t border-[#2C2522] flex flex-wrap items-center gap-3 sm:gap-5">
              <a
                href="#categories"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('categories')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="inline-flex items-center gap-2.5 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-medium rounded-full bg-[#5C2434] text-[#F9F6F1] border border-[#9E7B4F]/40 hover:bg-[#702D40] transition-colors duration-150 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A]"
              >
                <span>Browse Categories</span>
                <ArrowDown className="hidden md:block w-4 h-4" strokeWidth={1.75} />
              </a>

              <a
                href={BUSINESS_INFO.phoneHref}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 text-sm rounded-full border border-[#38302C] text-[#F9F6F1] hover:border-[#D4AF6A] transition-colors whitespace-nowrap shrink-0 tabular-nums"
              >
                <Phone className="w-4 h-4 text-[#D4AF6A]" strokeWidth={1.75} />
                <span>{BUSINESS_INFO.phoneDisplay}</span>
              </a>
            </div>
          </div>

          {/* Sanctuary Focal Image */}
          {loadingCatalog ? (
            <div
              aria-hidden="true"
              className="lg:col-span-6 rounded-2xl min-h-[220px] sm:min-h-[260px] lg:min-h-[430px] bg-[#161311] border border-[#26201D] animate-pulse"
            />
          ) : hasHeroPhoto ? (
            <div className="lg:col-span-6 flex">
              <EditorialImage
                src={siteConfig.heroImageUrl}
                alt={
                  siteConfig.heroImageAlt ||
                  'Private treatment room at Apros Wellness Spa'
                }
                caption={siteConfig.heroImageCaption || undefined}
                className="w-full"
                imgClassName="w-full h-full min-h-[220px] sm:min-h-[280px] lg:min-h-[430px] object-cover"
              />
            </div>
          ) : null}
        </div>

        {/* Full-Width 4-Column Operational Ledger */}
        <dl className="mt-9 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 border-t border-[#2C2522] divide-y sm:divide-y-0 lg:divide-x divide-[#2C2522]">
          <div className="py-4 sm:py-5 lg:pr-6">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#B6ABA3]">
              Pasig Branch
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#F9F6F1]">
              2nd Flr, JML Bldg. 3 Octagon, Dela Paz
            </dd>
          </div>
          <div className="py-4 sm:py-5 lg:px-6">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#B6ABA3]">
              Core Disciplines
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#F9F6F1]">
              Hilot · Ventosa · Hammam · Acupuncture
            </dd>
          </div>
          <div className="py-4 sm:py-5 lg:px-6">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#B6ABA3]">
              Outcall Coverage
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#F9F6F1]">
              Home &amp; Hotel Visits up to 20 km
            </dd>
          </div>
          <div className="pt-4 pb-1 sm:py-5 lg:pl-6">
            <dt className="text-[11px] uppercase tracking-[0.14em] text-[#B6ABA3]">
              Direct Reservations
            </dt>
            <dd className="mt-1 text-sm font-medium text-[#D4AF6A] tabular-nums">
              <a
                href={BUSINESS_INFO.phoneHref}
                className="hover:underline underline-offset-4"
              >
                {BUSINESS_INFO.phoneDisplay}
              </a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
