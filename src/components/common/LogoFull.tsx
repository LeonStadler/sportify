interface LogoFullProps {
  className?: string;
  alt?: string;
  byline?: string;
}

/**
 * LogoFull Component - Rendert das logo-full.svg inline
 * Dadurch kann das SVG auf CSS-Variablen zugreifen und automatisch
 * zwischen Dark- und Light-Mode wechseln
 */
export function LogoFull({
  className = "",
  alt = "Sportify",
  byline = "by Leon Stadler",
}: LogoFullProps) {
  return (
    <svg
      width="200"
      height="60"
      viewBox="0 0 200 60"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label={alt}
    >
      <defs>
        <style>
          {`
            .trophy-icon { 
              fill: none; 
              stroke: #FFFFFF; 
              stroke-width: 1.5; 
              stroke-linecap: round; 
              stroke-linejoin: round; 
            }
            
            /* Verwende CSS-Variablen aus dem Design-System für automatische Theme-Unterstützung */
            .logo-text { 
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
              font-weight: 700; 
              fill: hsl(var(--foreground)); 
            }
            .logo-subtext { 
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; 
              fill: hsl(var(--foreground)); 
              opacity: 0.7; 
            }
          `}
        </style>
      </defs>
      {/* Orange Background Box */}
      <rect x="0" y="6" width="48" height="48" rx="8" fill="#F97316" />

      {/* Trophy Icon */}
      <g transform="translate(24, 30)">
        <g transform="scale(1.5)">
          <g transform="translate(-12, -12)">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" className="trophy-icon" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" className="trophy-icon" />
            <path d="M4 22h16" className="trophy-icon" />
            <path
              d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"
              className="trophy-icon"
            />
            <path
              d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"
              className="trophy-icon"
            />
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" className="trophy-icon" />
          </g>
        </g>
      </g>

      {/* Sportify Text */}
      <text x="60" y="32" fontSize="20" className="logo-text">
        Sportify
      </text>
      <text x="60" y="46" fontSize="10" className="logo-subtext">
        {byline}
      </text>
    </svg>
  );
}
