import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase';
import {
  ACUPUNCTURE_SERVICES,
  CATEGORY_ROUTES,
  EXCLUSIVE_COMBO_OFFERS,
  HOME_SERVICE_TIERS,
  MASSAGE_SERVICES,
  PROMO_PACKAGES,
  SIGNATURE_COMBO_SERVICES,
  WAXING_SERVICES,
  WET_AREA_SERVICES,
  formatPeso,
  type CategoryId,
  type CategoryRoute,
} from '../data/services';
import type { HomeServiceTier, PromoPackage, SimpleService } from '../types/booking';
import type {
  CatalogServiceDoc,
  CategoryCover,
  ServiceCategoryId,
  SiteConfig,
  SpaGalleryPhoto,
} from '../types/catalog';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';

export const ADMIN_EMAIL = 'melmarvelasco@gmail.com';

const EMPTY_SITE_CONFIG: SiteConfig = {
  heroImageUrl: '',
  heroImageAlt: '',
  heroImageCaption: '',
  catalogSeeded: false,
};

function buildDefaultServices(): CatalogServiceDoc[] {
  const docs: CatalogServiceDoc[] = [];

  const pushSimpleList = (list: SimpleService[], categoryId: ServiceCategoryId) => {
    list.forEach((item, index) => {
      const entry: CatalogServiceDoc = {
        id: item.id,
        categoryId,
        name: item.name,
        price: item.price,
        durationMinutes: item.durationMinutes ?? 0,
        durationLabel: item.durationLabel,
        description: item.description,
        sortOrder: (index + 1) * 10,
      };
      if (item.tagalogSubtitle) {
        entry.tagalogSubtitle = item.tagalogSubtitle;
      }
      docs.push(entry);
    });
  };

  pushSimpleList(MASSAGE_SERVICES, 'massages');
  pushSimpleList(SIGNATURE_COMBO_SERVICES, 'combos');
  pushSimpleList(WET_AREA_SERVICES, 'wet-area');
  pushSimpleList(ACUPUNCTURE_SERVICES, 'acupuncture');
  pushSimpleList(WAXING_SERVICES, 'waxing');
  pushSimpleList(EXCLUSIVE_COMBO_OFFERS, 'exclusive');

  PROMO_PACKAGES.forEach((pkg, index) => {
    const entry: CatalogServiceDoc = {
      id: pkg.id,
      categoryId: 'promos',
      name: pkg.name,
      price: pkg.price,
      durationMinutes: pkg.baseDurationMinutes,
      durationLabel: `${pkg.baseDurationMinutes} min base`,
      description: pkg.includes.join(' · '),
      includes: [...pkg.includes],
      hasUnlimitedWetArea: pkg.hasUnlimitedWetArea,
      addOnATitle: pkg.addOnAGroup.title,
      addOnAOptions: pkg.addOnAGroup.options.map((opt) => ({ ...opt })),
      sortOrder: (index + 1) * 10,
    };
    if (pkg.addOnBGroup) {
      entry.addOnBTitle = pkg.addOnBGroup.title;
      entry.addOnBOptions = pkg.addOnBGroup.options.map((opt) => ({ ...opt }));
    }
    docs.push(entry);
  });

  HOME_SERVICE_TIERS.forEach((tier, index) => {
    const lowestPrice = tier.rates[0]?.price ?? 0;
    docs.push({
      id: tier.id,
      categoryId: 'home-service',
      name: tier.radiusLabel,
      price: lowestPrice,
      durationMinutes: tier.rates[0]?.durationMinutes ?? 90,
      durationLabel: tier.rates.map((r) => r.durationLabel).join(' / '),
      description: tier.distanceNote,
      homeRates: tier.rates.map((r) => ({ ...r })),
      sortOrder: (index + 1) * 10,
    });
  });

  return docs;
}

export const DEFAULT_CATALOG_SERVICES: CatalogServiceDoc[] = buildDefaultServices();

