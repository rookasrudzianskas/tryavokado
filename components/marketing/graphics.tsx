import { cn } from "@/lib/utils";

/*
  Hand-built SVG graphics for the marketing site. Dark-surface, hairline strokes,
  a single green→teal→cyan accent gradient. Static and intentional.
*/

const STROKE = "oklch(1 0 0 / 0.12)";
const STROKE_SOFT = "oklch(1 0 0 / 0.07)";
const FILL = "oklch(1 0 0 / 0.03)";
const FILL_2 = "oklch(1 0 0 / 0.05)";
const TEXT = "oklch(1 0 0 / 0.32)";

function AccentGradient({ id }: { id: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="oklch(0.78 0.16 142)" />
      <stop offset="55%" stopColor="oklch(0.72 0.13 178)" />
      <stop offset="100%" stopColor="oklch(0.66 0.13 215)" />
    </linearGradient>
  );
}

/* ----------------------------- Hero: campaign canvas ----------------------- */

export function HeroCanvas({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 400"
      fill="none"
      role="img"
      aria-label="Avokado campaign structure"
      className={cn("h-auto w-full", className)}
    >
      <defs>
        <AccentGradient id="hero-accent" />
        <radialGradient id="hero-glow" cx="50%" cy="0%" r="70%">
          <stop offset="0%" stopColor="oklch(0.72 0.15 142 / 0.22)" />
          <stop offset="100%" stopColor="oklch(0.72 0.15 142 / 0)" />
        </radialGradient>
      </defs>

      {/* glow + window frame */}
      <rect x="8" y="8" width="504" height="384" rx="18" fill="url(#hero-glow)" opacity="0.6" />
      <rect x="20" y="20" width="480" height="360" rx="16" fill="oklch(0.1 0 0)" stroke={STROKE} />
      <line x1="20" y1="58" x2="500" y2="58" stroke={STROKE_SOFT} />
      <circle cx="40" cy="39" r="4" fill="oklch(1 0 0 / 0.16)" />
      <circle cx="56" cy="39" r="4" fill="oklch(1 0 0 / 0.12)" />
      <circle cx="72" cy="39" r="4" fill="oklch(1 0 0 / 0.1)" />
      <rect x="196" y="31" width="128" height="16" rx="8" fill={FILL} />

      {/* connectors */}
      <g stroke="url(#hero-accent)" strokeWidth="1.5" opacity="0.9">
        <path d="M260 132 C 260 168, 150 158, 150 196" />
        <path d="M260 132 C 260 168, 372 158, 372 196" />
      </g>
      <g stroke={STROKE} strokeWidth="1.5">
        <path d="M150 244 C 150 270, 96 262, 96 290" />
        <path d="M150 244 C 150 270, 206 262, 206 290" />
        <path d="M372 244 C 372 270, 372 262, 372 290" />
      </g>

      {/* campaign node */}
      <g>
        <rect x="196" y="92" width="128" height="40" rx="10" fill={FILL_2} stroke={STROKE} />
        <rect x="208" y="104" width="4" height="16" rx="2" fill="url(#hero-accent)" />
        <rect x="222" y="106" width="58" height="5" rx="2.5" fill="oklch(1 0 0 / 0.55)" />
        <rect x="222" y="117" width="38" height="4" rx="2" fill={TEXT} />
      </g>

      {/* ad set nodes */}
      {[96, 318].map((x) => (
        <g key={x}>
          <rect x={x} y="196" width="108" height="38" rx="9" fill={FILL} stroke={STROKE} />
          <circle cx={x + 16} cy="215" r="4" fill="oklch(0.72 0.13 178)" />
          <rect x={x + 28} y="208" width="46" height="5" rx="2.5" fill="oklch(1 0 0 / 0.45)" />
          <rect x={x + 28} y="219" width="30" height="4" rx="2" fill={TEXT} />
        </g>
      ))}

      {/* ad nodes */}
      {[50, 160, 326].map((x) => (
        <g key={x}>
          <rect x={x} y="290" width="92" height="56" rx="9" fill={FILL} stroke={STROKE_SOFT} />
          <rect x={x + 10} y="300" width="72" height="22" rx="5" fill="oklch(1 0 0 / 0.04)" stroke={STROKE_SOFT} />
          <rect x={x + 10} y="330" width="46" height="4" rx="2" fill={TEXT} />
        </g>
      ))}

      {/* status pill */}
      <g>
        <rect x="356" y="92" width="92" height="26" rx="13" fill="oklch(0.72 0.15 142 / 0.12)" stroke="oklch(0.72 0.15 142 / 0.3)" />
        <circle cx="372" cy="105" r="3.5" fill="oklch(0.78 0.16 142)" />
        <rect x="382" y="102" width="52" height="6" rx="3" fill="oklch(0.82 0.12 142 / 0.7)" />
      </g>
    </svg>
  );
}

