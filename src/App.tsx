import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LayoutGrid,
  MessageCircle,
  Phone,
  Plus,
} from 'lucide-react';
import {
  BUSINESS_INFO,
  CATEGORY_ROUTES,
  HOME_SEO,
  formatPeso,
  getCategoryByPath,
  normalizeRoutePath,
} from './data/services';
import type { PromoPackage, SimpleService, TrayItem } from './types/booking';
import { CatalogProvider, useCatalog } from './context/CatalogContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryCardsGrid } from './components/CategoryCardsGrid';
import { InsideSpaGallery } from './components/InsideSpaGallery';
import { EditorialImage } from './components/EditorialImage';
import { ServiceLedgerRow } from './components/ServiceLedgerRow';
import { PromoPackageCard } from './components/PromoPackageCard';
import { HomeServiceSection } from './components/HomeServiceSection';
import { BookingTrayDrawer } from './components/BookingTrayDrawer';
import { MobileMenuSheet } from './components/MobileMenuSheet';
import { AdminPage } from './components/AdminPage';
import { Footer } from './components/Footer';

const STORAGE_KEY = 'apros_session_tray_v1';

function setMetaTag(selector: string, attribute: 'name' | 'property', key: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.content = content;
}

function setCanonicalLink(url: string) {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = url;
}

