import { useEffect, useState, type MouseEvent } from 'react';
import { ArrowRight } from 'lucide-react';
import type { CategoryRoute } from '../data/services';
import { useCatalog } from '../context/CatalogContext';

interface CategoryCardsGridProps {
  onNavigate: (path: string) => void;
}

function handleRouteClick(
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

function FeaturedCategoryCard({
  category,
  onNavigate,
  spanClass,
}: {
  category: CategoryRoute;
  onNavigate: (path: string) => void;
  spanClass: string;
}) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [category.image]);

  const showImage = Boolean(category.image && !imgError);

  return (
    <a
      href={category.path}
      onClick={(e) => handleRouteClick(e, category.path, onNavigate)}
      className={`${spanClass} group relative bg-[#1E1A17] border border-[#322B27] hover:border-[#D4AF6A] rounded-2xl overflow-hidden flex flex-col justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A]`}
    >
      {showImage && (
        <div className="relative h-40 sm:h-48 w-full overflow-hidden border-b border-[#2D2622]">
          <img
            src={category.image}
            alt={category.imageAlt ?? category.label}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#1E1A17] via-[#1E1A17]/25 to-transparent"
          />
          <span className="absolute top-3 left-3.5 sm:top-3.5 sm:left-4 px-2.5 py-1 rounded-full bg-[#0F0D0C]/85 border border-[#322B27] text-[11px] uppercase tracking-[0.12em] text-[#D4AF6A] tabular-nums">
            {category.number} · {category.itemCountLabel}
          </span>
        </div>
      )}

      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
        <div>
          {!showImage && (
            <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
              <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A] tabular-nums">
                {category.number} · {category.itemCountLabel}
              </span>
            </div>
          )}

          <h3 className="font-serif text-2xl sm:text-[1.7rem] font-normal text-[#F5EFE6] group-hover:text-[#D4AF6A] transition-colors leading-tight">
            {category.label}
          </h3>
          <p className="mt-2 text-sm text-[#BEB3A8] leading-relaxed">
            {category.tagline}
          </p>
        </div>

        <div className="pt-3.5 sm:pt-4 border-t border-[#2D2622] flex flex-wrap items-center justify-between gap-2.5">
          <span className="text-xs sm:text-sm font-semibold text-[#D4AF6A] tabular-nums">
            {category.rateRange}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F5EFE6] group-hover:text-[#D4AF6A] transition-colors whitespace-nowrap shrink-0">
            <span>View Menu</span>
            <ArrowRight
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          </span>
        </div>
      </div>
    </a>
  );
}

export function CategoryCardsGrid({ onNavigate }: CategoryCardsGridProps) {
  const { categoryCards } = useCatalog();
  const [massages, combos, promos, wetArea, acupuncture, waxing, outcall] = categoryCards;
  const [outcallImgError, setOutcallImgError] = useState(false);

  useEffect(() => {
    setOutcallImgError(false);
  }, [outcall.image]);

  const showOutcallCover = Boolean(outcall.image && !outcallImgError);

  return (
    <section id="categories" className="py-10 sm:py-12 lg:py-16 bg-[#0F0D0C] border-b border-[#2D2622]">
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-6 sm:pb-8 border-b border-[#2D2622]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
              Service Directory
            </p>
            <h2 className="mt-1.5 font-serif text-3xl sm:text-4xl font-normal text-[#F5EFE6] text-balance">
              Choose a Treatment Category
            </h2>
          </div>
          <p className="text-sm text-[#BEB3A8] max-w-md leading-relaxed">
            Tap any category below to view full rates and build your session.
          </p>
        </div>

        {/* Row 1: Editorial 12-col asymmetric top row (Massages featured + Combos + Promos) */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5">
          <FeaturedCategoryCard
            category={massages}
            onNavigate={onNavigate}
            spanClass="md:col-span-2 lg:col-span-6"
          />
          <FeaturedCategoryCard
            category={combos}
            onNavigate={onNavigate}
            spanClass="lg:col-span-3"
          />
          <FeaturedCategoryCard
            category={promos}
            onNavigate={onNavigate}
            spanClass="lg:col-span-3"
          />

          {/* Row 2: Wet Area & Hammam + Acupuncture + Waxing */}
          <FeaturedCategoryCard
            category={wetArea}
            onNavigate={onNavigate}
            spanClass="lg:col-span-4"
          />
          <FeaturedCategoryCard
            category={acupuncture}
            onNavigate={onNavigate}
            spanClass="lg:col-span-4"
          />
          <FeaturedCategoryCard
            category={waxing}
            onNavigate={onNavigate}
            spanClass="lg:col-span-4"
          />

          {/* Row 3: Full-width Home & Hotel Outcall highlight card */}
          <a
            href={outcall.path}
            onClick={(e) => handleRouteClick(e, outcall.path, onNavigate)}
            className="md:col-span-2 lg:col-span-12 group bg-[#161311] border border-[#322B27] hover:border-[#D4AF6A] rounded-2xl overflow-hidden flex flex-col lg:flex-row lg:items-stretch justify-between transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A]"
          >
            {showOutcallCover && (
              <div className="relative h-44 sm:h-48 lg:h-auto lg:w-72 shrink-0 overflow-hidden border-b lg:border-b-0 lg:border-r border-[#2D2622]">
                <img
                  src={outcall.image}
                  alt={outcall.imageAlt ?? outcall.label}
                  referrerPolicy="no-referrer"
                  onError={() => setOutcallImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
            )}

            <div className="flex-1 p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-5">
              <div className="max-w-2xl">
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A] tabular-nums">
                  {outcall.number} · {outcall.itemCountLabel}
                </span>
                <h3 className="mt-1.5 font-serif text-2xl sm:text-3xl font-normal text-[#F5EFE6] group-hover:text-[#D4AF6A] transition-colors">
                  {outcall.label}
                </h3>
                <p className="mt-2 text-sm text-[#BEB3A8] leading-relaxed">
                  {outcall.tagline}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3.5 sm:gap-5 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#2D2622] shrink-0">
                <span className="text-sm sm:text-base font-semibold text-[#D4AF6A] tabular-nums">
                  {outcall.rateRange}
                </span>
                <span className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 group-hover:bg-[#702D40] transition-colors whitespace-nowrap">
                  <span>View Outcall Rates</span>
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    strokeWidth={1.75}
                  />
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
