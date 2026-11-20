import type { HomeServiceTier, PromoPackage, SimpleService } from '../types/booking';

export const BUSINESS_INFO = {
  name: 'Apros Wellness Spa',
  branch: 'Apros Wellness Spa – Pasig Branch',
  address: '2nd Floor, JML Bldg. 3 Octagon Dela Paz, Pasig City',
  phoneDisplay: '0962-772-1031',
  phoneHref: 'tel:+639627721031',
  smsHref: 'sms:+639627721031',
  viberHref: 'viber://chat?number=%2B639627721031',
  mapsUrl: 'https://maps.app.goo.gl/oUof1W82HqwycTzV7',
  facebookUrl: 'https://web.facebook.com/profile.php?id=61578926788972',
  messengerUrl: 'https://m.me/61578926788972',
  instagramUrl: 'https://www.instagram.com/apros.wellness?lqvp=NWt0Y28zNmlpZW54&utm_source=qr',
  xUrl: 'https://x.com/apros_spa?s=11',
} as const;

export type CategoryId =
  | 'massages'
  | 'combos'
  | 'promos'
  | 'wet-area'
  | 'acupuncture'
  | 'waxing'
  | 'home-service';

export interface CategoryRoute {
  id: CategoryId;
  path: string;
  number: string;
  label: string;
  shortLabel: string;
  tagline: string;
  rateRange: string;
  itemCountLabel: string;
  image?: string;
  imageAlt?: string;
  seoTitle: string;
  seoDescription: string;
}

export const HOME_SEO = {
  title: 'Apros Wellness Spa — Filipino Massage & Hilot in Pasig',
  description:
    'Traditional Hilot, Himlay signature massages, Moroccan hammam, acupuncture, waxing, and outcall spa service in Dela Paz, Pasig City.',
} as const;

export const CATEGORY_ROUTES: CategoryRoute[] = [
  {
    id: 'massages',
    path: '/massages',
    number: '01',
    label: 'Massages',
    shortLabel: 'Massages',
    tagline: 'Liknayan, Himlay, Saligan Hilot, Ugat & Kalinga bodywork.',
    rateRange: '₱600 – ₱1,200',
    itemCountLabel: '5 Treatments',
    seoTitle: 'Massages in Pasig | Apros Wellness Spa',
    seoDescription:
      'Explore Liknayan, Himlay, Saligan Hilot, Ugat therapeutic, and Kalinga slow-touch Filipino massages in Pasig starting at ₱600.',
  },
  {
    id: 'combos',
    path: '/combo',
    number: '02',
    label: 'Signature Combos',
    shortLabel: 'Combos',
    tagline: '80–85 min Himlay pairings with stone, ventosa, herbal ball, or scrub.',
    rateRange: '₱800 – ₱1,100',
    itemCountLabel: '7 Pairings',
    seoTitle: 'Signature Combos | Apros Wellness Spa Pasig',
    seoDescription:
      'Pair our Himlay signature massage with hot stones, ventosa cupping, Thai herbal compress, body scrub, or foot spa from ₱800.',
  },
  {
    id: 'promos',
    path: '/promo',
    number: '03',
    label: 'Promos',
    shortLabel: 'Promos',
    tagline: 'Packages A–D pairing 60-min Himlay massage, sauna, steam & add-ons.',
    rateRange: '₱1,299 – ₱1,799',
    itemCountLabel: '4 Packages',
    seoTitle: 'Customizable Spa Promos | Apros Wellness Spa',
    seoDescription:
      'Save with customizable Promo Packages A–D combining 60-min Himlay massage, wet area access, and your choice of spa add-ons.',
  },
  {
    id: 'wet-area',
    path: '/wet-area',
    number: '04',
    label: 'Wet Area & Hammam',
    shortLabel: 'Wet Area',
    tagline: 'Dry sauna, steam chamber, private suite & Moroccan/Turkish hammam.',
    rateRange: '₱500 – ₱1,200',
    itemCountLabel: '3 Rituals',
    seoTitle: 'Wet Area & Moroccan Hammam | Apros Wellness Spa',
    seoDescription:
      'Unwind in our dry sauna, steam chamber, private sauna suite, and authentic Moroccan and Turkish hammam steam bath in Pasig City.',
  },
  {
    id: 'acupuncture',
    path: '/acupuncture',
    number: '05',
    label: 'Acupuncture',
    shortLabel: 'Acupuncture',
    tagline: 'Medical acupuncture, Dorn alignment, cosmetic care, moxa & bone setting.',
    rateRange: '₱1,500 – ₱2,500',
    itemCountLabel: '5 Therapies',
    seoTitle: 'Acupuncture & Bone Setting | Apros Wellness Spa',
    seoDescription:
      'Clinical medical acupuncture, Dorn spinal alignment, cosmetic acupuncture, laser moxabustion, and bone setting in Dela Paz, Pasig.',
  },
  {
    id: 'waxing',
    path: '/waxing',
    number: '06',
    label: 'Waxing',
    shortLabel: 'Waxing',
    tagline: 'Private warm-wax grooming for underarms, legs, chest & Brazilian.',
    rateRange: '₱300 – ₱1,000',
    itemCountLabel: '6 Areas',
    seoTitle: 'Warm Waxing Services | Apros Wellness Spa Pasig',
    seoDescription:
      'Hygienic, private warm-wax grooming for underarms, legs, chest, and Brazilian care finished with soothing oil from ₱300.',
  },
  {
    id: 'home-service',
    path: '/outcall',
    number: '07',
    label: 'Home & Hotel Service',
    shortLabel: 'Outcall',
    tagline: 'Licensed therapists dispatched from Pasig across 10–20 km Metro Manila zones.',
    rateRange: '₱1,200 – ₱1,900 + Transpo',
    itemCountLabel: '3 Radius Tiers',
    seoTitle: 'Home & Hotel Outcall Massage | Apros Wellness Spa',
    seoDescription:
      'Licensed therapists travel from Dela Paz, Pasig to your home or Metro Manila hotel for 1.5-hour or 2-hour bodywork sessions.',
  },
];

