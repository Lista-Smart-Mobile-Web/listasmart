export default function SvgDefs() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
      <defs>
        <linearGradient id="g-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C47A2A" />
          <stop offset="100%" stopColor="#8B4A10" />
        </linearGradient>
        <linearGradient id="g-sh" x1="0%" y1="0%" x2="0%" y2="60%">
          <stop offset="0%" stopColor="#E8A050" stopOpacity=".7" />
          <stop offset="100%" stopColor="#C47A2A" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="g-bd" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5DC84A" />
          <stop offset="100%" stopColor="#2E8B1A" />
        </linearGradient>
        <symbol id="ls-icon" viewBox="140 140 400 400">
          <g transform="translate(140,140)">
            <rect x="0" y="0" width="400" height="400" rx="80" fill="url(#g-bg)" />
            <rect x="0" y="0" width="400" height="220" rx="80" fill="url(#g-sh)" />
            <rect x="0" y="0" width="400" height="400" rx="80" fill="none" stroke="#6B3208" strokeWidth="6" />
            <path d="M80,110 L110,110 L150,250 L310,250 L340,145 L125,145" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M128,148 L338,148 L308,252 L152,252 Z" fill="white" opacity=".15" />
            <line x1="190" y1="155" x2="175" y2="248" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".9" />
            <line x1="248" y1="155" x2="245" y2="248" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".9" />
            <line x1="306" y1="155" x2="312" y2="248" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".9" />
            <line x1="140" y1="195" x2="330" y2="195" stroke="white" strokeWidth="10" strokeLinecap="round" opacity=".9" />
            <circle cx="175" cy="282" r="22" fill="white" />
            <circle cx="175" cy="282" r="10" fill="#A05A18" />
            <circle cx="288" cy="282" r="22" fill="white" />
            <circle cx="288" cy="282" r="10" fill="#A05A18" />
            <circle cx="330" cy="95" r="55" fill="url(#g-bd)" />
            <circle cx="330" cy="95" r="55" fill="none" stroke="#1A6B0A" strokeWidth="4" />
            <path d="M305,95 L322,112 L358,76" fill="none" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </symbol>
      </defs>
    </svg>
  )
}