/* ----------------------------- Feature graphics ---------------------------- */

export function BrandGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" fill="none" aria-hidden className={cn("w-full", className)}>
      <defs>
        <AccentGradient id="brand-accent" />
      </defs>
      <rect x="40" y="20" width="150" height="136" rx="12" fill={FILL} stroke={STROKE} />
      <rect x="40" y="20" width="150" height="30" rx="12" fill="url(#brand-accent)" opacity="0.16" />
      <rect x="56" y="31" width="70" height="8" rx="4" fill="oklch(1 0 0 / 0.5)" />
      {[68, 88, 108].map((y) => (
        <g key={y}>
          <rect x="56" y={y} width="34" height="5" rx="2.5" fill={TEXT} />
          <rect x="98" y={y} width="76" height="5" rx="2.5" fill="oklch(1 0 0 / 0.16)" />
        </g>
      ))}
      <text x="56" y="132" fill={TEXT} fontSize="9" fontFamily="monospace">
        palette
      </text>
      {[
        ["oklch(0.78 0.16 142)", 56],
        ["oklch(0.72 0.13 178)", 80],
        ["oklch(0.66 0.13 215)", 104],
        ["oklch(0.6 0.02 120)", 128],
      ].map(([c, x]) => (
        <circle key={x as number} cx={(x as number) + 6} cy="146" r="7" fill={c as string} stroke="oklch(1 0 0 / 0.15)" />
      ))}
      {/* evidence card */}
      <rect x="206" y="44" width="84" height="88" rx="10" fill={FILL_2} stroke={STROKE} />
      <rect x="218" y="58" width="40" height="5" rx="2.5" fill="oklch(1 0 0 / 0.4)" />
      <rect x="218" y="72" width="60" height="4" rx="2" fill={TEXT} />
      <rect x="218" y="82" width="52" height="4" rx="2" fill={TEXT} />
      <rect x="218" y="104" width="60" height="16" rx="8" fill="url(#brand-accent)" opacity="0.18" />
    </svg>
  );
}

export function CreativeGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" fill="none" aria-hidden className={cn("w-full", className)}>
      <defs>
        <AccentGradient id="creative-accent" />
      </defs>
      {/* fanned cards */}
      <g transform="rotate(-8 100 100)">
        <rect x="44" y="42" width="116" height="96" rx="12" fill={FILL} stroke={STROKE_SOFT} />
      </g>
      <g transform="rotate(-3 110 100)">
        <rect x="64" y="36" width="116" height="96" rx="12" fill={FILL_2} stroke={STROKE_SOFT} />
      </g>
      {/* front card */}
      <rect x="92" y="30" width="140" height="116" rx="12" fill="oklch(0.13 0 0)" stroke={STROKE} />
      <rect x="104" y="42" width="116" height="48" rx="8" fill="url(#creative-accent)" opacity="0.2" />
      <circle cx="124" cy="66" r="9" fill="oklch(1 0 0 / 0.12)" />
      <path d="M140 78 l14 -12 l16 14 l10 -8 l12 10" stroke="oklch(1 0 0 / 0.3)" strokeWidth="1.5" fill="none" />
      <rect x="104" y="100" width="84" height="6" rx="3" fill="oklch(1 0 0 / 0.5)" />
      <rect x="104" y="114" width="116" height="5" rx="2.5" fill={TEXT} />
      <rect x="104" y="125" width="92" height="5" rx="2.5" fill={TEXT} />
      {/* CTA pill */}
      <rect x="248" y="64" width="58" height="22" rx="11" fill="url(#creative-accent)" opacity="0.9" />
      <rect x="258" y="72" width="38" height="6" rx="3" fill="oklch(0.12 0 0 / 0.8)" />
    </svg>
  );
}

