import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Image as ImageIcon,
  Layers,
  LogOut,
  Plus,
  ShieldAlert,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import {
  ADMIN_EMAIL,
  sanitizeDocId,
  useCatalog,
} from '../context/CatalogContext';
import { CATEGORY_ROUTES, formatPeso, type CategoryId } from '../data/services';
import type { AddOnOption } from '../types/booking';
import type {
  CatalogServiceDoc,
  HomeServiceRateItem,
  ServiceCategoryId,
  SpaGalleryPhoto,
} from '../types/catalog';
import { BrandLogo } from './BrandLogo';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

type AdminTab = 'services' | 'photos' | 'gallery';

const SERVICE_CATEGORY_TABS: { id: ServiceCategoryId; label: string }[] = [
  { id: 'massages', label: 'Massages' },
  { id: 'combos', label: 'Signature Combos' },
  { id: 'promos', label: 'Promos' },
  { id: 'wet-area', label: 'Wet Area & Hammam' },
  { id: 'acupuncture', label: 'Acupuncture' },
  { id: 'waxing', label: 'Waxing' },
  { id: 'home-service', label: 'Home & Hotel' },
  { id: 'exclusive', label: 'Exclusive Combos' },
];

function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/')) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function ImagePreviewBox({
  url,
  alt,
  emptyLabel,
  aspectClass = 'aspect-[16/9]',
}: {
  url: string;
  alt: string;
  emptyLabel: string;
  aspectClass?: string;
}) {
  const [broken, setBroken] = useState(false);
  const trimmed = url.trim();

  useEffect(() => {
    setBroken(false);
  }, [trimmed]);

  return (
    <div
      className={`relative w-full ${aspectClass} rounded-xl overflow-hidden bg-[#161311] border border-[#322B27] flex items-center justify-center`}
    >
      {!trimmed ? (
        <div className="p-4 text-center text-xs text-[#9C9187]">
          <ImageIcon className="w-5 h-5 mx-auto mb-1.5 text-[#574D46]" strokeWidth={1.5} />
          <span>{emptyLabel}</span>
        </div>
      ) : broken ? (
        <div className="p-4 text-center text-xs text-[#E5989B]">
          <ShieldAlert className="w-5 h-5 mx-auto mb-1.5" strokeWidth={1.5} />
          <span>Image link could not be loaded. Check URL or hotlink permissions.</span>
        </div>
      ) : (
        <img
          src={trimmed}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export function AdminPage({ onNavigate }: AdminPageProps) {
  const {
    siteConfig,
    catalogSeeded,
    loadingCatalog,
    seeding,
    categoryCovers,
    allServiceDocs,
    spaGallery,
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    signOutUser,
    seedDatabaseIfNeeded,
    saveSiteConfig,
    saveCategoryCover,
    deleteCategoryCover,
    saveService,
    deleteService,
    saveGalleryPhoto,
    deleteGalleryPhoto,
  } = useCatalog();

  const [activeTab, setActiveTab] = useState<AdminTab>('services');
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  // Auto-seed only missing services on a brand-new uninitialized DB after catalog finishes loading
  useEffect(() => {
    if (!loadingCatalog && authReady && isAdmin && !catalogSeeded && !seeding) {
      void seedDatabaseIfNeeded()
        .then((didSeed) => {
          if (didSeed) {
            setStatusBanner({
              type: 'success',
              text: 'Database initialized cleanly without overwriting existing items.',
            });
          }
        })
        .catch((err) => {
          setStatusBanner({
            type: 'error',
            text: err instanceof Error ? err.message : 'Failed to initialize catalog.',
          });
        });
    }
  }, [loadingCatalog, authReady, isAdmin, catalogSeeded, seeding, seedDatabaseIfNeeded]);

  useEffect(() => {
    if (!statusBanner) return;
    const timer = window.setTimeout(() => setStatusBanner(null), 4500);
    return () => window.clearTimeout(timer);
  }, [statusBanner]);

  const notifySuccess = (text: string) => setStatusBanner({ type: 'success', text });
  const notifyError = (err: unknown, fallback: string) => {
    let msg = fallback;
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message) as { error?: string };
        msg = parsed.error || err.message;
      } catch {
        msg = err.message;
      }
    }
    setStatusBanner({ type: 'error', text: msg });
  };

  // ---------------- HERO & CATEGORY COVER STATE ----------------
  const [heroUrl, setHeroUrl] = useState(siteConfig.heroImageUrl);
  const [heroCaption, setHeroCaption] = useState(siteConfig.heroImageCaption);
  const [heroAlt, setHeroAlt] = useState(siteConfig.heroImageAlt);
  const [confirmHeroDelete, setConfirmHeroDelete] = useState(false);

  useEffect(() => {
    setHeroUrl(siteConfig.heroImageUrl);
    setHeroCaption(siteConfig.heroImageCaption);
    setHeroAlt(siteConfig.heroImageAlt);
  }, [siteConfig.heroImageUrl, siteConfig.heroImageCaption, siteConfig.heroImageAlt]);

  const [coverDrafts, setCoverDrafts] = useState<
    Record<CategoryId, { imageUrl: string; imageAlt: string }>
  >(() => {
    const initial = {} as Record<CategoryId, { imageUrl: string; imageAlt: string }>;
    CATEGORY_ROUTES.forEach((cat) => {
      const existing = categoryCovers[cat.id];
      initial[cat.id] = {
        imageUrl: existing?.imageUrl ?? '',
        imageAlt: existing?.imageAlt ?? cat.label,
      };
    });
    return initial;
  });
  const [confirmCoverDelete, setConfirmCoverDelete] = useState<CategoryId | null>(null);

  useEffect(() => {
    setCoverDrafts((prev) => {
      const next = { ...prev };
      CATEGORY_ROUTES.forEach((cat) => {
        const existing = categoryCovers[cat.id];
        next[cat.id] = {
          imageUrl: existing?.imageUrl ?? '',
          imageAlt: existing?.imageAlt ?? cat.label,
        };
      });
      return next;
    });
  }, [categoryCovers]);

  // ---------------- SERVICES EDITOR STATE ----------------
  const [selectedServiceCategory, setSelectedServiceCategory] =
    useState<ServiceCategoryId>('massages');
  const [editingService, setEditingService] = useState<CatalogServiceDoc | null>(null);
  const [isNewService, setIsNewService] = useState(false);
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<string | null>(null);

  // Promo & Home rate structured sub-editors
  const [promoIncludesText, setPromoIncludesText] = useState('');
  const [promoAddOnA, setPromoAddOnA] = useState<AddOnOption[]>([]);
  const [promoAddOnB, setPromoAddOnB] = useState<AddOnOption[]>([]);
  const [homeRatesDraft, setHomeRatesDraft] = useState<HomeServiceRateItem[]>([]);

  const categoryServices = useMemo(
    () =>
      allServiceDocs
        .filter((s) => s.categoryId === selectedServiceCategory)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allServiceDocs, selectedServiceCategory]
  );

  const openNewServiceEditor = () => {
    const nextSort =
      categoryServices.length > 0
        ? Math.max(...categoryServices.map((s) => s.sortOrder)) + 10
        : 10;
    const base: CatalogServiceDoc = {
      id: '',
      categoryId: selectedServiceCategory,
      name: '',
      tagalogSubtitle: '',
      price: selectedServiceCategory === 'promos' ? 1299 : 700,
      durationMinutes: selectedServiceCategory === 'promos' ? 60 : 60,
      durationLabel:
        selectedServiceCategory === 'home-service' ? '1.5 Hours Massage' : '60 minutes',
      description: '',
      hasUnlimitedWetArea: false,
      addOnATitle: 'Add On A (Pick One)',
      addOnBTitle: 'Add On B (Pick One)',
      sortOrder: nextSort,
    };
    setEditingService(base);
    setIsNewService(true);
    setPromoIncludesText('60 min Apros “Himlay” Signature Massage');
    setPromoAddOnA([{ id: 'opt-a-1', label: '25 min Body Scrub', minutes: 25 }]);
    setPromoAddOnB([]);
    setHomeRatesDraft([
      {
        id: 'rate-90',
        durationLabel: '1.5 Hours Massage',
        durationMinutes: 90,
        price: 1200,
      },
      {
        id: 'rate-120',
        durationLabel: '2 Hours Massage',
        durationMinutes: 120,
        price: 1500,
      },
    ]);
  };

  const openEditServiceEditor = (svc: CatalogServiceDoc) => {
    setEditingService({ ...svc });
    setIsNewService(false);
    setPromoIncludesText((svc.includes ?? []).join('\n'));
    setPromoAddOnA(
      svc.addOnAOptions && svc.addOnAOptions.length > 0
        ? svc.addOnAOptions.map((o) => ({ ...o }))
        : [{ id: 'opt-a-1', label: '20 min Hotstone', minutes: 20 }]
    );
    setPromoAddOnB(
      svc.addOnBOptions ? svc.addOnBOptions.map((o) => ({ ...o })) : []
    );
    setHomeRatesDraft(
      svc.homeRates && svc.homeRates.length > 0
        ? svc.homeRates.map((r) => ({ ...r }))
        : [
            {
              id: `${svc.id}-90`,
              durationLabel: '1.5 Hours Massage',
              durationMinutes: 90,
              price: svc.price,
            },
          ]
    );
  };

  const handleSaveServiceSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!editingService.name.trim()) {
      notifyError(new Error('Please enter a service or tier name.'), 'Validation failed');
      return;
    }

    const finalDoc: CatalogServiceDoc = {
      ...editingService,
      id:
        editingService.id ||
        sanitizeDocId(editingService.categoryId, editingService.name),
      name: editingService.name.trim(),
      durationLabel: editingService.durationLabel.trim(),
      description: editingService.description.trim(),
    };

    if (editingService.categoryId === 'promos') {
      const includesList = promoIncludesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
      const validAddOnA = promoAddOnA.filter((opt) => opt.label.trim().length > 0);
      if (validAddOnA.length === 0) {
        notifyError(
          new Error('Promos require at least one Add-On A option.'),
          'Validation failed'
        );
        return;
      }
      const validAddOnB = promoAddOnB.filter((opt) => opt.label.trim().length > 0);

      finalDoc.includes =
        includesList.length > 0
          ? includesList
          : ['60 min Apros “Himlay” Signature Massage'];
      finalDoc.durationLabel = `${editingService.durationMinutes || 60} min base`;
      finalDoc.description = finalDoc.includes.join(' · ');
      finalDoc.addOnATitle = editingService.addOnATitle?.trim() || 'Add On A (Pick One)';
      finalDoc.addOnAOptions = validAddOnA.map((opt, idx) => ({
        id: opt.id || `addon-a-${idx + 1}`,
        label: opt.label.trim(),
        minutes: Number(opt.minutes) || 0,
      }));
      if (validAddOnB.length > 0) {
        finalDoc.addOnBTitle =
          editingService.addOnBTitle?.trim() || 'Add On B (Pick One)';
        finalDoc.addOnBOptions = validAddOnB.map((opt, idx) => ({
          id: opt.id || `addon-b-${idx + 1}`,
          label: opt.label.trim(),
          minutes: Number(opt.minutes) || 0,
        }));
      } else {
        delete finalDoc.addOnBTitle;
        delete finalDoc.addOnBOptions;
      }
    } else if (editingService.categoryId === 'home-service') {
      const validRates = homeRatesDraft.filter((r) => r.durationLabel.trim().length > 0);
      if (validRates.length === 0) {
        notifyError(
          new Error('Add at least one session duration rate for this radius tier.'),
          'Validation failed'
        );
        return;
      }
      finalDoc.homeRates = validRates.map((rate, idx) => ({
        id: rate.id || `${finalDoc.id}-rate-${idx + 1}`,
        durationLabel: rate.durationLabel.trim(),
        durationMinutes: Math.max(15, Number(rate.durationMinutes) || 90),
        price: Math.max(0, Number(rate.price) || 0),
      }));
      finalDoc.price = finalDoc.homeRates[0].price;
      finalDoc.durationMinutes = finalDoc.homeRates[0].durationMinutes;
      finalDoc.durationLabel = finalDoc.homeRates
        .map((r) => r.durationLabel)
        .join(' / ');
    }

    setBusyAction('save-service');
    try {
      await saveService(finalDoc);
      notifySuccess(
        isNewService
          ? `Added "${finalDoc.name}" to live menu.`
          : `Updated "${finalDoc.name}".`
      );
      setEditingService(null);
    } catch (err) {
      notifyError(err, 'Failed to save service.');
    } finally {
      setBusyAction(null);
    }
  };

  // ---------------- INSIDE THE SPA GALLERY STATE ----------------
  const [editingPhoto, setEditingPhoto] = useState<SpaGalleryPhoto | null>(null);
  const [isNewPhoto, setIsNewPhoto] = useState(false);
  const [confirmDeletePhotoId, setConfirmDeletePhotoId] = useState<string | null>(null);

  const openNewGalleryPhoto = () => {
    const nextOrder =
      spaGallery.length > 0 ? Math.max(...spaGallery.map((p) => p.sortOrder)) + 1 : 1;
    setEditingPhoto({
      id: '',
      title: '',
      caption: '',
      imageUrl: '',
      sortOrder: nextOrder,
    });
    setIsNewPhoto(true);
  };

  const handleSaveGallerySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    if (!editingPhoto.title.trim()) {
      notifyError(new Error('Please provide a photo title.'), 'Validation failed');
      return;
    }
    if (!isValidImageUrl(editingPhoto.imageUrl)) {
      notifyError(
        new Error('Please paste a valid external image URL (https://...) or site image path.'),
        'Invalid image URL'
      );
      return;
    }

    const payload: SpaGalleryPhoto = {
      id: editingPhoto.id || sanitizeDocId('gallery', editingPhoto.title),
      title: editingPhoto.title.trim(),
      caption: editingPhoto.caption.trim(),
      imageUrl: editingPhoto.imageUrl.trim(),
      sortOrder: Number(editingPhoto.sortOrder) || 0,
    };

    setBusyAction('save-gallery');
    try {
      await saveGalleryPhoto(payload);
      notifySuccess(
        isNewPhoto
          ? `Added "${payload.title}" to Inside the Spa.`
          : `Updated "${payload.title}".`
      );
      setEditingPhoto(null);
    } catch (err) {
      notifyError(err, 'Failed to save gallery photo.');
    } finally {
      setBusyAction(null);
    }
  };

  // ---------------- AUTH GATES ----------------
  if (!authReady) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-5 bg-[#0F0D0C]">
        <p className="text-sm text-[#BEB3A8]">Checking owner session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-5 py-14 bg-[#0F0D0C]">
        <div className="max-w-md w-full bg-[#1E1A17] border border-[#322B27] rounded-2xl p-8 text-center">
          <div className="flex justify-center mb-5">
            <BrandLogo size="md" />
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
            Owner Management Portal
          </p>
          <h1 className="mt-2 font-serif text-3xl font-normal text-[#F5EFE6]">
            Apros Wellness Admin
          </h1>
          <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
            Sign in with your authorized Google owner account to manage service rates, Hero &amp; Category cover photos, and Inside the Spa gallery images.
          </p>

          <button
            type="button"
            onClick={async () => {
              try {
                await signInWithGoogle();
              } catch (err) {
                notifyError(err, 'Google sign-in failed.');
              }
            }}
            className="mt-7 w-full inline-flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors cursor-pointer"
          >
            <span>Sign In with Google</span>
          </button>

          {statusBanner?.type === 'error' && (
            <p className="mt-4 text-xs text-[#E5989B]">{statusBanner.text}</p>
          )}

          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="mt-5 inline-flex items-center gap-1.5 text-xs text-[#BEB3A8] hover:text-[#D4AF6A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.75} />
            <span>Back to Live Website</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-5 py-14 bg-[#0F0D0C]">
        <div className="max-w-md w-full bg-[#1E1A17] border border-[#322B27] rounded-2xl p-8 text-center">
          <ShieldAlert className="w-8 h-8 text-[#D4AF6A] mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
            Access Restricted
          </p>
          <h1 className="mt-2 font-serif text-2xl font-normal text-[#F5EFE6]">
            Not an Authorized Owner Account
          </h1>
          <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
            Signed in as <strong className="text-[#F5EFE6]">{user.email}</strong>. Only the designated spa owner ({ADMIN_EMAIL}) can publish changes here.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Switch Account</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#161311] border border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6] transition-colors cursor-pointer"
            >
              <span>Back to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0F0D0C] min-h-screen pb-16 overflow-x-clip">
      {/* Top Admin Control Header */}
      <div className="bg-[#161311] border-b border-[#2D2622]">
        <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 py-5 sm:py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A] break-all">
              Live Storefront CMS · {user.email}
            </p>
            <h1 className="mt-1 font-serif text-3xl sm:text-4xl font-normal text-[#F5EFE6]">
              Apros Wellness Admin
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#D4AF6A] hover:border-[#D4AF6A] transition-colors cursor-pointer"
            >
              <span>View Live Site</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => void signOutUser()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Main Section Switcher */}
        <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-wrap gap-2 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              activeTab === 'services'
                ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6]'
                : 'bg-[#1E1A17] border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#D4AF6A]" strokeWidth={1.75} />
            <span>Services &amp; Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              activeTab === 'photos'
                ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6]'
                : 'bg-[#1E1A17] border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6]'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-[#D4AF6A]" strokeWidth={1.75} />
            <span>Hero &amp; Category Covers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-colors cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6]'
                : 'bg-[#1E1A17] border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#D4AF6A]" strokeWidth={1.75} />
            <span>Inside the Spa ({spaGallery.length})</span>
          </button>
        </div>
      </div>

      <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 pt-6 sm:pt-8">
        {seeding && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-[#1E1A17] border border-[#D4AF6A]/40 text-xs sm:text-sm text-[#D4AF6A]">
            Syncing initial menu &amp; sanctuary photos to your database…
          </div>
        )}

        {statusBanner && (
          <div
            role="status"
            className={`mb-6 px-4 py-3 rounded-xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
              statusBanner.type === 'success'
                ? 'bg-[#1E1A17] border-[#D4AF6A]/50 text-[#F5EFE6]'
                : 'bg-[#2C1417] border-[#E5989B]/50 text-[#F5EFE6]'
            }`}
          >
            <span>{statusBanner.text}</span>
            <button
              type="button"
              onClick={() => setStatusBanner(null)}
              aria-label="Dismiss notice"
              className="text-[#BEB3A8] hover:text-[#F5EFE6] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== TAB 1: SERVICES & RATES ==================== */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {SERVICE_CATEGORY_TABS.map((cat) => {
                  const active = cat.id === selectedServiceCategory;
                  const count = allServiceDocs.filter(
                    (s) => s.categoryId === cat.id
                  ).length;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedServiceCategory(cat.id);
                        setEditingService(null);
                        setConfirmDeleteServiceId(null);
                      }}
                      className={`px-3.5 py-2 rounded-full text-xs font-medium border transition-colors cursor-pointer tabular-nums ${
                        active
                          ? 'bg-[#28221E] border-[#D4AF6A] text-[#F5EFE6]'
                          : 'bg-[#161311] border-[#322B27] text-[#BEB3A8] hover:border-[#9E7B4F] hover:text-[#F5EFE6]'
                      }`}
                    >
                      {cat.label} ({count})
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={openNewServiceEditor}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add New Service / Rate</span>
              </button>
            </div>

            {/* Service Create/Edit Form */}
            {editingService && (
              <form
                onSubmit={handleSaveServiceSubmit}
                className="bg-[#1E1A17] border border-[#D4AF6A]/50 rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2D2622]">
                  <h2 className="font-serif text-2xl font-normal text-[#F5EFE6]">
                    {isNewService
                      ? `Add New Item in ${
                          SERVICE_CATEGORY_TABS.find(
                            (c) => c.id === editingService.categoryId
                          )?.label
                        }`
                      : `Edit "${editingService.name}"`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="text-xs text-[#BEB3A8] hover:text-[#F5EFE6] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      {editingService.categoryId === 'home-service'
                        ? 'Radius Zone Title *'
                        : 'Treatment / Package Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={160}
                      value={editingService.name}
                      onChange={(e) =>
                        setEditingService({ ...editingService, name: e.target.value })
                      }
                      placeholder={
                        editingService.categoryId === 'home-service'
                          ? 'e.g. Within 10 km Radius'
                          : 'e.g. Apros “Himlay” Signature Massage'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>

                  {editingService.categoryId !== 'promos' &&
                    editingService.categoryId !== 'home-service' && (
                      <div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          maxLength={160}
                          value={editingService.tagalogSubtitle ?? ''}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              tagalogSubtitle: e.target.value,
                            })
                          }
                          placeholder="e.g. Signature Massage & Hot Stone"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                        />
                      </div>
                    )}

                  {editingService.categoryId !== 'home-service' && (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                        Rate (PHP ₱) *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={1000000}
                        value={editingService.price}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            price: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] tabular-nums focus:outline-none focus:border-[#D4AF6A]"
                      />
                    </div>
                  )}

                  {editingService.categoryId !== 'home-service' && (
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                        {editingService.categoryId === 'promos'
                          ? 'Base Massage Minutes'
                          : 'Timed Minutes (0 = untimed)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1440}
                        value={editingService.durationMinutes}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            durationMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] tabular-nums focus:outline-none focus:border-[#D4AF6A]"
                      />
                    </div>
                  )}

                  {editingService.categoryId !== 'promos' &&
                    editingService.categoryId !== 'home-service' && (
                      <div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                          Duration / Session Label *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={120}
                          value={editingService.durationLabel}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              durationLabel: e.target.value,
                            })
                          }
                          placeholder="e.g. 60 minutes, Clinical Session, Single Area"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                        />
                      </div>
                    )}

                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={10000}
                      value={editingService.sortOrder}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          sortOrder: Number(e.target.value),
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] tabular-nums focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>
                </div>

                {editingService.categoryId !== 'promos' && (
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      {editingService.categoryId === 'home-service'
                        ? 'Typical Areas Covered'
                        : 'Treatment Description'}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={600}
                      value={editingService.description}
                      onChange={(e) =>
                        setEditingService({
                          ...editingService,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>
                )}

                {/* Promo Package Builder */}
                {editingService.categoryId === 'promos' && (
                  <div className="space-y-5 pt-3 border-t border-[#2D2622]">
                    <label className="inline-flex items-center gap-2.5 text-sm text-[#F5EFE6] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingService.hasUnlimitedWetArea)}
                        onChange={(e) =>
                          setEditingService({
                            ...editingService,
                            hasUnlimitedWetArea: e.target.checked,
                          })
                        }
                        className="accent-[#D4AF6A] w-4 h-4"
                      />
                      <span>Includes Unlimited Sauna, Steam &amp; Shower Access</span>
                    </label>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                        Base Inclusions (One item per line)
                      </label>
                      <textarea
                        rows={3}
                        value={promoIncludesText}
                        onChange={(e) => setPromoIncludesText(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                      />
                    </div>

                    {/* Add-On Group A */}
                    <div className="bg-[#161311] border border-[#2D2622] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={editingService.addOnATitle ?? 'Add On A (Pick One)'}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              addOnATitle: e.target.value,
                            })
                          }
                          className="text-base sm:text-xs uppercase tracking-[0.12em] text-[#D4AF6A] bg-transparent border-b border-[#322B27] focus:outline-none focus:border-[#D4AF6A] pb-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPromoAddOnA((prev) => [
                              ...prev,
                              {
                                id: `opt-a-${Date.now()}`,
                                label: '',
                                minutes: 20,
                              },
                            ])
                          }
                          className="text-xs text-[#D4AF6A] hover:underline cursor-pointer"
                        >
                          + Add Option
                        </button>
                      </div>

                      {promoAddOnA.map((opt, idx) => (
                        <div key={opt.id || idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Option label (e.g. 25 min Body Scrub)"
                            value={opt.label}
                            onChange={(e) =>
                              setPromoAddOnA((prev) =>
                                prev.map((row, i) =>
                                  i === idx ? { ...row, label: e.target.value } : row
                                )
                              )
                            }
                            className="flex-1 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6]"
                          />
                          <input
                            type="number"
                            min={0}
                            max={360}
                            placeholder="Min"
                            value={opt.minutes}
                            onChange={(e) =>
                              setPromoAddOnA((prev) =>
                                prev.map((row, i) =>
                                  i === idx
                                    ? { ...row, minutes: Number(e.target.value) }
                                    : row
                                )
                              )
                            }
                            className="w-24 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6] tabular-nums"
                          />
                          {promoAddOnA.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setPromoAddOnA((prev) => prev.filter((_, i) => i !== idx))
                              }
                              aria-label="Remove option"
                              className="p-2 text-[#9C9187] hover:text-[#E5989B] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add-On Group B */}
                    <div className="bg-[#161311] border border-[#2D2622] rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={editingService.addOnBTitle ?? 'Add On B (Pick One)'}
                          onChange={(e) =>
                            setEditingService({
                              ...editingService,
                              addOnBTitle: e.target.value,
                            })
                          }
                          className="text-base sm:text-xs uppercase tracking-[0.12em] text-[#D4AF6A] bg-transparent border-b border-[#322B27] focus:outline-none focus:border-[#D4AF6A] pb-1"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setPromoAddOnB((prev) => [
                              ...prev,
                              {
                                id: `opt-b-${Date.now()}`,
                                label: '',
                                minutes: 20,
                              },
                            ])
                          }
                          className="text-xs text-[#D4AF6A] hover:underline cursor-pointer"
                        >
                          + Add Second Pick Group Option
                        </button>
                      </div>

                      {promoAddOnB.length === 0 ? (
                        <p className="text-xs text-[#9C9187]">
                          No Add-On B options configured for this package.
                        </p>
                      ) : (
                        promoAddOnB.map((opt, idx) => (
                          <div key={opt.id || idx} className="flex flex-wrap sm:flex-nowrap gap-2 items-center">
                            <input
                              type="text"
                              placeholder="Option label (e.g. 20 min Hotstone)"
                              value={opt.label}
                              onChange={(e) =>
                                setPromoAddOnB((prev) =>
                                  prev.map((row, i) =>
                                    i === idx ? { ...row, label: e.target.value } : row
                                  )
                                )
                              }
                              className="flex-1 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6]"
                            />
                            <input
                              type="number"
                              min={0}
                              max={360}
                              placeholder="Min"
                              value={opt.minutes}
                              onChange={(e) =>
                                setPromoAddOnB((prev) =>
                                  prev.map((row, i) =>
                                    i === idx
                                      ? { ...row, minutes: Number(e.target.value) }
                                      : row
                                  )
                                )
                              }
                              className="w-24 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6] tabular-nums"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPromoAddOnB((prev) => prev.filter((_, i) => i !== idx))
                              }
                              aria-label="Remove option"
                              className="p-2 text-[#9C9187] hover:text-[#E5989B] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Home Service Duration Rates Builder */}
                {editingService.categoryId === 'home-service' && (
                  <div className="bg-[#161311] border border-[#2D2622] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-[0.12em] text-[#D4AF6A]">
                        Session Durations &amp; Rates (+ Transpo)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setHomeRatesDraft((prev) => [
                            ...prev,
                            {
                              id: `rate-${Date.now()}`,
                              durationLabel: '2.5 Hours Massage',
                              durationMinutes: 150,
                              price: 2000,
                            },
                          ])
                        }
                        className="text-xs text-[#D4AF6A] hover:underline cursor-pointer"
                      >
                        + Add Duration Rate
                      </button>
                    </div>

                    {homeRatesDraft.map((rate, idx) => (
                      <div key={rate.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Label (e.g. 1.5 Hours Massage)"
                          value={rate.durationLabel}
                          onChange={(e) =>
                            setHomeRatesDraft((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, durationLabel: e.target.value } : r
                              )
                            )
                          }
                          className="sm:col-span-5 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6]"
                        />
                        <input
                          type="number"
                          min={15}
                          max={600}
                          placeholder="Minutes"
                          value={rate.durationMinutes}
                          onChange={(e) =>
                            setHomeRatesDraft((prev) =>
                              prev.map((r, i) =>
                                i === idx
                                  ? { ...r, durationMinutes: Number(e.target.value) }
                                  : r
                              )
                            )
                          }
                          className="sm:col-span-3 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6] tabular-nums"
                        />
                        <input
                          type="number"
                          min={0}
                          max={1000000}
                          placeholder="Rate (₱)"
                          value={rate.price}
                          onChange={(e) =>
                            setHomeRatesDraft((prev) =>
                              prev.map((r, i) =>
                                i === idx ? { ...r, price: Number(e.target.value) } : r
                              )
                            )
                          }
                          className="sm:col-span-3 px-3 py-2 rounded-lg bg-[#1E1A17] border border-[#322B27] text-base sm:text-xs text-[#F5EFE6] tabular-nums"
                        />
                        <div className="sm:col-span-1 flex justify-end">
                          {homeRatesDraft.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                setHomeRatesDraft((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
                              }
                              aria-label="Remove duration rate"
                              className="p-2 text-[#9C9187] hover:text-[#E5989B] cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
                    className="px-5 py-2.5 rounded-full text-xs font-medium bg-[#161311] border border-[#322B27] text-[#BEB3A8] hover:text-[#F5EFE6] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busyAction === 'save-service'}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#D4AF6A] text-[#0F0D0C] hover:bg-[#C5A059] disabled:opacity-60 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4" strokeWidth={2.2} />
                    <span>
                      {busyAction === 'save-service' ? 'Saving…' : 'Save & Publish'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Existing Category Items List */}
            <div className="bg-[#161311] border border-[#2D2622] rounded-2xl divide-y divide-[#2D2622]">
              {categoryServices.length === 0 ? (
                <div className="p-8 text-center text-sm text-[#BEB3A8]">
                  No treatments or rates in this category yet. Click{' '}
                  <strong className="text-[#F5EFE6]">Add New Service / Rate</strong> above to add one.
                </div>
              ) : (
                categoryServices.map((svc) => {
                  const isDeleting = confirmDeleteServiceId === svc.id;
                  return (
                    <div
                      key={svc.id}
                      className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-baseline gap-2.5">
                          <h3 className="font-serif text-xl text-[#F5EFE6]">
                            {svc.name}
                          </h3>
                          {svc.tagalogSubtitle && (
                            <span className="text-xs text-[#BEB3A8]">
                              · {svc.tagalogSubtitle}
                            </span>
                          )}
                          <span className="text-sm font-semibold text-[#D4AF6A] tabular-nums">
                            {svc.categoryId === 'home-service' && svc.homeRates
                              ? svc.homeRates
                                  .map(
                                    (r) => `${r.durationLabel}: ${formatPeso(r.price)}`
                                  )
                                  .join(' · ')
                              : formatPeso(svc.price)}
                          </span>
                        </div>
                        <p className="text-xs text-[#9C9187] tabular-nums">
                          {svc.durationLabel} · Order #{svc.sortOrder}
                        </p>
                        {svc.description && (
                          <p className="text-sm text-[#BEB3A8] leading-relaxed">
                            {svc.description}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => openEditServiceEditor(svc)}
                          className="px-4 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] transition-colors cursor-pointer"
                        >
                          Edit
                        </button>

                        {!isDeleting ? (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteServiceId(svc.id)}
                            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#BEB3A8] hover:border-[#E5989B] hover:text-[#E5989B] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={busyAction === `del-${svc.id}`}
                              onClick={async () => {
                                setBusyAction(`del-${svc.id}`);
                                try {
                                  await deleteService(svc.id);
                                  notifySuccess(`Deleted "${svc.name}".`);
                                  setConfirmDeleteServiceId(null);
                                } catch (err) {
                                  notifyError(err, 'Failed to delete service.');
                                } finally {
                                  setBusyAction(null);
                                }
                              }}
                              className="px-3.5 py-2 rounded-full text-xs font-medium bg-[#6E262A] text-[#F5EFE6] hover:bg-[#8A3035] cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteServiceId(null)}
                              className="px-3 py-2 rounded-full text-xs text-[#BEB3A8] hover:text-[#F5EFE6] cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ==================== TAB 2: HERO & CATEGORY COVERS ==================== */}
        {activeTab === 'photos' && (
          <div className="space-y-10">
            {/* Hero Photo Manager */}
            <section className="bg-[#1E1A17] border border-[#322B27] rounded-2xl p-6 sm:p-8">
              <div className="pb-5 border-b border-[#2D2622]">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                  Homepage Focal Visual
                </p>
                <h2 className="mt-1 font-serif text-2xl font-normal text-[#F5EFE6]">
                  Hero Sanctuary Photo
                </h2>
              </div>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-5">
                  <ImagePreviewBox
                    url={heroUrl}
                    alt={heroAlt || 'Hero photo preview'}
                    emptyLabel="Hero photo is deleted / hidden on homepage"
                    aspectClass="aspect-[4/3]"
                  />
                </div>

                <div className="lg:col-span-7 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      External Image URL (https://...)
                    </label>
                    <input
                      type="text"
                      maxLength={2048}
                      value={heroUrl}
                      onChange={(e) => setHeroUrl(e.target.value)}
                      placeholder="https://example.com/your-spa-hero.jpg"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      Caption Below Hero Image
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={heroCaption}
                      onChange={(e) => setHeroCaption(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                      Image Alt Description
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={heroAlt}
                      onChange={(e) => setHeroAlt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={busyAction === 'save-hero'}
                      onClick={async () => {
                        if (heroUrl.trim() && !isValidImageUrl(heroUrl)) {
                          notifyError(
                            new Error('Please paste a valid https:// image link or clear it to delete.'),
                            'Invalid URL'
                          );
                          return;
                        }
                        setBusyAction('save-hero');
                        try {
                          await saveSiteConfig({
                            heroImageUrl: heroUrl.trim(),
                            heroImageAlt: heroAlt.trim(),
                            heroImageCaption: heroCaption.trim(),
                          });
                          notifySuccess('Hero photo configuration saved.');
                        } catch (err) {
                          notifyError(err, 'Failed to save hero photo.');
                        } finally {
                          setBusyAction(null);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#D4AF6A] text-[#0F0D0C] hover:bg-[#C5A059] transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" strokeWidth={2.2} />
                      <span>Save Hero Photo</span>
                    </button>

                    {!confirmHeroDelete ? (
                      <button
                        type="button"
                        onClick={() => setConfirmHeroDelete(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-medium bg-[#161311] border border-[#322B27] text-[#BEB3A8] hover:border-[#E5989B] hover:text-[#E5989B] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Hero Photo</span>
                      </button>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setBusyAction('del-hero');
                            try {
                              setHeroUrl('');
                              await saveSiteConfig({
                                heroImageUrl: '',
                                heroImageAlt: '',
                                heroImageCaption: '',
                              });
                              setConfirmHeroDelete(false);
                              notifySuccess('Hero photo removed from homepage.');
                            } catch (err) {
                              notifyError(err, 'Failed to delete hero photo.');
                            } finally {
                              setBusyAction(null);
                            }
                          }}
                          className="px-4 py-2 rounded-full text-xs font-medium bg-[#6E262A] text-[#F5EFE6] cursor-pointer"
                        >
                          Confirm Remove
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmHeroDelete(false)}
                          className="px-3 py-2 text-xs text-[#BEB3A8] cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Category Cover Photos Manager */}
            <section>
              <div className="pb-4 border-b border-[#2D2622] mb-6">
                <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
                  Directory Cards
                </p>
                <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal text-[#F5EFE6]">
                  Category Cover Photos
                </h2>
                <p className="mt-1.5 text-sm text-[#BEB3A8]">
                  Paste an external image link to display a cover banner on any category card on /, or delete a cover to show text-only.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {CATEGORY_ROUTES.map((cat) => {
                  const draft = coverDrafts[cat.id] ?? {
                    imageUrl: '',
                    imageAlt: cat.label,
                  };
                  const isConfirming = confirmCoverDelete === cat.id;

                  return (
                    <div
                      key={cat.id}
                      className="bg-[#1E1A17] border border-[#322B27] rounded-2xl p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-serif text-xl text-[#F5EFE6]">
                          {cat.number} · {cat.label}
                        </h3>
                        <span className="text-xs text-[#9C9187]">{cat.path}</span>
                      </div>

                      <ImagePreviewBox
                        url={draft.imageUrl}
                        alt={draft.imageAlt || cat.label}
                        emptyLabel="No cover photo (card displays clean typography)"
                        aspectClass="aspect-[16/9]"
                      />

                      <div className="space-y-3">
                        <input
                          type="text"
                          maxLength={2048}
                          value={draft.imageUrl}
                          onChange={(e) =>
                            setCoverDrafts((prev) => ({
                              ...prev,
                              [cat.id]: { ...draft, imageUrl: e.target.value },
                            }))
                          }
                          placeholder="Paste external image link (https://...)"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                        />

                        <input
                          type="text"
                          maxLength={300}
                          value={draft.imageAlt}
                          onChange={(e) =>
                            setCoverDrafts((prev) => ({
                              ...prev,
                              [cat.id]: { ...draft, imageAlt: e.target.value },
                            }))
                          }
                          placeholder="Image alt label (optional)"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-xs text-[#BEB3A8] focus:outline-none focus:border-[#D4AF6A]"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          disabled={busyAction === `cover-${cat.id}`}
                          onClick={async () => {
                            if (draft.imageUrl.trim() && !isValidImageUrl(draft.imageUrl)) {
                              notifyError(
                                new Error('Please paste a valid https:// URL or delete the cover.'),
                                'Invalid cover URL'
                              );
                              return;
                            }
                            setBusyAction(`cover-${cat.id}`);
                            try {
                              await saveCategoryCover(
                                cat.id,
                                draft.imageUrl.trim(),
                                draft.imageAlt.trim() || cat.label
                              );
                              notifySuccess(`Saved cover photo for ${cat.label}.`);
                            } catch (err) {
                              notifyError(err, `Failed to update ${cat.label} cover.`);
                            } finally {
                              setBusyAction(null);
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#D4AF6A] text-[#0F0D0C] hover:bg-[#C5A059] cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
                          <span>Save Cover</span>
                        </button>

                        {draft.imageUrl.trim() && (
                          !isConfirming ? (
                            <button
                              type="button"
                              onClick={() => setConfirmCoverDelete(cat.id)}
                              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full text-xs bg-[#161311] border border-[#322B27] text-[#BEB3A8] hover:border-[#E5989B] hover:text-[#E5989B] cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete Cover</span>
                            </button>
                          ) : (
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={async () => {
                                  setBusyAction(`del-cover-${cat.id}`);
                                  try {
                                    await deleteCategoryCover(cat.id);
                                    setCoverDrafts((prev) => ({
                                      ...prev,
                                      [cat.id]: { ...draft, imageUrl: '' },
                                    }));
                                    setConfirmCoverDelete(null);
                                    notifySuccess(`Deleted cover photo for ${cat.label}.`);
                                  } catch (err) {
                                    notifyError(err, 'Failed to delete cover.');
                                  } finally {
                                    setBusyAction(null);
                                  }
                                }}
                                className="px-3 py-1.5 rounded-full text-xs bg-[#6E262A] text-[#F5EFE6] cursor-pointer"
                              >
                                Confirm Delete
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmCoverDelete(null)}
                                className="px-2 py-1.5 text-xs text-[#BEB3A8] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ==================== TAB 3: INSIDE THE SPA GALLERY ==================== */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#F5EFE6]">
                  Inside the Spa Gallery
                </h2>
                <p className="mt-1 text-sm text-[#BEB3A8]">
                  Showcase 4–5 photos of your sanctuary spaces using external image URLs, each with a title and short caption.
                </p>
              </div>

              <button
                type="button"
                onClick={openNewGalleryPhoto}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Spa Photo</span>
              </button>
            </div>

            {spaGallery.length > 5 && (
              <div className="px-4 py-3 rounded-xl bg-[#1E1A17] border border-[#D4AF6A]/40 text-xs text-[#D4AF6A]">
                Tip: We recommend keeping 4–5 photos here for the cleanest homepage layout (currently showing {spaGallery.length}).
              </div>
            )}

            {editingPhoto && (
              <form
                onSubmit={handleSaveGallerySubmit}
                className="bg-[#1E1A17] border border-[#D4AF6A]/50 rounded-2xl p-6 sm:p-8 space-y-5"
              >
                <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2D2622]">
                  <h3 className="font-serif text-2xl font-normal text-[#F5EFE6]">
                    {isNewPhoto ? 'Add Inside the Spa Photo' : `Edit "${editingPhoto.title}"`}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingPhoto(null)}
                    className="text-xs text-[#BEB3A8] hover:text-[#F5EFE6] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-5">
                    <ImagePreviewBox
                      url={editingPhoto.imageUrl}
                      alt={editingPhoto.title || 'Gallery preview'}
                      emptyLabel="Paste an external image URL to preview"
                      aspectClass="aspect-[4/3]"
                    />
                  </div>

                  <div className="lg:col-span-7 space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                        External Image URL *
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={2048}
                        value={editingPhoto.imageUrl}
                        onChange={(e) =>
                          setEditingPhoto({ ...editingPhoto, imageUrl: e.target.value })
                        }
                        placeholder="https://example.com/spa-room.jpg"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                          Title *
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={100}
                          value={editingPhoto.title}
                          onChange={(e) =>
                            setEditingPhoto({ ...editingPhoto, title: e.target.value })
                          }
                          placeholder="e.g. Private Hammam Suite"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                          Order
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={1000}
                          value={editingPhoto.sortOrder}
                          onChange={(e) =>
                            setEditingPhoto({
                              ...editingPhoto,
                              sortOrder: Number(e.target.value),
                            })
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] tabular-nums focus:outline-none focus:border-[#D4AF6A]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-[0.1em] text-[#BEB3A8] mb-1.5">
                        Short Caption
                      </label>
                      <textarea
                        rows={2}
                        maxLength={240}
                        value={editingPhoto.caption}
                        onChange={(e) =>
                          setEditingPhoto({ ...editingPhoto, caption: e.target.value })
                        }
                        placeholder="Short description shown under the photo on the homepage."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#161311] border border-[#322B27] text-base sm:text-sm text-[#F5EFE6] focus:outline-none focus:border-[#D4AF6A]"
                      />
                    </div>

                    <div className="pt-1 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingPhoto(null)}
                        className="px-4 py-2 rounded-full text-xs text-[#BEB3A8] hover:text-[#F5EFE6] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={busyAction === 'save-gallery'}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-medium bg-[#D4AF6A] text-[#0F0D0C] hover:bg-[#C5A059] cursor-pointer"
                      >
                        <Check className="w-4 h-4" strokeWidth={2.2} />
                        <span>Save Photo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {spaGallery.map((photo) => {
                const isConfirming = confirmDeletePhotoId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className="bg-[#1E1A17] border border-[#322B27] rounded-2xl overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="p-3 pb-0">
                        <ImagePreviewBox
                          url={photo.imageUrl}
                          alt={photo.title}
                          emptyLabel="No URL"
                          aspectClass="aspect-[4/3]"
                        />
                      </div>
                      <div className="p-5">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-[#D4AF6A] tabular-nums">
                          Order #{photo.sortOrder}
                        </p>
                        <h3 className="mt-1 font-serif text-xl text-[#F5EFE6]">
                          {photo.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-[#BEB3A8] leading-relaxed">
                          {photo.caption}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 py-4 border-t border-[#2D2622] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPhoto({ ...photo });
                          setIsNewPhoto(false);
                        }}
                        className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#161311] border border-[#322B27] text-[#F5EFE6] hover:border-[#D4AF6A] cursor-pointer"
                      >
                        Edit
                      </button>

                      {!isConfirming ? (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePhotoId(photo.id)}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs bg-[#161311] border border-[#322B27] text-[#BEB3A8] hover:border-[#E5989B] hover:text-[#E5989B] cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={async () => {
                              setBusyAction(`del-photo-${photo.id}`);
                              try {
                                await deleteGalleryPhoto(photo.id);
                                setConfirmDeletePhotoId(null);
                                notifySuccess(`Deleted "${photo.title}".`);
                              } catch (err) {
                                notifyError(err, 'Failed to delete gallery photo.');
                              } finally {
                                setBusyAction(null);
                              }
                            }}
                            className="px-3 py-1.5 rounded-full text-xs bg-[#6E262A] text-[#F5EFE6] cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeletePhotoId(null)}
                            className="px-2 py-1.5 text-xs text-[#BEB3A8] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
