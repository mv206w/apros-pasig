import { Check, Plus } from 'lucide-react';
import { formatPeso } from '../data/services';
import type { SimpleService } from '../types/booking';

interface ServiceLedgerRowProps {
  service: SimpleService;
  categoryLabel: string;
  quantityInTray: number;
  onAdd: (service: SimpleService, categoryLabel: string) => void;
}

export function ServiceLedgerRow({
  service,
  categoryLabel,
  quantityInTray,
  onAdd,
}: ServiceLedgerRowProps) {
  return (
    <div className="py-4 sm:py-5 border-b border-[#2D2622] flex items-start justify-between gap-3.5 sm:gap-5">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <h3 className="font-serif text-xl sm:text-[22px] font-medium text-[#F5EFE6] leading-snug tracking-[0.01em]">
            {service.name}
          </h3>
          {service.tagalogSubtitle && (
            <span className="text-xs sm:text-sm text-[#BEB3A8]">
              · {service.tagalogSubtitle}
            </span>
          )}
        </div>

        <p className="mt-1.5 text-[13px] sm:text-sm text-[#BEB3A8] leading-relaxed max-w-2xl">
          {service.description}
        </p>

        <div className="mt-2 text-xs text-[#9C9187] tabular-nums">
          <span>{service.durationLabel}</span>
          {quantityInTray > 0 && (
            <>
              <span aria-hidden="true" className="mx-2 text-[#D4AF6A]">·</span>
              <span className="text-[#D4AF6A] font-medium">
                {quantityInTray} in Session Tray
              </span>
            </>
          )}
        </div>
      </div>

      {/* Tabular gold price + calm circular add trigger */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pt-0.5 sm:pt-1">
        <span className="text-base sm:text-lg font-semibold text-[#D4AF6A] tabular-nums">
          {formatPeso(service.price)}
        </span>

        <button
          type="button"
          onClick={() => onAdd(service, categoryLabel)}
          aria-label={`Add ${service.name} to Session Tray`}
          title={`Add ${service.name}`}
          className={`w-10 h-10 sm:w-9 sm:h-9 rounded-full flex items-center justify-center border transition-all duration-150 shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF6A] ${
            quantityInTray > 0
              ? 'bg-[#5C2434] border-[#9E7B4F]/60 text-[#F5EFE6] hover:bg-[#702D40]'
              : 'bg-[#1E1A17] border-[#3B322C] text-[#F5EFE6] hover:border-[#D4AF6A] hover:bg-[#5C2434]'
          }`}
        >
          {quantityInTray > 0 ? (
            <Check className="w-4 h-4" strokeWidth={2.2} />
          ) : (
            <Plus className="w-4 h-4" strokeWidth={1.75} />
          )}
        </button>
      </div>
    </div>
  );
}
