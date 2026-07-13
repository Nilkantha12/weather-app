type NWLogoProps = {
  size?: number
  className?: string
}

export default function NWLogo({ size = 44, className = '' }: NWLogoProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="42" height="42" rx="14" fill="url(#nw-bg)" stroke="rgba(255,255,255,0.22)" />
      <text
        x="22"
        y="28"
        textAnchor="middle"
        fill="#eaf2ff"
        fontFamily="system-ui,Segoe UI,Roboto,sans-serif"
        fontSize="15"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        NW
      </text>
      <circle cx="34" cy="10" r="3" fill="#4ea6ff" opacity="0.9" />
      <defs>
        <linearGradient id="nw-bg" x1="6" y1="4" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="rgba(78,166,255,0.35)" />
          <stop offset="1" stopColor="rgba(47,124,255,0.18)" />
        </linearGradient>
      </defs>
    </svg>
  )
}
