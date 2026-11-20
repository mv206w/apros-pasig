export interface TrayItem {
  id: string;
  title: string;
  category: string;
  price: number;
  durationMinutes: number | null;
  durationLabel: string;
  details?: string[];
  note?: string;
  quantity: number;
}

export interface AddOnOption {
  id: string;
  label: string;
  minutes: number;
}

export interface PromoPackage {
  id: string;
  name: string;
  price: number;
  baseDurationMinutes: number;
  includes: string[];
  hasUnlimitedWetArea: boolean;
  addOnAGroup: {
    title: string;
    options: AddOnOption[];
  };
  addOnBGroup?: {
    title: string;
    options: AddOnOption[];
  };
}

export interface SimpleService {
  id: string;
  name: string;
  tagalogSubtitle?: string;
  price: number;
  durationMinutes: number | null;
  durationLabel: string;
  description: string;
}

export interface HomeServiceTier {
  id: string;
  radiusLabel: string;
  distanceNote: string;
  rates: {
    id: string;
    durationLabel: string;
    durationMinutes: number;
    price: number;
  }[];
}
