import { LOGO_URL } from '../data/services';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'w-9 h-9',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
};

export function BrandLogo({ size = 'md', className = '' }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full overflow-hidden bg-[#050505] border border-[#C5A059]/45 shrink-0 ${SIZE_CLASSES[size]} ${className}`}
    >
      <img
        src={LOGO_URL}
        alt="Apros Wellness Spa crest"
        className="w-full h-full object-cover object-center scale-[1.28]"
      />
    </span>
  );
}
