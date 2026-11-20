import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Leaf, Maximize2, X } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext';
import type { SpaGalleryPhoto } from '../types/catalog';

function getExhibitionLayout(index: number, total: number): {
  spanClass: string;
  frameHeightClass: string;
} {
  if (total === 1) {
    return {
      spanClass: 'md:col-span-10 md:col-start-2',
      frameHeightClass: 'aspect-[16/9] md:aspect-[21/10]',
    };
  }
  if (total === 2) {
    return index === 0
      ? {
          spanClass: 'md:col-span-7',
          frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[440px]',
        }
      : {
          spanClass: 'md:col-span-5',
          frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[440px]',
        };
  }
  if (total === 3) {
    return {
      spanClass: 'md:col-span-4',
      frameHeightClass: 'aspect-[4/5]',
    };
  }
  if (total === 4) {
    // Architectural 7/5 + 5/7 zigzag monograph spread with aligned horizontal baselines
    const isWide = index === 0 || index === 3;
    return {
      spanClass: isWide ? 'md:col-span-7' : 'md:col-span-5',
      frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[360px] lg:h-[420px]',
    };
  }
  if (total === 5) {
    // Row 1: 7/5 feature pair; Row 2: balanced 3-plate triptych
    if (index < 2) {
      return {
        spanClass: index === 0 ? 'md:col-span-7' : 'md:col-span-5',
        frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[380px] lg:h-[430px]',
      };
    }
    return {
      spanClass: 'md:col-span-4',
      frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[280px] lg:h-[310px]',
    };
  }
  // 6 photos: 3 balanced alternating pairs
  const isWide = index === 0 || index === 3;
  const isPair = index >= 4;
  return {
    spanClass: isPair ? 'md:col-span-6' : isWide ? 'md:col-span-7' : 'md:col-span-5',
    frameHeightClass: 'aspect-[4/3] md:aspect-auto md:h-[340px] lg:h-[380px]',
  };
}

