/**
 * Aktualisiert SVG-Bilder basierend auf dem aktuellen Theme
 * Da externe SVGs als <img> keinen Zugriff auf CSS-Klassen haben,
 * müssen wir die SVG-Inhalte dynamisch aktualisieren
 */
export function updateSvgTheme() {
  const isDark = document.documentElement.classList.contains('dark');
  const svgImages = document.querySelectorAll('img[src*="logo-full.svg"]') as NodeListOf<HTMLImageElement>;
  
  svgImages.forEach((img) => {
    // Bereinige alte Blob-URLs
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src);
    }
    
    // Lade das SVG direkt von der Datei
    fetch('/logo-full.svg')
      .then((response) => response.text())
      .then((svgText) => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = svgDoc.documentElement;
        
        // Finde Text-Elemente
        const textElements = svgElement.querySelectorAll('.logo-text, .logo-subtext');
        textElements.forEach((text) => {
          if (isDark) {
            text.setAttribute('fill', '#f8fafc'); // Light text in dark mode
          } else {
            text.setAttribute('fill', '#1a1a1a'); // Dark text in light mode
          }
        });
        
        // Konvertiere zurück zu String und setze als src
        const serializer = new XMLSerializer();
        const updatedSvg = serializer.serializeToString(svgElement);
        const blob = new Blob([updatedSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        img.src = url;
      })
      .catch((error) => {
        console.error('Fehler beim Aktualisieren des SVG-Themes:', error);
      });
  });
}

/**
 * Initialisiert Theme-Listener für SVG-Updates
 */
export function initSvgThemeListener() {
  // Initiale Aktualisierung
  updateSvgTheme();
  
  // Beobachte Änderungen an der dark-Klasse
  const observer = new MutationObserver(() => {
    updateSvgTheme();
  });
  
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
}

