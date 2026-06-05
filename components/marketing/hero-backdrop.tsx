/** Static, refined hero backdrop: a hairline grid that fades out, plus two soft
 *  gradient glows. No motion — calm and intentional. Server component. */
export function HeroBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid mask-fade-b opacity-[0.35]" />
      {/* Primary brand glow */}
      <div className="absolute left-1/2 top-[-16rem] h-[34rem] w-[58rem] -translate-x-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,oklch(0.72_0.15_142/0.14),transparent_70%)] blur-2xl" />
      {/* Cool counter-glow for depth */}
      <div className="absolute right-[8%] top-[2rem] h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.13_215/0.1),transparent_70%)] blur-3xl" />
      {/* Crisp top hairline */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </div>
  );
}