export const MENU_CATEGORIES = CATEGORY_ROUTES;

export function normalizeRoutePath(pathname: string): string {
  const cleaned = pathname.trim().toLowerCase().replace(/\/+$/, '');
  return cleaned === '' ? '/' : cleaned;
}

export function getCategoryByPath(pathname: string): CategoryRoute | null {
  const normalized = normalizeRoutePath(pathname);
  return CATEGORY_ROUTES.find((cat) => cat.path === normalized) ?? null;
}

export function getCategoryById(id: CategoryId): CategoryRoute {
  return CATEGORY_ROUTES.find((cat) => cat.id === id) ?? CATEGORY_ROUTES[0];
}

export const LOGO_URL = '/assets/aistudio/98227924-6D66-4D54-8E9F-5E52DB81AE8C_2013ca7d.JPEG';

export const MASSAGE_SERVICES: SimpleService[] = [
  {
    id: 'massage-liknayan',
    name: 'Apros “Liknayan” Flow Massage',
    price: 600,
    durationMinutes: 60,
    durationLabel: '60 minutes',
    description: 'Continuous, rhythmic strokes designed to ease everyday stiffness and restore circulation.',
  },
  {
    id: 'massage-himlay',
    name: 'Apros “Himlay” Signature Massage',
    price: 1000,
    durationMinutes: 90,
    durationLabel: '90 minutes',
    description: 'Our full-body signature session combining slow palm pressure and deep muscle release.',
  },
  {
    id: 'massage-saligan',
    name: 'Apros “Saligan” Hilot Massage',
    price: 700,
    durationMinutes: 60,
    durationLabel: '60 minutes',
    description: 'Traditional Filipino healing bodywork targeting deep-seated knots and cold spots (lamig).',
  },
  {
    id: 'massage-ugat',
    name: 'Apros “Ugat” Therapeutic Massage',
    price: 700,
    durationMinutes: 60,
    durationLabel: '60 minutes',
    description: 'Focused, firm pressure directed along tired muscle fibers and joint tension.',
  },
  {
    id: 'massage-kalinga',
    name: 'Apros “Kalinga” Slow Touch Massage',
    price: 1200,
    durationMinutes: 90,
    durationLabel: '90 minutes',
    description: 'Unhurried, deeply calming full-body strokes built for complete physical stillness.',
  },
];

