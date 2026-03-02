"use client";

/** 地図を作っている棒人間アニメーション */
export function MapMakingStickFigure() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes mapstick-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-3px)} }
        @keyframes mapstick-arm { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(20deg)} }
      `,
        }}
      />
      <svg width="72" height="90" viewBox="0 0 72 90" className="overflow-visible" aria-hidden>
        {/* 頭 */}
        <g style={{ animation: "mapstick-bob 1.2s ease-in-out infinite" }}>
          <circle cx="36" cy="16" r="9" fill="none" stroke="#a1a1aa" strokeWidth="2" />
          <circle cx="32" cy="14" r="1.5" fill="#71717a" />
          <circle cx="40" cy="14" r="1.5" fill="#71717a" />
        </g>
        {/* からだ */}
        <line x1="36" y1="25" x2="36" y2="50" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        {/* 腕・ペン */}
        <g style={{ transformOrigin: "36px 28px", animation: "mapstick-arm 1.4s ease-in-out infinite" }}>
          <line x1="36" y1="28" x2="22" y2="42" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
          <line x1="22" y1="42" x2="18" y2="48" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g
          style={{
            transformOrigin: "36px 28px",
            animation: "mapstick-arm 1.4s ease-in-out infinite",
            animationDelay: "-0.7s",
          }}
        >
          <line x1="36" y1="28" x2="50" y2="38" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* 足 */}
        <line x1="36" y1="50" x2="28" y2="70" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="50" x2="44" y2="70" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        {/* 地図（紙） */}
        <rect x="4" y="40" width="24" height="18" rx="2" fill="#3f3f46" stroke="#52525b" strokeWidth="1.5" />
        <line x1="8" y1="46" x2="22" y2="46" stroke="#52525b" strokeWidth="1" />
        <line x1="8" y1="50" x2="18" y2="50" stroke="#52525b" strokeWidth="1" />
        <path d="M8 54 Q12 52 16 54" stroke="#52525b" strokeWidth="1" fill="none" />
      </svg>
    </>
  );
}
