import { useEffect, useState } from 'react';
import { Check, ExternalLink, Info, MapPin, Plus } from 'lucide-react';
import { BUSINESS_INFO, formatPeso } from '../data/services';
import { useCatalog } from '../context/CatalogContext';

interface HomeServiceSectionProps {
  embedded?: boolean;
  onAddHomeService: (params: {
    id: string;
    radiusLabel: string;
    durationLabel: string;
    durationMinutes: number;
    price: number;
  }) => void;
}

export function HomeServiceSection({ embedded = false, onAddHomeService }: HomeServiceSectionProps) {
  const { homeServiceTiers } = useCatalog();
  const [selectedTierId, setSelectedTierId] = useState<string>(
    homeServiceTiers[0]?.id ?? ''
  );
  const [selectedDurationIdx, setSelectedDurationIdx] = useState<number>(0);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (
      homeServiceTiers.length > 0 &&
      !homeServiceTiers.some((tier) => tier.id === selectedTierId)
    ) {
      setSelectedTierId(homeServiceTiers[0].id);
      setSelectedDurationIdx(0);
    }
  }, [homeServiceTiers, selectedTierId]);

  const activeTier =
    homeServiceTiers.find((tier) => tier.id === selectedTierId) ??
    homeServiceTiers[0];
  const activeRate =
    activeTier?.rates[selectedDurationIdx] ?? activeTier?.rates[0];

  const handleAdd = () => {
    if (!activeTier || !activeRate) return;
    onAddHomeService({
      id: activeRate.id,
      radiusLabel: activeTier.radiusLabel,
      durationLabel: activeRate.durationLabel,
      durationMinutes: activeRate.durationMinutes,
      price: activeRate.price,
    });
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1800);
  };

  return (
    <section
      id="home-service"
      className={embedded ? '' : 'py-14 lg:py-18 bg-[#161311] border-t border-[#2D2622]'}
    >
      <div className={embedded ? '' : 'max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12'}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 sm:gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#D4AF6A]">
              07 · Outcall Bodywork
            </p>
            {embedded ? (
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-normal text-[#F5EFE6] text-balance">
                Home &amp; Hotel Service Rates
              </h1>
            ) : (
              <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-normal text-[#F5EFE6] text-balance">
                Home &amp; Hotel Service Rates
              </h2>
            )}
            <p className="mt-3 text-sm text-[#BEB3A8] leading-relaxed">
              Licensed therapists travel from Dela Paz, Pasig with fresh linens and warm oil. Rates scale by distance radius (+ Transpo).
            </p>

            <div className="mt-5 pt-4 border-t border-[#2D2622] text-xs text-[#BEB3A8] space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF6A] shrink-0 mt-0.5" strokeWidth={1.75} />
                <span>Origin: {BUSINESS_INFO.address}</span>
              </div>
              <p className="pl-6">
                All outcall rates are <strong className="font-medium text-[#F5EFE6]">+ Transpo</strong> based on your pin.
              </p>
            </div>
          </div>

          {/* Interactive Radius & Duration Selector */}
          <div className="lg:col-span-8 bg-[#1E1A17] border border-[#322B27] rounded-2xl p-4 sm:p-8">
            {/* Distance Accuracy Notice */}
            <div className="mb-5 sm:mb-6 px-3.5 sm:px-4 py-3 rounded-xl bg-[#161311] border border-[#3B322C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#D4AF6A] shrink-0 mt-0.5" strokeWidth={1.75} />
                <p className="text-xs text-[#BEB3A8] leading-relaxed">
                  Double-check your distance from our{' '}
                  <strong className="font-medium text-[#F5EFE6]">Dela Paz, Pasig branch</strong> before picking your tier for accurate rates.
                </p>
              </div>
              <a
                href={BUSINESS_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-[#1E1A17] border border-[#322B27] text-[#D4AF6A] hover:border-[#D4AF6A] hover:text-[#F5EFE6] transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                <span>Check Branch Pin</span>
                <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
              </a>
            </div>

            {!activeTier || !activeRate ? (
              <div className="py-8 text-center text-sm text-[#BEB3A8]">
                No outcall radius rates configured yet. Please call {BUSINESS_INFO.phoneDisplay} for current home &amp; hotel rates.
              </div>
            ) : (
              <>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-3">
                    Step 1 · Select Distance Radius from Pasig
                  </p>
                  <div
                    className="grid grid-cols-1 md:grid-cols-3 gap-2.5"
                    role="radiogroup"
                    aria-label="Distance radius from Pasig"
                  >
                    {homeServiceTiers.map((tier) => {
                      const isSelected = tier.id === activeTier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setSelectedTierId(tier.id);
                            setSelectedDurationIdx(0);
                          }}
                          className={`px-4 py-3 rounded-xl text-left border transition-colors duration-150 flex items-center gap-2.5 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                            isSelected
                              ? 'bg-[#28221E] border-[#D4AF6A] text-[#F5EFE6] ring-1 ring-[#D4AF6A]/25'
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
                          <span className="text-xs sm:text-sm font-medium leading-snug">
                            {tier.radiusLabel}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-2.5 text-xs text-[#BEB3A8]">
                    Typical areas: {activeTier.distanceNote}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-[#2D2622]">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-3">
                    Step 2 · Choose Session Duration
                  </p>
                  <div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                    role="radiogroup"
                    aria-label="Home service duration"
                  >
                    {activeTier.rates.map((rate, idx) => {
                      const isSelected = idx === selectedDurationIdx;
                      return (
                        <button
                          key={rate.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => setSelectedDurationIdx(idx)}
                          className={`px-4 py-3.5 rounded-xl text-left border transition-colors duration-150 flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                            isSelected
                              ? 'bg-[#28221E] border-[#D4AF6A] text-[#F5EFE6] ring-1 ring-[#D4AF6A]/25'
                              : 'bg-[#161311] border-[#322B27] text-[#BEB3A8] hover:border-[#9E7B4F] hover:text-[#F5EFE6]'
                          }`}
                        >
                          <div>
                            <span className="block text-sm font-medium text-[#F5EFE6]">
                              {rate.durationLabel}
                            </span>
                            <span className="block text-xs mt-0.5 tabular-nums text-[#BEB3A8]">
                              {rate.durationMinutes} minutes · Home or Hotel
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="block text-base font-semibold text-[#D4AF6A] tabular-nums">
                              {formatPeso(rate.price)}
                            </span>
                            <span className="block text-[11px] text-[#9C9187]">
                              + Transpo
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected summary + add */}
                <div className="mt-6 pt-6 border-t border-[#2D2622] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#9C9187]">Selected Outcall Rate</p>
                    <p className="mt-0.5 font-serif text-xl sm:text-2xl text-[#F5EFE6] tabular-nums">
                      {activeTier.radiusLabel} · {activeRate.durationLabel} —{' '}
                      <span className="font-sans font-semibold text-[#D4AF6A]">
                        {formatPeso(activeRate.price)} + Transpo
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAdd}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-medium transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
                      justAdded
                        ? 'bg-[#D4AF6A] text-[#0F0D0C]'
                        : 'bg-[#5C2434] text-[#F5EFE6] border border-[#9E7B4F]/45 hover:bg-[#702D40]'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-4 h-4" strokeWidth={2.2} />
                        <span>Added to Session Tray</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" strokeWidth={2} />
                        <span>Add Home &amp; Hotel Service</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Complete printed reference table */}
                <div className="mt-7 pt-5 border-t border-[#2D2622]">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#9C9187] mb-3">
                    Complete Outcall Rate Guide
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs sm:text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-[#2D2622] text-[#9C9187]">
                          <th className="py-2 pr-4 font-medium">Distance Radius</th>
                          <th className="py-2 pl-4 font-medium text-right">Available Durations &amp; Rates</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2D2622] tabular-nums">
                        {homeServiceTiers.map((tier) => (
                          <tr key={tier.id} className="text-[#F5EFE6]">
                            <td className="py-2.5 pr-4 font-medium">{tier.radiusLabel}</td>
                            <td className="py-2.5 pl-4 text-right">
                              <div className="flex flex-wrap justify-end gap-x-5 gap-y-1">
                                {tier.rates.map((rate) => (
                                  <span key={rate.id}>
                                    <span className="text-[#BEB3A8]">{rate.durationLabel}:</span>{' '}
                                    <span className="text-[#D4AF6A] font-medium">
                                      {formatPeso(rate.price)}
                                    </span>{' '}
                                    <span className="text-[#9C9187] text-xs">+ Transpo</span>
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