function EditorialPlate({
  photo,
  index,
  spanClass,
  frameHeightClass,
  onInspect,
}: {
  photo: SpaGalleryPhoto;
  index: number;
  spanClass: string;
  frameHeightClass: string;
  onInspect: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [photo.imageUrl]);

  const plateNumber = String(index + 1).padStart(2, '0');

  return (
    <figure className={`${spanClass} flex flex-col`}>
      <button
        type="button"
        onClick={onInspect}
        aria-label={`Inspect ${photo.title}`}
        className={`group relative w-full ${frameHeightClass} rounded-lg overflow-hidden bg-[#14110F] ring-1 ring-[#F5EFE6]/[0.08] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D4AF6A]`}
      >
        {!hasError ? (
          <img
            src={photo.imageUrl}
            alt={photo.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setHasError(true)}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-[#14110F] text-[#9C9187]">
            <Leaf className="w-6 h-6 text-[#D4AF6A] mb-2.5" strokeWidth={1.5} />
            <span className="font-serif text-lg text-[#F5EFE6]">{photo.title}</span>
          </div>
        )}

        {/* Measured bottom vignette + quiet inspect affordance on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3.5 right-3.5 w-9 h-9 rounded-full bg-[#0F0D0C]/80 border border-[#F5EFE6]/15 text-[#F5EFE6] flex items-center justify-center opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
        </span>
      </button>

      {/* Open editorial typography below frame — no boxed card edges */}
      <figcaption className="mt-4 pb-4 border-b border-[#241E1B] flex items-baseline gap-3.5">
        <span className="text-[11px] font-medium tracking-[0.2em] text-[#D4AF6A] tabular-nums shrink-0 pt-0.5">
          {plateNumber}
        </span>
        <div className="min-w-0">
          <h3 className="font-serif text-xl sm:text-[1.45rem] font-normal text-[#F9F6F1] leading-snug tracking-[0.01em]">
            {photo.title}
          </h3>
          {photo.caption && (
            <p className="mt-1.5 text-sm text-[#B6ABA3] leading-relaxed max-w-prose">
              {photo.caption}
            </p>
          )}
        </div>
      </figcaption>
    </figure>
  );
}

export function InsideSpaGallery() {
  const { spaGallery, loadingCatalog } = useCatalog();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visiblePhotos = spaGallery
    .filter((p) => p.imageUrl.trim().length > 0)
    .slice(0, 6);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev === null ? null : (prev + 1) % visiblePhotos.length
        );
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev === null
            ? null
            : (prev - 1 + visiblePhotos.length) % visiblePhotos.length
        );
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, visiblePhotos.length]);

  if (loadingCatalog || visiblePhotos.length === 0) {
    return null;
  }

  const activePhoto =
    lightboxIndex !== null ? visiblePhotos[lightboxIndex] ?? null : null;

  return (
    <section
      id="inside-the-spa"
      className="py-12 sm:py-16 lg:py-24 bg-[#0B0908] border-b border-[#2D2622]"
    >
      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-7 sm:pb-9 border-b border-[#241E1B]">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#D4AF6A]">
              Architectural Sanctuary
            </p>
            <h2 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F9F6F1] tracking-tight text-balance">
              Inside the Spa
            </h2>
          </div>
          <p className="text-sm text-[#B6ABA3] max-w-sm leading-relaxed">
            Timber treatment rooms, warm limestone steam chambers, and our Dela Paz sanctuary.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-12 gap-x-6 lg:gap-x-8 gap-y-8 sm:gap-y-10 lg:gap-y-12">
          {visiblePhotos.map((photo, idx) => {
            const layout = getExhibitionLayout(idx, visiblePhotos.length);
            return (
              <EditorialPlate
                key={photo.id}
                photo={photo}
                index={idx}
                spanClass={layout.spanClass}
                frameHeightClass={layout.frameHeightClass}
                onInspect={() => setLightboxIndex(idx)}
              />
            );
          })}
        </div>
      </div>

      {/* Fullscreen Sanctuary Lightbox */}
      {activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title}
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 h-[100dvh] bg-[#070605]/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-8"
        >
          {/* Top Bar */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-[1480px] w-full mx-auto flex items-center justify-between text-xs text-[#BEB3A8]"
          >
            <span className="tracking-[0.2em] uppercase text-[#D4AF6A] tabular-nums">
              {String(lightboxIndex + 1).padStart(2, '0')} /{' '}
              {String(visiblePhotos.length).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setLightboxIndex(null)}
              aria-label="Close gallery view"
              className="w-10 h-10 rounded-full bg-[#161311] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={1.75} />
            </button>
          </div>

          {/* Center Photo */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[1320px] w-full mx-auto my-3 sm:my-4 flex-1 flex items-center justify-center min-h-0"
          >
            {visiblePhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + visiblePhotos.length) %
                      visiblePhotos.length
                  )
                }
                aria-label="Previous photo"
                className="hidden sm:flex w-11 h-11 rounded-full bg-[#161311]/90 border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] items-center justify-center mr-4 shrink-0 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={1.75} />
              </button>
            )}

            <img
              src={activePhoto.imageUrl}
              alt={activePhoto.title}
              referrerPolicy="no-referrer"
              className="max-h-[55dvh] sm:max-h-[70vh] max-w-full w-auto object-contain rounded-md ring-1 ring-white/10 shadow-2xl"
            />

            {visiblePhotos.length > 1 && (
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % visiblePhotos.length)
                }
                aria-label="Next photo"
                className="hidden sm:flex w-11 h-11 rounded-full bg-[#161311]/90 border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] items-center justify-center ml-4 shrink-0 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={1.75} />
              </button>
            )}
          </div>

          {/* Bottom Caption */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-2xl w-full mx-auto text-center pb-2"
          >
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#F9F6F1]">
              {activePhoto.title}
            </h3>
            {activePhoto.caption && (
              <p className="mt-1.5 text-sm text-[#BEB3A8] leading-relaxed">
                {activePhoto.caption}
              </p>
            )}

            {visiblePhotos.length > 1 && (
              <div className="mt-4 flex sm:hidden items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex(
                      (lightboxIndex - 1 + visiblePhotos.length) %
                        visiblePhotos.length
                    )
                  }
                  className="px-4 py-2 rounded-full bg-[#161311] border border-[#322B27] text-xs text-[#F5EFE6]"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((lightboxIndex + 1) % visiblePhotos.length)
                  }
                  className="px-4 py-2 rounded-full bg-[#161311] border border-[#322B27] text-xs text-[#F5EFE6]"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