export function AnalyticsGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" fill="none" aria-hidden className={cn("w-full", className)}>
      <defs>
        <AccentGradient id="ana-accent" />
        <linearGradient id="ana-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.15 142 / 0.32)" />
          <stop offset="100%" stopColor="oklch(0.72 0.15 142 / 0)" />
        </linearGradient>
      </defs>
      <rect x="28" y="20" width="264" height="136" rx="12" fill={FILL} stroke={STROKE} />
      {/* grid lines */}
      {[52, 84, 116].map((y) => (
        <line key={y} x1="48" y1={y} x2="272" y2={y} stroke={STROKE_SOFT} />
      ))}
      {/* area + line */}
      <path
        d="M48 120 L88 96 L128 104 L168 72 L208 82 L248 50 L272 58 L272 136 L48 136 Z"
        fill="url(#ana-area)"
      />
      <path
        d="M48 120 L88 96 L128 104 L168 72 L208 82 L248 50 L272 58"
        stroke="url(#ana-accent)"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {[
        [88, 96],
        [168, 72],
        [248, 50],
      ].map(([x, y]) => (
        <circle key={x} cx={x} cy={y} r="3.5" fill="oklch(0.1 0 0)" stroke="oklch(0.78 0.16 142)" strokeWidth="2" />
      ))}
      {/* metric chips */}
      <rect x="44" y="32" width="52" height="8" rx="4" fill="oklch(1 0 0 / 0.4)" />
      <rect x="216" y="30" width="40" height="14" rx="7" fill="oklch(0.72 0.15 142 / 0.14)" stroke="oklch(0.72 0.15 142 / 0.3)" />
    </svg>
  );
}

export function SafetyGraphic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 176" fill="none" aria-hidden className={cn("w-full", className)}>
      <defs>
        <AccentGradient id="safe-accent" />
      </defs>
      {/* flow nodes: AI -> policy -> approve -> run */}
      {[
        [36, "AI"],
        [116, "Policy"],
        [196, "You"],
        [252, "Run"],
      ].map(([x], i) => (
        <g key={i}>
          {i < 3 && (
            <line x1={(x as number) + 44} y1="100" x2={(x as number) + 80} y2="100" stroke="url(#safe-accent)" strokeWidth="1.5" />
          )}
        </g>
      ))}
      <rect x="36" y="80" width="44" height="40" rx="9" fill={FILL_2} stroke={STROKE} />
      <circle cx="58" cy="100" r="9" fill="none" stroke="oklch(1 0 0 / 0.3)" strokeWidth="1.5" />
      <circle cx="58" cy="100" r="3" fill="oklch(1 0 0 / 0.4)" />

      <rect x="116" y="80" width="44" height="40" rx="9" fill={FILL_2} stroke={STROKE} />
      <rect x="128" y="92" width="20" height="3" rx="1.5" fill={TEXT} />
      <rect x="128" y="99" width="20" height="3" rx="1.5" fill={TEXT} />
      <rect x="128" y="106" width="14" height="3" rx="1.5" fill={TEXT} />

      <rect x="196" y="80" width="44" height="40" rx="9" fill="oklch(0.72 0.15 142 / 0.12)" stroke="oklch(0.72 0.15 142 / 0.35)" />
      <path d="M208 100 l6 6 l12 -13" stroke="oklch(0.8 0.16 142)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

      <rect x="252" y="80" width="44" height="40" rx="9" fill={FILL} stroke={STROKE} />
      <path d="M268 90 l14 10 l-14 10 Z" fill="oklch(1 0 0 / 0.35)" />

      {/* shield watermark */}
      <path
        d="M160 30 l40 12 v22 c0 26 -18 40 -40 48 c-22 -8 -40 -22 -40 -48 v-22 Z"
        fill="none"
        stroke={STROKE_SOFT}
        strokeWidth="1.5"
        opacity="0.5"
      />
    </svg>
  );
}
