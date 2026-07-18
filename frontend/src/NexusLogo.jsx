// NexusLogo.jsx — the X-and-node mark plus "nexus", in the console palette:
// red mark, white node centre, ink-black text. `inverse` is the white version
// for red backgrounds (login panel, console top bar).

export function NexusLogo({ size = 20, className = "", inverse = false }) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        color: inverse ? "#ffffff" : "#141414",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <svg
        viewBox="0 0 18 18"
        width={size}
        height={size}
        fill="none"
        stroke={inverse ? "#ffffff" : "#d12a22"}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 2l14 14M16 2L2 16" />
        <circle cx="9" cy="9" r="3.2" fill={inverse ? "#d12a22" : "#ffffff"} />
      </svg>
      <span>nexus</span>
    </span>
  );
}
