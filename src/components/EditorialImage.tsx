import { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

interface EditorialImageProps {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imgClassName?: string;
}

export function EditorialImage({
  src,
  alt,
  caption,
  className = '',
  imgClassName = 'w-full h-full object-cover',
}: EditorialImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  return (
    <figure className={`flex flex-col ${className}`}>
      <div className="relative overflow-hidden rounded-2xl flex-1 min-h-[240px] bg-[#1E1A17] border border-[#2D2622] shadow-2xl shadow-black/45">
        {!hasError ? (
          <img
            src={src}
            alt={alt}
            referrerPolicy="no-referrer"
            onError={() => setHasError(true)}
            className={imgClassName}
          />
        ) : (
          <div className="w-full h-full min-h-[240px] flex flex-col items-center justify-center p-8 text-center bg-[#1E1A17] text-[#BEB3A8]">
            <Leaf className="w-6 h-6 text-[#D4AF6A] mb-3" strokeWidth={1.5} />
            <p className="font-serif text-lg text-[#F5EFE6]">{alt}</p>
          </div>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-xs leading-relaxed text-[#BEB3A8]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
