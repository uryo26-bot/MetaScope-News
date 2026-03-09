"use client";

/** 猛ダッシュしている棒人間アニメーション */
export function SprintingStickFigure() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes sprint-leg-front {
          0%, 100% { transform: rotate(-25deg); }
          50% { transform: rotate(35deg); }
        }
        @keyframes sprint-leg-back {
          0%, 100% { transform: rotate(25deg); }
          50% { transform: rotate(-35deg); }
        }
        @keyframes sprint-arm-front {
          0%, 100% { transform: rotate(45deg); }
          50% { transform: rotate(-35deg); }
        }
        @keyframes sprint-arm-back {
          0%, 100% { transform: rotate(-45deg); }
          50% { transform: rotate(35deg); }
        }
        @keyframes sprint-body-bounce {
          0%, 100% { transform: translateY(0) rotate(-12deg); }
          50% { transform: translateY(-4px) rotate(-12deg); }
        }
        @keyframes sprint-head-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
        }
      `,
        }}
      />
      <svg width="72" height="90" viewBox="0 0 72 90" className="overflow-visible" aria-hidden>
        {/* 頭 */}
        <g style={{ transformOrigin: "36px 16px", animation: "sprint-head-bob 0.25s ease-in-out infinite" }}>
          <circle cx="36" cy="16" r="9" fill="none" stroke="#a1a1aa" strokeWidth="2" />
          <circle cx="33" cy="14" r="1.5" fill="#71717a" />
          <circle cx="39" cy="14" r="1.5" fill="#71717a" />
          <path d="M33 19 Q36 21 39 19" stroke="#71717a" strokeWidth="1" fill="none" strokeLinecap="round" />
        </g>
        {/* からだ（前傾） */}
        <g style={{ transformOrigin: "36px 28px", animation: "sprint-body-bounce 0.25s ease-in-out infinite" }}>
          <line
            x1="36"
            y1="25"
            x2="38"
            y2="52"
            stroke="#a1a1aa"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
        {/* 腕（前後） - 反対側に動く */}
        <g
          style={{
            transformOrigin: "36px 28px",
            animation: "sprint-arm-front 0.25s ease-in-out infinite",
          }}
        >
          <line x1="36" y1="28" x2="48" y2="22" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g
          style={{
            transformOrigin: "36px 28px",
            animation: "sprint-arm-back 0.25s ease-in-out infinite",
            animationDelay: "-0.125s",
          }}
        >
          <line x1="36" y1="28" x2="22" y2="38" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* 足（前後のストライド） */}
        <g
          style={{
            transformOrigin: "38px 52px",
            animation: "sprint-leg-front 0.25s ease-in-out infinite",
          }}
        >
          <line x1="38" y1="52" x2="46" y2="76" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g
          style={{
            transformOrigin: "38px 52px",
            animation: "sprint-leg-back 0.25s ease-in-out infinite",
            animationDelay: "-0.125s",
          }}
        >
          <line x1="38" y1="52" x2="28" y2="74" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" />
        </g>
        {/* 速度線・埃 */}
        <g opacity="0.5" style={{ animation: "sprint-head-bob 0.25s ease-in-out infinite" }}>
          <line x1="8" y1="45" x2="2" y2="42" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="55" x2="2" y2="55" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="8" y1="65" x2="2" y2="68" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </>
  );
}