export const SIGNATURE_COMBO_SERVICES: SimpleService[] = [
  {
    id: 'combo-himlay-init',
    name: 'Apros “Himlay Init”',
    tagalogSubtitle: 'Signature Massage & Hot Stone',
    price: 900,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Heated basalt stones placed along the spine and shoulders to soften stubborn tension before slow palm work.',
  },
  {
    id: 'combo-himlay-salok',
    name: 'Apros “Himlay Salok”',
    tagalogSubtitle: 'Signature Massage & Ventosa',
    price: 800,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Traditional glass cupping draws out deep muscular tightness and trapped cold along the back.',
  },
  {
    id: 'combo-himlay-hiwaga',
    name: 'Apros “Himlay Hiwaga”',
    tagalogSubtitle: 'Signature Massage & Facial Mask',
    price: 800,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Full-body signature bodywork paired with a cooling facial mask for quiet skin hydration.',
  },
  {
    id: 'combo-himlay-alpas',
    name: 'Apros “Himlay Alpas”',
    tagalogSubtitle: 'Signature Massage & Ear Candling',
    price: 800,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Slow signature strokes finished with gentle ear candling to ease head and sinus pressure.',
  },
  {
    id: 'combo-himlay-lunas',
    name: 'Apros “Himlay Lunas”',
    tagalogSubtitle: 'Signature Massage & Thai Herbal Compress Ball',
    price: 1100,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Steamed cotton poultice packed with aromatic roots pressed rhythmically over aching joints.',
  },
  {
    id: 'combo-himlay-hiyas',
    name: 'Apros “Himlay Hiyas”',
    tagalogSubtitle: 'Signature Massage & Body Scrub',
    price: 1100,
    durationMinutes: 85,
    durationLabel: '85 minutes',
    description: 'Fine exfoliating polish followed by unhurried signature oil bodywork for supple skin.',
  },
  {
    id: 'combo-himlay-yapak',
    name: 'Apros “Himlay Yapak”',
    tagalogSubtitle: 'Signature Massage & Foot Spa',
    price: 1100,
    durationMinutes: 80,
    durationLabel: '80 minutes',
    description: 'Full-body tension release paired with a warm foot soak and restorative lower-leg work.',
  },
];

export const EXCLUSIVE_COMBO_OFFERS: SimpleService[] = [
  {
    id: 'exclusive-60-wet',
    name: '60 Minutes Signature Massage with Unlimited Wet Area Access',
    price: 1100,
    durationMinutes: 60,
    durationLabel: '60 min massage + Unlimited Wet Area',
    description: 'One hour of Himlay signature bodywork paired with unhurried access to our sauna, steam room, and warm showers.',
  },
  {
    id: 'exclusive-90-wet',
    name: '90 Minutes Signature Massage with Unlimited Wet Area Access',
    price: 1300,
    durationMinutes: 90,
    durationLabel: '90 min massage + Unlimited Wet Area',
    description: 'Ninety minutes of full-body recovery complemented by unlimited steam, sauna, and shower use.',
  },
];

