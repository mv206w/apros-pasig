import type { CategoryId } from '../data/services';
import type { AddOnOption } from './booking';

export type ServiceCategoryId = CategoryId | 'exclusive';

export interface SiteConfig {
  heroImageUrl: string;
  heroImageAlt: string;
  heroImageCaption: string;
  catalogSeeded: boolean;
}

export interface CategoryCover {
  categoryId: CategoryId;
  imageUrl: string;
  imageAlt: string;
}

export interface HomeServiceRateItem {
  id: string;
  durationLabel: string;
  durationMinutes: number;
  price: number;
}

export interface CatalogServiceDoc {
  id: string;
  categoryId: ServiceCategoryId;
  name: string;
  tagalogSubtitle?: string;
  price: number;
  durationMinutes: number;
  durationLabel: string;
  description: string;
  includes?: string[];
  hasUnlimitedWetArea?: boolean;
  addOnATitle?: string;
  addOnAOptions?: AddOnOption[];
  addOnBTitle?: string;
  addOnBOptions?: AddOnOption[];
  homeRates?: HomeServiceRateItem[];
  sortOrder: number;
}

export interface SpaGalleryPhoto {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
}
