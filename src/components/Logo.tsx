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
  if (variant === "icon") {
    // Nutze das echte favicon.svg direkt
    return (
      <img
        src="/favicon.svg"
        alt="Sportify"
        className={className}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/favicon.svg"
          alt="Sportify"
          className="w-8 h-8 flex-shrink-0"
        />
        {showText && (
          <div>
            <h1 className="text-xl font-bold text-foreground">Sportify</h1>
            <p className="text-xs text-muted-foreground">by Leon Stadler</p>
          </div>
        )}
      </div>
    );
  }

  // Full variant - inline SVG für Theme-Unterstützung
  return (
    <svg
      viewBox="0 0 200 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sportify by Leon Stadler"
    >
      <rect x="0" y="6" width="48" height="48" rx="6" fill="#F97316" />
      <g transform="translate(24, 30)">
        <g transform="scale(1.35)">
          <g transform="translate(-12, -12)">
            <path
              d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4 22h16"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M18 2H6v7a6 6 0 0 0 12 0V2Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>
      </g>
      <text
        x="60"
        y="32"
        fontSize="20"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="700"
        className="fill-foreground"
      >
        Sportify
      </text>
      <text
        x="60"
        y="46"
        fontSize="10"
        fontFamily="Inter, system-ui, sans-serif"
        className="fill-muted-foreground"
      >
        by Leon Stadler
      </text>
    </svg>
  );
}