export const PROMO_PACKAGES: PromoPackage[] = [
  {
    id: 'promo-package-a',
    name: 'Package A',
    price: 1299,
    baseDurationMinutes: 60,
    includes: ['60 min Apros “Himlay” Signature Massage'],
    hasUnlimitedWetArea: false,
    addOnAGroup: {
      title: 'Add On A (Pick One)',
      options: [
        { id: 'body-scrub-25', label: '25 min Body Scrub', minutes: 25 },
        { id: 'foot-spa-25', label: '25 min Foot Spa', minutes: 25 },
      ],
    },
    addOnBGroup: {
      title: 'Add On B (Pick One)',
      options: [
        { id: 'hotstone-20', label: '20 min Hotstone', minutes: 20 },
        { id: 'ventosa-20', label: '20 min Ventosa', minutes: 20 },
        { id: 'ear-candling-15', label: '15 min Ear Candling', minutes: 15 },
        { id: 'facial-mask-15', label: '15 min Facial Mask', minutes: 15 },
      ],
    },
  },
  {
    id: 'promo-package-b',
    name: 'Package B',
    price: 1399,
    baseDurationMinutes: 60,
    includes: [
      '60 min Apros “Himlay” Signature Massage',
      'Unlimited Sauna, Steam & Shower Access',
    ],
    hasUnlimitedWetArea: true,
    addOnAGroup: {
      title: 'Add On A (Pick One)',
      options: [
        { id: 'hotstone-20', label: '20 min Hotstone', minutes: 20 },
        { id: 'ventosa-20', label: '20 min Ventosa', minutes: 20 },
        { id: 'ear-candling-15', label: '15 min Ear Candling', minutes: 15 },
        { id: 'facial-mask-15', label: '15 min Facial Mask', minutes: 15 },
      ],
    },
  },
  {
    id: 'promo-package-c',
    name: 'Package C',
    price: 1599,
    baseDurationMinutes: 60,
    includes: [
      '60 min Apros “Himlay” Signature Massage',
      'Unlimited Sauna, Steam & Shower Access',
    ],
    hasUnlimitedWetArea: true,
    addOnAGroup: {
      title: 'Add On A (Pick One)',
      options: [
        { id: 'body-scrub-25', label: '25 min Body Scrub', minutes: 25 },
        { id: 'foot-spa-25', label: '25 min Foot Spa', minutes: 25 },
        { id: 'thai-herbal-20', label: '20 min Thai Herbal Ball', minutes: 20 },
      ],
    },
  },
  {
    id: 'promo-package-d',
    name: 'Package D',
    price: 1799,
    baseDurationMinutes: 60,
    includes: [
      '60 min Apros “Himlay” Signature Massage',
      'Unlimited Sauna, Steam & Shower Access',
    ],
    hasUnlimitedWetArea: true,
    addOnAGroup: {
      title: 'Add On A (Pick One)',
      options: [
        { id: 'body-scrub-25', label: '25 min Body Scrub', minutes: 25 },
        { id: 'foot-spa-25', label: '25 min Foot Spa', minutes: 25 },
      ],
    },
    addOnBGroup: {
      title: 'Add On B (Pick One)',
      options: [
        { id: 'hotstone-20', label: '20 min Hotstone', minutes: 20 },
        { id: 'ventosa-20', label: '20 min Ventosa', minutes: 20 },
        { id: 'ear-candling-15', label: '15 min Ear Candling', minutes: 15 },
        { id: 'facial-mask-15', label: '15 min Facial Mask', minutes: 15 },
      ],
    },
  },
];

export const WET_AREA_SERVICES: SimpleService[] = [
  {
    id: 'wet-steam-sauna-shower',
    name: 'Steam - Sauna - Shower',
    price: 600,
    durationMinutes: null,
    durationLabel: 'Wet Area Access',
    description: 'Open access to the heated dry sauna, aromatic steam chamber, and hot-to-cool rinse showers.',
  },
  {
    id: 'wet-private-sauna-shower',
    name: 'Private Sauna - Shower',
    price: 500,
    durationMinutes: null,
    durationLabel: 'Private Session',
    description: 'Quiet, private sauna suite paired with an en-suite shower for uninterrupted heat therapy.',
  },
  {
    id: 'wet-hammam',
    name: 'Moroccan / Turkish Hammam with Steam Bath',
    price: 1200,
    durationMinutes: null,
    durationLabel: 'Bath & Steam Ritual',
    description: 'Traditional warm stone steam bath and deep cleansing rinse rooted in North African and Anatolian bathhouse practice.',
  },
];