function handleRouteAnchor(
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

function AppContent() {
  const {
    categoryCovers,
    massageServices,
    signatureComboServices,
    exclusiveComboOffers,
    promoPackages,
    wetAreaServices,
    acupunctureServices,
    waxingServices,
  } = useCatalog();

  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizeRoutePath(window.location.pathname)
  );
  const [trayItems, setTrayItems] = useState<TrayItem[]>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore storage read errors
    }
    return [];
  });
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdminRoute = normalizeRoutePath(currentPath) === '/admin';
  const activeCategory = isAdminRoute ? null : getCategoryByPath(currentPath);
  const effectivePath = isAdminRoute
    ? '/admin'
    : activeCategory
    ? activeCategory.path
    : '/';

  const navigate = useCallback((targetPath: string) => {
    const normalized = normalizeRoutePath(targetPath);
    if (
      normalizeRoutePath(window.location.pathname) !== normalized ||
      window.location.hash
    ) {
      window.history.pushState({}, '', normalized);
    }
    setCurrentPath(normalized);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (window.location.hash === '#visit' || window.location.hash === '#categories') {
      window.history.replaceState({}, '', normalizeRoutePath(window.location.pathname));
    }
    const handlePopState = () => {
      if (window.location.hash === '#visit') {
        window.history.replaceState({}, '', normalizeRoutePath(window.location.pathname));
      }
      setCurrentPath(normalizeRoutePath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Keep SEO title, OpenGraph, Twitter, robots, and canonical URL synced per route
  useEffect(() => {
    if (isAdminRoute) {
      document.title = 'Admin | Apros Wellness Spa';
      setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
      return;
    }

    setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');
    const title = activeCategory ? activeCategory.seoTitle : HOME_SEO.title;
    const description = activeCategory ? activeCategory.seoDescription : HOME_SEO.description;
    const canonicalUrl = `${window.location.origin}${effectivePath}`;

    document.title = title;
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setCanonicalLink(canonicalUrl);
  }, [activeCategory, effectivePath, isAdminRoute]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trayItems));
    } catch {
      // Ignore storage write errors
    }
  }, [trayItems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
  };

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const addSimpleService = (service: SimpleService, categoryLabel: string) => {
    setTrayItems((prev) => {
      const existing = prev.find((item) => item.id === service.id);
      if (existing) {
        return prev.map((item) =>
          item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: service.id,
          title: service.tagalogSubtitle
            ? `${service.name} (${service.tagalogSubtitle})`
            : service.name,
          category: categoryLabel,
          price: service.price,
          durationMinutes: service.durationMinutes,
          durationLabel: service.durationLabel,
          note: service.durationLabel.includes('Unlimited')
            ? 'Unlimited Wet Area Access'
            : undefined,
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${service.name} to Session Tray`);
  };

  const addPromoPackage = ({
    pkg,
    selectedAddOnA,
    selectedAddOnB,
  }: {
    pkg: PromoPackage;
    selectedAddOnA: { id: string; label: string; minutes: number };
    selectedAddOnB?: { id: string; label: string; minutes: number };
  }) => {
    const compositeId = [
      pkg.id,
      selectedAddOnA.id,
      selectedAddOnB ? selectedAddOnB.id : 'none',
    ].join('__');

    const totalTimedMinutes =
      pkg.baseDurationMinutes +
      selectedAddOnA.minutes +
      (selectedAddOnB ? selectedAddOnB.minutes : 0);

    const details = [
      ...pkg.includes,
      `Add On A: ${selectedAddOnA.label}`,
      ...(selectedAddOnB ? [`Add On B: ${selectedAddOnB.label}`] : []),
    ];

    setTrayItems((prev) => {
      const existing = prev.find((item) => item.id === compositeId);
      if (existing) {
        return prev.map((item) =>
          item.id === compositeId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: compositeId,
          title: `${pkg.name} Promo`,
          category: 'Promos & Discounts',
          price: pkg.price,
          durationMinutes: totalTimedMinutes,
          durationLabel: `${totalTimedMinutes} min timed`,
          details,
          note: pkg.hasUnlimitedWetArea ? 'Unlimited Wet Area Access' : undefined,
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${pkg.name} to Session Tray`);
  };

  const addHomeService = ({
    id,
    radiusLabel,
    durationLabel,
    durationMinutes,
    price,
  }: {
    id: string;
    radiusLabel: string;
    durationLabel: string;
    durationMinutes: number;
    price: number;
  }) => {
    setTrayItems((prev) => {
      const existing = prev.find((item) => item.id === id);
      if (existing) {
        return prev.map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id,
          title: `Home & Hotel Service — ${radiusLabel}`,
          category: 'Home & Hotel Service',
          price,
          durationMinutes,
          durationLabel,
          note: '+ Transpo',
          quantity: 1,
        },
      ];
    });
    showToast(`Added ${durationLabel} (${radiusLabel}) to Session Tray`);
  };

  const updateTrayQuantity = (id: string, delta: number) => {
    setTrayItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeTrayItem = (id: string) => {
    setTrayItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearTray = () => {
    setTrayItems([]);
  };

  const getQty = (id: string): number =>
    trayItems.find((item) => item.id === id)?.quantity ?? 0;

  const totalCount = trayItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = trayItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (isAdminRoute) {
    return <AdminPage onNavigate={navigate} />;
  }

  const currentTabIndex = activeCategory
    ? CATEGORY_ROUTES.findIndex((cat) => cat.id === activeCategory.id)
    : -1;
  const prevCategory =
    currentTabIndex > 0 ? CATEGORY_ROUTES[currentTabIndex - 1] : null;
  const nextCategory =
    currentTabIndex >= 0 && currentTabIndex < CATEGORY_ROUTES.length - 1
      ? CATEGORY_ROUTES[currentTabIndex + 1]
      : null;

  const massageCover = categoryCovers['massages'];
  const wetAreaCover = categoryCovers['wet-area'];
  const acupunctureCover = categoryCovers['acupuncture'];

  return (
    <div className="min-h-screen flex flex-col bg-[#0F0D0C] text-[#F5EFE6] overflow-x-clip">
      <Header
        currentPath={effectivePath}
        trayCount={totalCount}
        onNavigate={navigate}
        onOpenTray={() => setIsTrayOpen(true)}
      />

      <main className="flex-1">
        {!activeCategory ? (
          <>
            <Hero />

            {/* Main / Page: Category Cards Directory */}
            <CategoryCardsGrid onNavigate={navigate} />

            {/* Exclusive Combo Offers Highlight Band */}
            {exclusiveComboOffers.length > 0 && (
              <section className="py-10 sm:py-12 lg:py-16 bg-[#161311] border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-6 sm:pb-7 border-b border-[#2D2622]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                        Exclusive Combo Offers
                      </p>
                      <h2 className="mt-1.5 font-serif text-2xl sm:text-4xl font-normal text-[#F5EFE6] text-balance">
                        Signature Massage with Unlimited Wet Area Access
                      </h2>
                    </div>
                    <p className="text-sm text-[#BEB3A8] max-w-md leading-relaxed">
                      Pair 60 or 90 minutes of Himlay massage with unlimited sauna, steam, and shower access.
                    </p>
                  </div>

                  <div className="mt-6 sm:mt-7 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {exclusiveComboOffers.map((offer) => {
                      const qty = getQty(offer.id);
                      return (
                        <div
                          key={offer.id}
                          className="bg-[#1E1A17] border border-[#322B27] rounded-2xl p-5 sm:p-7 flex flex-col justify-between gap-4 sm:gap-5"
                        >
                          <div>
                            <div className="flex items-baseline justify-between gap-4">
                              <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#F5EFE6] leading-snug">
                                {offer.name}
                              </h3>
                              <span className="text-xl sm:text-2xl font-semibold text-[#D4AF6A] tabular-nums shrink-0">
                                {formatPeso(offer.price)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#BEB3A8] leading-relaxed">
                              {offer.description}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#2D2622]">
                            <span className="text-xs text-[#9C9187] tabular-nums">
                              {offer.durationLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => addSimpleService(offer, 'Exclusive Combo Offers')}
                              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                                qty > 0
                                  ? 'bg-[#D4AF6A] text-[#0F0D0C] hover:bg-[#C5A059]'
                                  : 'bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40]'
                              }`}
                            >
                              {qty > 0 ? (
                                <>
                                  <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                                  <span>In Tray ({qty}) · Add Another</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                                  <span>Add Offer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Inside the Spa Gallery */}
            <InsideSpaGallery />
          </>
        ) : (
          <div className="bg-[#0F0D0C]">
            {/* Sticky Category Breadcrumb & Sibling Route Switcher */}
            <nav
              aria-label="Service category navigation"
              className="sticky top-14 md:top-16 z-30 border-b border-[#2D2622] bg-[#0F0D0C]/95 backdrop-blur-md"
            >
              <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-2.5 md:py-3 flex items-center md:justify-center gap-2">
                <a
                  href="/"
                  onClick={(e) => handleRouteAnchor(e, '/', navigate)}
                  className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#161311] border border-[#322B27] text-[#D4AF6A] hover:border-[#D4AF6A] hover:text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
                  <span className="sm:hidden">All</span>
                  <span className="hidden sm:inline">All Categories</span>
                </a>

                <div className="min-w-0 flex-1 md:flex-initial flex items-center md:justify-center gap-2 overflow-x-auto no-scrollbar md:flex-wrap">
                  {CATEGORY_ROUTES.map((cat) => {
                    const isActive = cat.id === activeCategory.id;
                    return (
                      <a
                        key={cat.id}
                        href={cat.path}
                        onClick={(e) => handleRouteAnchor(e, cat.path, navigate)}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors duration-150 whitespace-nowrap shrink-0 ${
                          isActive
                            ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6]'
                            : 'bg-[#1E1A17] border-[#322B27] text-[#BEB3A8] hover:border-[#D4AF6A] hover:text-[#F5EFE6]'
                        }`}
                      >
                        {cat.shortLabel}
                      </a>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* 01. Massage Services (/massages) */}
            {activeCategory.id === 'massages' && (
              <section id="massages" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
                    <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                          01 · Foundational Bodywork
                        </p>
                        <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                          Massage Services
                        </h1>
                        <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
                          Filipino therapeutic touch blending rhythmic strokes, steady palm pressure, and traditional Hilot to ease muscle tension and cold (<em className="font-serif italic text-[#F5EFE6]">lamig</em>).
                        </p>
                      </div>

                      {massageCover?.imageUrl && (
                        <EditorialImage
                          src={massageCover.imageUrl}
                          alt={
                            massageCover.imageAlt ||
                            'Filipino apothecary still life with virgin coconut oil and hot stones'
                          }
                          caption="Warm virgin coconut oil, basalt stones, and glass ventosa prepared for each session."
                          imgClassName="w-full aspect-[4/3] object-cover"
                        />
                      )}
                    </div>

                    <div className="lg:col-span-7 border-t border-[#2D2622]">
                      {massageServices.map((service) => (
                        <ServiceLedgerRow
                          key={service.id}
                          service={service}
                          categoryLabel="Massage Services"
                          quantityInTray={getQty(service.id)}
                          onAdd={addSimpleService}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 02. Signature Combo Rates (/combo) */}
            {activeCategory.id === 'combos' && (
              <section id="combos" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="max-w-2xl">
                    <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                      02 · Combined Modalities
                    </p>
                    <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                      Signature Combo Rates
                    </h1>
                    <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
                      Pair Himlay signature massage with targeted stone, cupping, herbal, or skin recovery in one session.
                    </p>
                  </div>

                  <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-x-12 border-t border-[#2D2622]">
                    {signatureComboServices.map((service) => (
                      <ServiceLedgerRow
                        key={service.id}
                        service={service}
                        categoryLabel="Signature Combos"
                        quantityInTray={getQty(service.id)}
                        onAdd={addSimpleService}
                      />
                    ))}

                    <div className="py-5 border-b border-[#2D2622] flex flex-col justify-center">
                      <p className="font-serif italic text-lg sm:text-xl text-[#F5EFE6] leading-relaxed">
                        Every Himlay pairing begins with warm towels and steady palm work before your chosen add-on ritual.
                      </p>
                      <p className="mt-2 text-xs text-[#9C9187]">
                        Tap + beside any treatment to add it to your Session Tray.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 03. Promos & Discounts (/promo) */}
            {activeCategory.id === 'promos' && (
              <section id="promos" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4">
                    <div className="max-w-2xl">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                        03 · Curated Packages
                      </p>
                      <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                        Promos &amp; Discounts
                      </h1>
                      <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
                        Choose your Add-Ons inside any package below before adding it to your tray.
                      </p>
                    </div>
                    <p className="text-xs text-[#9C9187]">
                      Includes 60 min Apros “Himlay” Signature Massage.
                    </p>
                  </div>

                  <div className="mt-7 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                    {promoPackages.map((pkg) => (
                      <PromoPackageCard
                        key={pkg.id}
                        pkg={pkg}
                        onAddPromo={addPromoPackage}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 04. Wet Area Access & Moroccan / Turkish Hammam (/wet-area) */}
            {activeCategory.id === 'wet-area' && (
              <section id="wet-area" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
                    {wetAreaCover?.imageUrl && (
                      <div className="lg:col-span-5 lg:order-2">
                        <EditorialImage
                          src={wetAreaCover.imageUrl}
                          alt={
                            wetAreaCover.imageAlt ||
                            'Warm limestone Moroccan and Turkish hammam steam bath chamber'
                          }
                          caption="Warm stone hammam steam chamber and rinsing basin."
                          imgClassName="w-full aspect-[4/3] object-cover"
                        />
                      </div>
                    )}

                    <div
                      className={`${
                        wetAreaCover?.imageUrl ? 'lg:col-span-7 lg:order-1' : 'lg:col-span-12'
                      }`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                        04 · Heat &amp; Hydrotherapy
                      </p>
                      <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                        Wet Area Access &amp; Hammam
                      </h1>
                      <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed max-w-2xl">
                        Dry heat sauna, herbal steam, and stone-bench hammam bathing to relax tight muscles.
                      </p>

                      <div className="mt-7 sm:mt-8 border-t border-[#2D2622]">
                        {wetAreaServices.map((service) => (
                          <ServiceLedgerRow
                            key={service.id}
                            service={service}
                            categoryLabel="Wet Area & Hammam"
                            quantityInTray={getQty(service.id)}
                            onAdd={addSimpleService}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 05. Acupuncture Services (/acupuncture) */}
            {activeCategory.id === 'acupuncture' && (
              <section id="acupuncture" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
                    <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                          05 · Restorative &amp; Structural Care
                        </p>
                        <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                          Acupuncture Services
                        </h1>
                        <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
                          Meridian therapy, Dorn spinal alignment, mugwort moxabustion, and structural bone setting.
                        </p>
                      </div>

                      {acupunctureCover?.imageUrl && (
                        <EditorialImage
                          src={acupunctureCover.imageUrl}
                          alt={
                            acupunctureCover.imageAlt ||
                            'Handmade ceramic moxa bowls and therapy tools'
                          }
                          caption="Moxabustion vessels and clinical preparation."
                          imgClassName="w-full aspect-[4/3] object-cover"
                        />
                      )}
                    </div>

                    <div className="lg:col-span-7 border-t border-[#2D2622]">
                      {acupunctureServices.map((service) => (
                        <ServiceLedgerRow
                          key={service.id}
                          service={service}
                          categoryLabel="Acupuncture Services"
                          quantityInTray={getQty(service.id)}
                          onAdd={addSimpleService}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 06. Waxing Services (/waxing) */}
            {activeCategory.id === 'waxing' && (
              <section id="waxing" className="py-10 sm:py-12 lg:py-16 border-b border-[#2D2622]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 sm:gap-4 pb-6 sm:pb-8 border-b border-[#2D2622]">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                        06 · Grooming Care
                      </p>
                      <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6]">
                        Waxing Services
                      </h1>
                    </div>
                    <p className="text-sm text-[#BEB3A8] max-w-md">
                      Private warm-wax grooming finished with soothing botanical oil.
                    </p>
                  </div>

                  <div className="mt-7 sm:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                    {waxingServices.map((service) => {
                      const qty = getQty(service.id);
                      return (
                        <div
                          key={service.id}
                          className="bg-[#1E1A17] border border-[#322B27] rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4 sm:gap-5"
                        >
                          <div>
                            <div className="flex items-baseline justify-between gap-3">
                              <h2 className="font-serif text-2xl font-medium text-[#F5EFE6]">
                                {service.name}
                              </h2>
                              <span className="text-lg font-semibold text-[#D4AF6A] tabular-nums shrink-0">
                                {formatPeso(service.price)}
                              </span>
                            </div>
                            <p className="mt-2 text-sm text-[#BEB3A8] leading-relaxed">
                              {service.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-4 border-t border-[#2D2622]">
                            <span className="text-xs text-[#9C9187]">
                              {qty > 0 ? `${qty} in Session Tray` : service.durationLabel}
                            </span>
                            <button
                              type="button"
                              onClick={() => addSimpleService(service, 'Waxing Services')}
                              aria-label={`Add ${service.name} waxing to Session Tray`}
                              className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-colors duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                                qty > 0
                                  ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6] hover:bg-[#702D40]'
                                  : 'bg-[#161311] border-[#3B322C] text-[#F5EFE6] hover:border-[#D4AF6A] hover:bg-[#5C2434]'
                              }`}
                            >
                              {qty > 0 ? (
                                <Check className="w-4 h-4" strokeWidth={2.2} />
                              ) : (
                                <Plus className="w-4 h-4" strokeWidth={1.75} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* 07. Home & Hotel Service Rates (/outcall) */}
            {activeCategory.id === 'home-service' && (
              <div className="py-10 sm:py-12 lg:py-16 bg-[#0F0D0C]">
                <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12">
                  <HomeServiceSection
                    embedded={true}
                    onAddHomeService={addHomeService}
                  />
                </div>
              </div>
            )}

            {/* Bottom Chapter Stepper */}
            <div className="bg-[#161311] border-t border-[#2D2622]">
              <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-5 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-3 sm:gap-4">
                {prevCategory ? (
                  <a
                    href={prevCategory.path}
                    onClick={(e) => handleRouteAnchor(e, prevCategory.path, navigate)}
                    className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-[#BEB3A8] hover:text-[#D4AF6A] transition-colors min-w-0"
                  >
                    <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    <span className="sm:hidden truncate">{prevCategory.shortLabel}</span>
                    <span className="hidden sm:inline">{prevCategory.label}</span>
                  </a>
                ) : (
                  <span />
                )}

                {nextCategory ? (
                  <a
                    href={nextCategory.path}
                    onClick={(e) => handleRouteAnchor(e, nextCategory.path, navigate)}
                    className="sm:order-3 inline-flex items-center justify-end gap-1.5 sm:gap-2 text-xs sm:text-sm font-medium text-[#D4AF6A] hover:text-[#F5EFE6] transition-colors min-w-0"
                  >
                    <span className="sm:hidden truncate">Next: {nextCategory.shortLabel}</span>
                    <span className="hidden sm:inline">Next: {nextCategory.label}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                  </a>
                ) : (
                  <span className="sm:order-3" />
                )}

                <a
                  href="/"
                  onClick={(e) => handleRouteAnchor(e, '/', navigate)}
                  className="col-span-2 sm:col-span-1 sm:order-2 text-center text-xs text-[#9C9187] hover:text-[#F5EFE6] underline underline-offset-4 transition-colors whitespace-nowrap pt-1 sm:pt-0"
                >
                  All Categories
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer onOpenTray={() => setIsTrayOpen(true)} />

      {/* Subtle confirmation toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[4.75rem] md:bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-40 sm:max-w-sm bg-[#1E1A17] text-[#F5EFE6] px-4 sm:px-5 py-3 rounded-full border border-[#D4AF6A]/45 shadow-lg flex items-center justify-between gap-3 sm:gap-4 text-xs sm:text-sm"
        >
          <span className="truncate">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setIsTrayOpen(true)}
            className="text-[#D4AF6A] underline underline-offset-4 font-medium whitespace-nowrap shrink-0 cursor-pointer"
          >
            View Tray
          </button>
        </div>
      )}

      {/* Mobile Sticky Bottom Thumb Bar (Menu Drawer + Call + Messenger/Book) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[#0F0D0C]/95 backdrop-blur-md border-t border-[#2D2622] px-4 pt-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#1E1A17] border border-[#322B27] text-xs font-medium text-[#F5EFE6] shrink-0 cursor-pointer"
        >
          <LayoutGrid className="w-3.5 h-3.5 text-[#D4AF6A]" strokeWidth={1.75} />
          <span>Menu</span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={BUSINESS_INFO.phoneHref}
            aria-label={`Call ${BUSINESS_INFO.phoneDisplay}`}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-[#322B27] bg-[#1E1A17] text-[#D4AF6A]"
          >
            <Phone className="w-4 h-4" strokeWidth={1.75} />
          </a>

          <a
            href={BUSINESS_INFO.messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (totalCount > 0) {
                e.preventDefault();
                setIsTrayOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 whitespace-nowrap tabular-nums"
          >
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>
              {totalCount > 0 ? `Book (${formatPeso(totalAmount)})` : 'Messenger'}
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Quick-Jump Menu Bottom Sheet */}
      <MobileMenuSheet
        isOpen={isMobileMenuOpen}
        currentPath={effectivePath}
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={navigate}
        onJumpVisit={() => {
          const footerEl = document.querySelector('footer');
          if (footerEl) footerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }}
      />

      {/* Session Planner Slide-Over Drawer */}
      <BookingTrayDrawer
        isOpen={isTrayOpen}
        items={trayItems}
        onClose={() => setIsTrayOpen(false)}
        onUpdateQuantity={updateTrayQuantity}
        onRemoveItem={removeTrayItem}
        onClearTray={clearTray}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <CatalogProvider>
        <AppContent />
      </CatalogProvider>
    </ErrorBoundary>
  );
}
