interface LogoProps {
  variant?: "full" | "icon" | "compact";
  className?: string;
  showText?: boolean;
}

export function Logo({
  variant = "full",
  className = "",
  showText = true,
}: LogoProps) {
  // SVG für logo.svg (Icon only)
  const logoIconSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#F97316"/>
      <g>
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M4 22h16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      </g>
    </svg>
  );

  // SVG für logo-full.svg (mit Text)
  const logoFullSvg = (
    <svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <style>
          {`
            .trophy-icon { fill: none; stroke: #FFFFFF; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
            .logo-text { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-weight: 700; fill: hsl(var(--foreground)); }
            .logo-subtext { font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; fill: hsl(var(--foreground)); opacity: 0.7; }
          `}
        </style>
      </defs>
      <rect x="0" y="6" width="48" height="48" rx="8" fill="#F97316"/>
      <g transform="translate(24, 30)">
        <g transform="scale(1.5)">
          <g transform="translate(-12, -12)">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" className="trophy-icon"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" className="trophy-icon"/>
            <path d="M4 22h16" className="trophy-icon"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" className="trophy-icon"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" className="trophy-icon"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" className="trophy-icon"/>
          </g>
        </g>
      </g>
      <text x="60" y="32" fontSize="20" className="logo-text">Sportify</text>
      <text x="60" y="46" fontSize="10" className="logo-subtext">by Leon Stadler</text>
    </svg>
  );

  if (variant === "icon") {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        {logoIconSvg}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <div style={{ width: "20px", height: "20px" }}>
            {logoIconSvg}
          </div>
        </div>
        {showText && (
          <div>
            <h1 className="text-xl font-bold text-foreground">Sportify</h1>
            <p className="text-xs text-muted-foreground">by Leon Stadler</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant - nutze das logo-full.svg inline
  return (
    <div className={className}>
      {logoFullSvg}
    </div>
  );
}