export function sanitizeDocId(prefix: string, raw: string): string {
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${prefix}-${cleaned || 'item'}-${suffix}`.slice(0, 128);
}

function clampString(value: string, maxLen: number): string {
  return value.trim().slice(0, maxLen);
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function docToSimpleService(docItem: CatalogServiceDoc): SimpleService {
  return {
    id: docItem.id,
    name: docItem.name,
    tagalogSubtitle: docItem.tagalogSubtitle,
    price: docItem.price,
    durationMinutes: docItem.durationMinutes > 0 ? docItem.durationMinutes : null,
    durationLabel: docItem.durationLabel,
    description: docItem.description,
  };
}

function docToPromoPackage(docItem: CatalogServiceDoc): PromoPackage {
  const fallbackOption = { id: 'add-on-option-1', label: 'Included Option', minutes: 20 };
  const addOnAOptions =
    docItem.addOnAOptions && docItem.addOnAOptions.length > 0
      ? docItem.addOnAOptions
      : [fallbackOption];

  const promo: PromoPackage = {
    id: docItem.id,
    name: docItem.name,
    price: docItem.price,
    baseDurationMinutes: docItem.durationMinutes > 0 ? docItem.durationMinutes : 60,
    includes:
      docItem.includes && docItem.includes.length > 0
        ? docItem.includes
        : docItem.description
        ? [docItem.description]
        : ['60 min Apros “Himlay” Signature Massage'],
    hasUnlimitedWetArea: Boolean(docItem.hasUnlimitedWetArea),
    addOnAGroup: {
      title: docItem.addOnATitle || 'Add On A (Pick One)',
      options: addOnAOptions,
    },
  };

  if (docItem.addOnBOptions && docItem.addOnBOptions.length > 0) {
    promo.addOnBGroup = {
      title: docItem.addOnBTitle || 'Add On B (Pick One)',
      options: docItem.addOnBOptions,
    };
  }

  return promo;
}

function docToHomeServiceTier(docItem: CatalogServiceDoc): HomeServiceTier {
  const fallbackRate = {
    id: `${docItem.id}-90`,
    durationLabel: docItem.durationLabel || '1.5 Hours Massage',
    durationMinutes: docItem.durationMinutes > 0 ? docItem.durationMinutes : 90,
    price: docItem.price,
  };
  return {
    id: docItem.id,
    radiusLabel: docItem.name,
    distanceNote: docItem.description,
    rates:
      docItem.homeRates && docItem.homeRates.length > 0
        ? docItem.homeRates
        : [fallbackRate],
  };
}

interface CatalogContextValue {
  siteConfig: SiteConfig;
  catalogSeeded: boolean;
  loadingCatalog: boolean;
  seeding: boolean;
  categoryCovers: Partial<Record<CategoryId, CategoryCover>>;
  categoryCards: CategoryRoute[];
  allServiceDocs: CatalogServiceDoc[];
  massageServices: SimpleService[];
  signatureComboServices: SimpleService[];
  exclusiveComboOffers: SimpleService[];
  promoPackages: PromoPackage[];
  wetAreaServices: SimpleService[];
  acupunctureServices: SimpleService[];
  waxingServices: SimpleService[];
  homeServiceTiers: HomeServiceTier[];
  spaGallery: SpaGalleryPhoto[];
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  seedDatabaseIfNeeded: () => Promise<boolean>;
  saveSiteConfig: (next: Omit<SiteConfig, 'catalogSeeded'> & { catalogSeeded?: boolean }) => Promise<void>;
  saveCategoryCover: (categoryId: CategoryId, imageUrl: string, imageAlt: string) => Promise<void>;
  deleteCategoryCover: (categoryId: CategoryId) => Promise<void>;
  saveService: (service: CatalogServiceDoc) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  saveGalleryPhoto: (photo: SpaGalleryPhoto) => Promise<void>;
  deleteGalleryPhoto: (photoId: string) => Promise<void>;
}

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [siteConfigDoc, setSiteConfigDoc] = useState<SiteConfig | null>(null);
  const [siteConfigLoaded, setSiteConfigLoaded] = useState(false);

  const [coversMap, setCoversMap] = useState<Partial<Record<CategoryId, CategoryCover>>>({});
  const [serviceDocs, setServiceDocs] = useState<CatalogServiceDoc[]>([]);
  const [galleryDocs, setGalleryDocs] = useState<SpaGalleryPhoto[]>([]);
  const [collectionsLoaded, setCollectionsLoaded] = useState({
    covers: false,
    services: false,
    gallery: false,
  });

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdminDoc, setIsAdminDoc] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const captureSnapshotError = useCallback(
    (err: unknown, operationType: OperationType, path: string) => {
      try {
        handleFirestoreError(err, operationType, path);
      } catch (wrapped) {
        setFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    },
    []
  );

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser && nextUser.emailVerified) {
        if (nextUser.email === ADMIN_EMAIL) {
          setIsAdminDoc(true);
        } else {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
            setIsAdminDoc(adminSnap.exists());
          } catch {
            setIsAdminDoc(false);
          }
        }
      } else {
        setIsAdminDoc(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Firestore real-time listeners
  useEffect(() => {
    const unsubSiteConfig = onSnapshot(
      doc(db, 'siteConfig', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSiteConfigDoc({
            heroImageUrl: typeof data.heroImageUrl === 'string' ? data.heroImageUrl : '',
            heroImageAlt: typeof data.heroImageAlt === 'string' ? data.heroImageAlt : '',
            heroImageCaption:
              typeof data.heroImageCaption === 'string' ? data.heroImageCaption : '',
            catalogSeeded: Boolean(data.catalogSeeded),
          });
        } else {
          setSiteConfigDoc(null);
        }
        setSiteConfigLoaded(true);
      },
      (err) => captureSnapshotError(err, OperationType.GET, 'siteConfig/main')
    );

    const unsubCovers = onSnapshot(
      collection(db, 'categoryCovers'),
      (snap) => {
        const next: Partial<Record<CategoryId, CategoryCover>> = {};
        snap.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const catId = docSnap.id as CategoryId;
          next[catId] = {
            categoryId: catId,
            imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : '',
            imageAlt: typeof data.imageAlt === 'string' ? data.imageAlt : '',
          };
        });
        setCoversMap(next);
        setCollectionsLoaded((prev) => ({ ...prev, covers: true }));
      },
      (err) => captureSnapshotError(err, OperationType.LIST, 'categoryCovers')
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('sortOrder', 'asc')),
      (snap) => {
        const rows: CatalogServiceDoc[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            categoryId: d.categoryId as ServiceCategoryId,
            name: typeof d.name === 'string' ? d.name : '',
            tagalogSubtitle:
              typeof d.tagalogSubtitle === 'string' ? d.tagalogSubtitle : undefined,
            price: typeof d.price === 'number' ? d.price : 0,
            durationMinutes:
              typeof d.durationMinutes === 'number' ? d.durationMinutes : 0,
            durationLabel: typeof d.durationLabel === 'string' ? d.durationLabel : '',
            description: typeof d.description === 'string' ? d.description : '',
            includes: Array.isArray(d.includes) ? d.includes : undefined,
            hasUnlimitedWetArea:
              typeof d.hasUnlimitedWetArea === 'boolean'
                ? d.hasUnlimitedWetArea
                : undefined,
            addOnATitle:
              typeof d.addOnATitle === 'string' ? d.addOnATitle : undefined,
            addOnAOptions: Array.isArray(d.addOnAOptions) ? d.addOnAOptions : undefined,
            addOnBTitle:
              typeof d.addOnBTitle === 'string' ? d.addOnBTitle : undefined,
            addOnBOptions: Array.isArray(d.addOnBOptions) ? d.addOnBOptions : undefined,
            homeRates: Array.isArray(d.homeRates) ? d.homeRates : undefined,
            sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0,
          };
        });
        setServiceDocs(rows);
        setCollectionsLoaded((prev) => ({ ...prev, services: true }));
      },
      (err) => captureSnapshotError(err, OperationType.LIST, 'services')
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'spaGallery'), orderBy('sortOrder', 'asc')),
      (snap) => {
        const rows: SpaGalleryPhoto[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            title: typeof d.title === 'string' ? d.title : '',
            caption: typeof d.caption === 'string' ? d.caption : '',
            imageUrl: typeof d.imageUrl === 'string' ? d.imageUrl : '',
            sortOrder: typeof d.sortOrder === 'number' ? d.sortOrder : 0,
          };
        });
        setGalleryDocs(rows);
        setCollectionsLoaded((prev) => ({ ...prev, gallery: true }));
      },
      (err) => captureSnapshotError(err, OperationType.LIST, 'spaGallery')
    );

    return () => {
      unsubSiteConfig();
      unsubCovers();
      unsubServices();
      unsubGallery();
    };
  }, [captureSnapshotError]);

  if (fatalError) {
    throw fatalError;
  }

  const loadingCatalog =
    !siteConfigLoaded ||
    !collectionsLoaded.covers ||
    !collectionsLoaded.services ||
    !collectionsLoaded.gallery;

  const catalogSeeded = Boolean(siteConfigDoc?.catalogSeeded);
  const hasAnyFirestoreData =
    Boolean(siteConfigDoc) ||
    Object.keys(coversMap).length > 0 ||
    serviceDocs.length > 0 ||
    galleryDocs.length > 0;

  const isAdmin = Boolean(
    user?.emailVerified && (user.email === ADMIN_EMAIL || isAdminDoc)
  );

  // Never flash mock images while loading or overwrite user changes once Firestore has any data
  const effectiveSiteConfig = useMemo<SiteConfig>(() => {
    if (loadingCatalog) return EMPTY_SITE_CONFIG;
    return siteConfigDoc ?? EMPTY_SITE_CONFIG;
  }, [loadingCatalog, siteConfigDoc]);

  const effectiveCovers = useMemo<Partial<Record<CategoryId, CategoryCover>>>(() => {
    if (loadingCatalog) return {};
    return coversMap;
  }, [loadingCatalog, coversMap]);

  const effectiveServiceDocs = useMemo<CatalogServiceDoc[]>(() => {
    if (loadingCatalog) return [];
    if (catalogSeeded || hasAnyFirestoreData) {
      return serviceDocs;
    }
    return DEFAULT_CATALOG_SERVICES;
  }, [loadingCatalog, catalogSeeded, hasAnyFirestoreData, serviceDocs]);

  const effectiveGallery = useMemo<SpaGalleryPhoto[]>(() => {
    if (loadingCatalog) return [];
    return galleryDocs;
  }, [loadingCatalog, galleryDocs]);

  const massageServices = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'massages')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const signatureComboServices = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'combos')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const exclusiveComboOffers = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'exclusive')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const promoPackages = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'promos')
        .map(docToPromoPackage),
    [effectiveServiceDocs]
  );

  const wetAreaServices = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'wet-area')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const acupunctureServices = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'acupuncture')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const waxingServices = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'waxing')
        .map(docToSimpleService),
    [effectiveServiceDocs]
  );

  const homeServiceTiers = useMemo(
    () =>
      effectiveServiceDocs
        .filter((d) => d.categoryId === 'home-service')
        .map(docToHomeServiceTier),
    [effectiveServiceDocs]
  );

  // Dynamically compute live category card counts, price ranges, and cover photos
  const categoryCards = useMemo<CategoryRoute[]>(() => {
    return CATEGORY_ROUTES.map((cat) => {
      const cover = effectiveCovers[cat.id];
      const hasCoverUrl = Boolean(cover && cover.imageUrl.trim().length > 0);
      const image = hasCoverUrl ? cover!.imageUrl.trim() : undefined;
      const imageAlt = hasCoverUrl ? cover!.imageAlt || cat.label : undefined;

      const items = effectiveServiceDocs.filter((s) => s.categoryId === cat.id);
      if (items.length === 0) {
        return {
          ...cat,
          image,
          imageAlt,
          itemCountLabel: loadingCatalog ? cat.itemCountLabel : '0 Items',
          rateRange: loadingCatalog ? cat.rateRange : 'Contact Spa',
        };
      }

      if (cat.id === 'home-service') {
        const prices = items.flatMap((tier) =>
          tier.homeRates && tier.homeRates.length > 0
            ? tier.homeRates.map((r) => r.price)
            : [tier.price]
        );
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        return {
          ...cat,
          image,
          imageAlt,
          itemCountLabel: `${items.length} ${items.length === 1 ? 'Radius Tier' : 'Radius Tiers'}`,
          rateRange:
            min === max
              ? `${formatPeso(min)} + Transpo`
              : `${formatPeso(min)} – ${formatPeso(max)} + Transpo`,
        };
      }

      const prices = items.map((i) => i.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const unitMap: Record<Exclude<CategoryId, 'home-service'>, [string, string]> = {
        massages: ['Treatment', 'Treatments'],
        combos: ['Pairing', 'Pairings'],
        promos: ['Package', 'Packages'],
        'wet-area': ['Ritual', 'Rituals'],
        acupuncture: ['Therapy', 'Therapies'],
        waxing: ['Area', 'Areas'],
      };
      const [singular, plural] = unitMap[cat.id];

      return {
        ...cat,
        image,
        imageAlt,
        itemCountLabel: `${items.length} ${items.length === 1 ? singular : plural}`,
        rateRange: min === max ? formatPeso(min) : `${formatPeso(min)} – ${formatPeso(max)}`,
      };
    });
  }, [effectiveCovers, effectiveServiceDocs, loadingCatalog]);

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider);
  }, []);

  const signOutUser = useCallback(async () => {
    await signOut(auth);
  }, []);

  const ensureSiteConfigInitialized = useCallback(async () => {
    const configRef = doc(db, 'siteConfig', 'main');
    const existing = await getDoc(configRef);
    if (!existing.exists()) {
      await setDoc(configRef, {
        heroImageUrl: '',
        heroImageAlt: '',
        heroImageCaption: '',
        catalogSeeded: true,
        updatedAt: serverTimestamp(),
      });
      return;
    }
    const data = existing.data();
    if (!data?.catalogSeeded) {
      await setDoc(configRef, {
        heroImageUrl: typeof data?.heroImageUrl === 'string' ? data.heroImageUrl : '',
        heroImageAlt: typeof data?.heroImageAlt === 'string' ? data.heroImageAlt : '',
        heroImageCaption:
          typeof data?.heroImageCaption === 'string' ? data.heroImageCaption : '',
        catalogSeeded: true,
        updatedAt: serverTimestamp(),
      });
    }
  }, []);

  // Safely initialize ONLY missing service records when DB is brand new;
  // NEVER overwrite existing siteConfig, categoryCovers, spaGallery, or services.
  const seedDatabaseIfNeeded = useCallback(async (): Promise<boolean> => {
    if (!isAdmin) return false;
    const configRef = doc(db, 'siteConfig', 'main');
    try {
      const [existingConfig, existingServices] = await Promise.all([
        getDoc(configRef),
        getDocs(collection(db, 'services')),
      ]);

      if (existingConfig.exists() && existingConfig.data()?.catalogSeeded) {
        return false;
      }

      setSeeding(true);
      const batch = writeBatch(db);
      let hasWrites = false;

      if (!existingConfig.exists()) {
        batch.set(configRef, {
          heroImageUrl: '',
          heroImageAlt: '',
          heroImageCaption: '',
          catalogSeeded: true,
          updatedAt: serverTimestamp(),
        });
        hasWrites = true;
      } else {
        const prev = existingConfig.data();
        batch.set(configRef, {
          heroImageUrl: typeof prev?.heroImageUrl === 'string' ? prev.heroImageUrl : '',
          heroImageAlt: typeof prev?.heroImageAlt === 'string' ? prev.heroImageAlt : '',
          heroImageCaption:
            typeof prev?.heroImageCaption === 'string' ? prev.heroImageCaption : '',
          catalogSeeded: true,
          updatedAt: serverTimestamp(),
        });
        hasWrites = true;
      }

      // Only seed default services if the services collection is completely empty
      if (existingServices.empty && !existingConfig.exists()) {
        DEFAULT_CATALOG_SERVICES.forEach((svc) => {
          const payload: Record<string, unknown> = {
            categoryId: svc.categoryId,
            name: clampString(svc.name, 160),
            price: clampNumber(svc.price, 0, 1000000),
            durationMinutes: clampNumber(svc.durationMinutes, 0, 1440),
            durationLabel: clampString(svc.durationLabel, 120),
            description: clampString(svc.description, 600),
            sortOrder: clampNumber(svc.sortOrder, 0, 10000),
            updatedAt: serverTimestamp(),
          };
          if (svc.tagalogSubtitle) {
            payload.tagalogSubtitle = clampString(svc.tagalogSubtitle, 160);
          }
          if (svc.includes) payload.includes = svc.includes.slice(0, 10);
          if (typeof svc.hasUnlimitedWetArea === 'boolean') {
            payload.hasUnlimitedWetArea = svc.hasUnlimitedWetArea;
          }
          if (svc.addOnATitle) payload.addOnATitle = clampString(svc.addOnATitle, 120);
          if (svc.addOnAOptions) payload.addOnAOptions = svc.addOnAOptions.slice(0, 10);
          if (svc.addOnBTitle) payload.addOnBTitle = clampString(svc.addOnBTitle, 120);
          if (svc.addOnBOptions) payload.addOnBOptions = svc.addOnBOptions.slice(0, 10);
          if (svc.homeRates) payload.homeRates = svc.homeRates.slice(0, 6);

          batch.set(doc(db, 'services', svc.id), payload);
          hasWrites = true;
        });
      }

      if (hasWrites) {
        await batch.commit();
      }
      return hasWrites;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'siteConfig/main');
    } finally {
      setSeeding(false);
    }
  }, [isAdmin]);

  const saveSiteConfig = useCallback(
    async (next: Omit<SiteConfig, 'catalogSeeded'> & { catalogSeeded?: boolean }) => {
      try {
        await setDoc(doc(db, 'siteConfig', 'main'), {
          heroImageUrl: clampString(next.heroImageUrl, 2048),
          heroImageAlt: clampString(next.heroImageAlt, 300),
          heroImageCaption: clampString(next.heroImageCaption, 300),
          catalogSeeded: next.catalogSeeded ?? true,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, 'siteConfig/main');
      }
    },
    []
  );

  const saveCategoryCover = useCallback(
    async (categoryId: CategoryId, imageUrl: string, imageAlt: string) => {
      const cleanedUrl = clampString(imageUrl, 2048);
      try {
        await ensureSiteConfigInitialized();
        if (!cleanedUrl) {
          await deleteDoc(doc(db, 'categoryCovers', categoryId));
          return;
        }
        await setDoc(doc(db, 'categoryCovers', categoryId), {
          categoryId,
          imageUrl: cleanedUrl,
          imageAlt: clampString(imageAlt, 300),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.WRITE,
          `categoryCovers/${categoryId}`
        );
      }
    },
    [ensureSiteConfigInitialized]
  );

  const deleteCategoryCover = useCallback(
    async (categoryId: CategoryId) => {
      try {
        await ensureSiteConfigInitialized();
        await deleteDoc(doc(db, 'categoryCovers', categoryId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `categoryCovers/${categoryId}`);
      }
    },
    [ensureSiteConfigInitialized]
  );

  const saveService = useCallback(
    async (service: CatalogServiceDoc) => {
      const id = service.id || sanitizeDocId(service.categoryId, service.name);
      const payload: Record<string, unknown> = {
        categoryId: service.categoryId,
        name: clampString(service.name, 160),
        price: clampNumber(service.price, 0, 1000000),
        durationMinutes: clampNumber(service.durationMinutes, 0, 1440),
        durationLabel: clampString(service.durationLabel, 120),
        description: clampString(service.description, 600),
        sortOrder: clampNumber(service.sortOrder, 0, 10000),
        updatedAt: serverTimestamp(),
      };
      if (service.tagalogSubtitle && service.tagalogSubtitle.trim()) {
        payload.tagalogSubtitle = clampString(service.tagalogSubtitle, 160);
      }
      if (service.includes && service.includes.length > 0) {
        payload.includes = service.includes
          .map((line) => clampString(line, 160))
          .filter(Boolean)
          .slice(0, 10);
      }
      if (typeof service.hasUnlimitedWetArea === 'boolean') {
        payload.hasUnlimitedWetArea = service.hasUnlimitedWetArea;
      }
      if (service.addOnATitle && service.addOnATitle.trim()) {
        payload.addOnATitle = clampString(service.addOnATitle, 120);
      }
      if (service.addOnAOptions && service.addOnAOptions.length > 0) {
        payload.addOnAOptions = service.addOnAOptions.slice(0, 10).map((opt, idx) => ({
          id: opt.id || `opt-a-${idx + 1}`,
          label: clampString(opt.label, 100),
          minutes: clampNumber(opt.minutes, 0, 360),
        }));
      }
      if (service.addOnBTitle && service.addOnBTitle.trim()) {
        payload.addOnBTitle = clampString(service.addOnBTitle, 120);
      }
      if (service.addOnBOptions && service.addOnBOptions.length > 0) {
        payload.addOnBOptions = service.addOnBOptions.slice(0, 10).map((opt, idx) => ({
          id: opt.id || `opt-b-${idx + 1}`,
          label: clampString(opt.label, 100),
          minutes: clampNumber(opt.minutes, 0, 360),
        }));
      }
      if (service.homeRates && service.homeRates.length > 0) {
        payload.homeRates = service.homeRates.slice(0, 6).map((rate, idx) => ({
          id: rate.id || `${id}-rate-${idx + 1}`,
          durationLabel: clampString(rate.durationLabel, 80),
          durationMinutes: clampNumber(rate.durationMinutes, 15, 600),
          price: clampNumber(rate.price, 0, 1000000),
        }));
      }

      try {
        await ensureSiteConfigInitialized();
        await setDoc(doc(db, 'services', id), payload);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `services/${id}`);
      }
    },
    [ensureSiteConfigInitialized]
  );

  const deleteService = useCallback(
    async (serviceId: string) => {
      try {
        await ensureSiteConfigInitialized();
        await deleteDoc(doc(db, 'services', serviceId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `services/${serviceId}`);
      }
    },
    [ensureSiteConfigInitialized]
  );

  const saveGalleryPhoto = useCallback(
    async (photo: SpaGalleryPhoto) => {
      const id = photo.id || sanitizeDocId('gallery', photo.title);
      try {
        await ensureSiteConfigInitialized();
        await setDoc(doc(db, 'spaGallery', id), {
          title: clampString(photo.title, 100),
          caption: clampString(photo.caption, 240),
          imageUrl: clampString(photo.imageUrl, 2048),
          sortOrder: clampNumber(photo.sortOrder, 0, 1000),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `spaGallery/${id}`);
      }
    },
    [ensureSiteConfigInitialized]
  );

  const deleteGalleryPhoto = useCallback(
    async (photoId: string) => {
      try {
        await ensureSiteConfigInitialized();
        await deleteDoc(doc(db, 'spaGallery', photoId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `spaGallery/${photoId}`);
      }
    },
    [ensureSiteConfigInitialized]
  );

  const value: CatalogContextValue = {
    siteConfig: effectiveSiteConfig,
    catalogSeeded,
    loadingCatalog,
    seeding,
    categoryCovers: effectiveCovers,
    categoryCards,
    allServiceDocs: effectiveServiceDocs,
    massageServices,
    signatureComboServices,
    exclusiveComboOffers,
    promoPackages,
    wetAreaServices,
    acupunctureServices,
    waxingServices,
    homeServiceTiers,
    spaGallery: effectiveGallery,
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
  };

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext);
  if (!ctx) {
    throw new Error('useCatalog must be used inside a CatalogProvider');
  }
  return ctx;
}