export const ACUPUNCTURE_SERVICES: SimpleService[] = [
  {
    id: 'acu-medical',
    name: 'Medical Acupuncture',
    price: 1500,
    durationMinutes: null,
    durationLabel: 'Clinical Session',
    description: 'Targeted meridian point placement to relieve chronic musculoskeletal aches, nerve fatigue, and migraine tension.',
  },
  {
    id: 'acu-dorn',
    name: 'Acupuncture with Dorn Method Therapy',
    price: 2500,
    durationMinutes: null,
    durationLabel: 'Combined Therapy',
    description: 'Fine acupuncture paired with gentle, non-manipulative Dorn spinal and joint alignment.',
  },
  {
    id: 'acu-cosmetic',
    name: 'Cosmetic Acupuncture',
    price: 2500,
    durationMinutes: null,
    durationLabel: 'Facial Session',
    description: 'Delicate facial point stimulation encouraging local circulation, natural tone, and jaw relaxation.',
  },
  {
    id: 'acu-laser-moxa',
    name: 'Laser Acupuncture with Moxabustion',
    price: 1500,
    durationMinutes: null,
    durationLabel: 'Thermal & Light Therapy',
    description: 'Needle-free low-level laser stimulation combined with warming mugwort moxa over cold or stagnant points.',
  },
  {
    id: 'acu-bone-setting',
    name: 'Bone Setting Therapy',
    price: 1500,
    durationMinutes: null,
    durationLabel: 'Structural Adjustment',
    description: 'Manual realignment of stiff joints, shoulders, and posture-strained hips to restore easy range of motion.',
  },
];

export const WAXING_SERVICES: SimpleService[] = [
  {
    id: 'wax-underarm',
    name: 'Underarm',
    price: 300,
    durationMinutes: null,
    durationLabel: 'Single Area',
    description: 'Gentle warm wax removal with soothing post-treatment oil.',
  },
  {
    id: 'wax-legs-knee',
    name: 'Legs (knee down)',
    price: 600,
    durationMinutes: null,
    durationLabel: 'Lower Legs',
    description: 'Clean lower-leg waxing from knee to ankle.',
  },
  {
    id: 'wax-bum',
    name: 'Bum',
    price: 600,
    durationMinutes: null,
    durationLabel: 'Single Area',
    description: 'Careful, hygienic waxing performed in a private treatment room.',
  },
  {
    id: 'wax-chest',
    name: 'Chest',
    price: 700,
    durationMinutes: null,
    durationLabel: 'Upper Torso',
    description: 'Smooth full-chest waxing finished with calming aloe gel.',
  },
  {
    id: 'wax-brazilian',
    name: 'Brazilian',
    price: 800,
    durationMinutes: null,
    durationLabel: 'Full Intimate',
    description: 'Thorough, gentle intimate waxing by trained specialists.',
  },
  {
    id: 'wax-legs-thigh-groin',
    name: 'Legs, Thigh, Groin',
    price: 1000,
    durationMinutes: null,
    durationLabel: 'Full Lower Body',
    description: 'Complete lower-body waxing covering full legs, thighs, and groin line.',
  },
];

export const HOME_SERVICE_TIERS: HomeServiceTier[] = [
  {
    id: 'radius-10',
    radiusLabel: 'Within 10 km Radius',
    distanceNote: 'Pasig core, Ortigas, Capitol Commons, Kapitolyo, and nearby Mandaluyong / Cainta.',
    rates: [
      {
        id: 'home-10km-90',
        durationLabel: '1.5 Hours Massage',
        durationMinutes: 90,
        price: 1200,
      },
      {
        id: 'home-10km-120',
        durationLabel: '2 Hours Massage',
        durationMinutes: 120,
        price: 1500,
      },
    ],
  },
  {
    id: 'radius-10-15',
    radiusLabel: 'Within 10 to 15 km Radius',
    distanceNote: 'BGC, Makati CBD, Eastwood, Marikina, and San Juan corridors.',
    rates: [
      {
        id: 'home-15km-90',
        durationLabel: '1.5 Hours Massage',
        durationMinutes: 90,
        price: 1400,
      },
      {
        id: 'home-15km-120',
        durationLabel: '2 Hours Massage',
        durationMinutes: 120,
        price: 1700,
      },
    ],
  },
  {
    id: 'radius-15-20',
    radiusLabel: 'Within 15 to 20 km Radius',
    distanceNote: 'Quezon City, Ermita/Malate, Pasay Bay Area, and southern Metro Manila hotels.',
    rates: [
      {
        id: 'home-20km-90',
        durationLabel: '1.5 Hours Massage',
        durationMinutes: 90,
        price: 1600,
      },
      {
        id: 'home-20km-120',
        durationLabel: '2 Hours Massage',
        durationMinutes: 120,
        price: 1900,
      },
    ],
  },
];

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString('en-PH')}`;
}
