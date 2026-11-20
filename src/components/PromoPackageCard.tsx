import { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { formatPeso } from '../data/services';
import type { PromoPackage } from '../types/booking';

interface PromoPackageCardProps {
  pkg: PromoPackage;
  onAddPromo: (params: {
    pkg: PromoPackage;
    selectedAddOnA: { id: string; label: string; minutes: number };
    selectedAddOnB?: { id: string; label: string; minutes: number };
  }) => void;
}

export function PromoPackageCard({ pkg, onAddPromo }: PromoPackageCardProps) {
  const [selectedAId, setSelectedAId] = useState<string>(pkg.addOnAGroup.options[0].id);
  const [selectedBId, setSelectedBId] = useState<string | undefined>(
    pkg.addOnBGroup ? pkg.addOnBGroup.options[0].id : undefined
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedA =
    pkg.addOnAGroup.options.find((opt) => opt.id === selectedAId) ??
    pkg.addOnAGroup.options[0];
  const selectedB = pkg.addOnBGroup
    ? pkg.addOnBGroup.options.find((opt) => opt.id === selectedBId) ??
      pkg.addOnBGroup.options[0]
    : undefined;

  const totalTimedMinutes =
    pkg.baseDurationMinutes + selectedA.minutes + (selectedB ? selectedB.minutes : 0);

  const handleAdd = () => {
    onAddPromo({
      pkg,
      selectedAddOnA: selectedA,
      selectedAddOnB: selectedB,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <article className="bg-[#1E1A17] border border-[#322B27] rounded-2xl p-5 sm:p-8 flex flex-col justify-between">
      <div>
        {/* Header row */}
        <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-[#2D2622]">
          <div>
            <h3 className="font-serif text-2xl sm:text-[28px] font-medium text-[#F5EFE6] tracking-[0.01em]">
              {pkg.name}
            </h3>
            <p className="mt-0.5 text-xs text-[#BEB3A8] tabular-nums">
              {totalTimedMinutes} min timed treatments
              {pkg.hasUnlimitedWetArea ? ' · Unlimited Wet Area' : ''}
            </p>
          </div>
          <span className="text-xl sm:text-2xl font-semibold text-[#D4AF6A] tabular-nums shrink-0">
            {formatPeso(pkg.price)}
          </span>
        </div>

        {/* Base Inclusions */}
        <div className="mt-4">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-2">
            Included Base Session
          </p>
          <ul className="space-y-1 text-sm text-[#F5EFE6]">
            {pkg.includes.map((line) => (
              <li key={line} className="flex items-start gap-2">
                <span aria-hidden="true" className="text-[#D4AF6A]">—</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Add-On A Picker */}
        <div className="mt-5 pt-4 border-t border-[#2D2622]">
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-2.5">
            {pkg.addOnAGroup.title}
          </p>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            role="radiogroup"
            aria-label={`${pkg.name} ${pkg.addOnAGroup.title}`}
          >
            {pkg.addOnAGroup.options.map((option) => {
              const isSelected = option.id === selectedA.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedAId(option.id)}
                  className={`min-h-[44px] sm:min-h-0 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-[13px] border transition-colors duration-150 flex items-center gap-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                    isSelected
                      ? 'bg-[#28221E] border-[#D4AF6A] text-[#F5EFE6] font-medium ring-1 ring-[#D4AF6A]/25'
                      : 'bg-[#161311] border-[#322B27] text-[#BEB3A8] hover:border-[#9E7B4F] hover:text-[#F5EFE6]'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#D4AF6A]' : 'border-[#574D46]'
                    }`}
                  >
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#D4AF6A]" />}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Add-On B Picker (if present) */}
        {pkg.addOnBGroup && selectedB && (
          <div className="mt-4 pt-4 border-t border-[#2D2622]">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-2.5">
              {pkg.addOnBGroup.title}
            </p>
            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
              role="radiogroup"
              aria-label={`${pkg.name} ${pkg.addOnBGroup.title}`}
            >
              {pkg.addOnBGroup.options.map((option) => {
                const isSelected = option.id === selectedB.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setSelectedBId(option.id)}
                    className={`min-h-[44px] sm:min-h-0 px-3.5 py-2.5 rounded-xl text-left text-xs sm:text-[13px] border transition-colors duration-150 flex items-center gap-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                      isSelected
                        ? 'bg-[#28221E] border-[#D4AF6A] text-[#F5EFE6] font-medium ring-1 ring-[#D4AF6A]/25'
                        : 'bg-[#161311] border-[#322B27] text-[#BEB3A8] hover:border-[#9E7B4F] hover:text-[#F5EFE6]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-[#D4AF6A]' : 'border-[#574D46]'
                      }`}
                    >
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#D4AF6A]" />}
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Summary & Action */}
      <div className="mt-6 pt-5 border-t border-[#2D2622] flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="text-xs text-[#BEB3A8] leading-snug">
          <span className="text-[#F5EFE6] font-medium">Your selection:</span>{' '}
          {selectedA.label}
          {selectedB ? ` + ${selectedB.label}` : ''}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
            justAdded
              ? 'bg-[#D4AF6A] text-[#0F0D0C]'
              : 'bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5" strokeWidth={2.2} />
              <span>Added to Tray</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" strokeWidth={2} />
              <span>Add Package</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
