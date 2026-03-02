"use client";

export type LensType = "domestic" | "international" | "economic";

export type LensCardProps = {
  type: LensType;
  label: string;
  purpose: string;
  plus: string;
  minus: string;
  isActive: boolean;
  onClick: () => void;
  onPlusClick?: () => void;
  onMinusClick?: () => void;
};

export function LensCard({
  label,
  purpose,
  plus,
  minus,
  isActive,
  onClick,
  onPlusClick,
  onMinusClick,
}: LensCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        "w-full h-full min-h-[180px] text-left rounded-xl border p-5 transition-all duration-200 cursor-pointer",
        "bg-zinc-800/80 border-zinc-600",
        "hover:border-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:ring-zinc-400",
        isActive
          ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-zinc-900 border-amber-500/50"
          : "opacity-90 hover:opacity-100",
      ].join(" ")}
    >
      <span className="block text-sm font-semibold text-zinc-200 mb-1">
        {label}
      </span>
      <p className="text-xs text-zinc-500 mb-4">目的：{purpose}</p>

      <div className="space-y-2">
        <p className="text-xs font-medium text-zinc-500">＋</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onPlusClick?.();
          }}
          className="block w-full text-left text-emerald-400 text-sm hover:underline cursor-pointer focus:outline-none"
        >
          {plus}
        </button>
        <p className="text-xs font-medium text-zinc-500 mt-3">ー</p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMinusClick?.();
          }}
          className="block w-full text-left text-red-400 text-sm hover:underline cursor-pointer focus:outline-none"
        >
          {minus}
        </button>
      </div>
    </div>
  );
}
