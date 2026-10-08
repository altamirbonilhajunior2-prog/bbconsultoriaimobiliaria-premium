"use client";

type MultiSelectFieldProps = {
  label: string;
  options: readonly string[];
  selected: string[];
  allLabel: string;
  onToggle: (value: string) => void;
  onClear: () => void;
  disabled?: boolean;
  disabledLabel?: string;
};

export default function MultiSelectField({
  label,
  options,
  selected,
  allLabel,
  onToggle,
  onClear,
  disabled = false,
  disabledLabel,
}: MultiSelectFieldProps) {
  const summary =
    disabled
      ? disabledLabel || allLabel
      : selected.length === 0
        ? allLabel
        : selected.length === 1
          ? selected[0]
          : selected[0] +
            " +" +
            (selected.length - 1);

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
        {label}
      </span>

      {disabled ? (
        <div
          aria-disabled="true"
          className="flex h-14 items-center border border-white/10 bg-[#111111] px-4 text-sm text-zinc-600"
        >
          <span className="truncate">
            {summary}
          </span>
        </div>
      ) : (
        <details className="group relative">
          <summary className="flex h-14 cursor-pointer list-none items-center justify-between gap-3 border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500 [&::-webkit-details-marker]:hidden">
            <span className="truncate">
              {summary}
            </span>

            <span
              aria-hidden="true"
              className="text-zinc-500 transition group-open:rotate-180"
            >
              ▾
            </span>
          </summary>

          <div className="absolute left-0 right-0 z-40 mt-2 max-h-72 overflow-y-auto border border-white/10 bg-[#111111] p-2 shadow-2xl">
            <button
              type="button"
              onClick={onClear}
              className="w-full px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
            >
              {allLabel}
            </button>

            {options.map(
              (option) => (
                <label
                  key={option}
                  className="flex cursor-pointer items-center gap-3 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(
                      option,
                    )}
                    onChange={() =>
                      onToggle(
                        option,
                      )
                    }
                    className="h-4 w-4 accent-amber-500"
                  />

                  <span>
                    {option}
                  </span>
                </label>
              ),
            )}
          </div>
        </details>
      )}
    </div>
  );
}
