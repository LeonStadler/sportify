import { useEffect, useState } from "react";

interface NavigatorStandalone extends Navigator {
  standalone?: boolean;
}

interface PWAState {
  /** Ob die App als PWA installiert und im standalone Modus läuft */
  isPWA: boolean;
  /** Ob es sich um ein mobiles Gerät handelt */
  isMobile: boolean;
  /** Ob die App als Mobile PWA läuft (installiert + mobile) */
  isMobilePWA: boolean;
  /** Ob es sich um ein iOS-Gerät handelt */
  isIOS: boolean;
  /** Ob es sich um ein Android-Gerät handelt */
  isAndroid: boolean;
}

export function usePWA(): PWAState {
  const [state, setState] = useState<PWAState>({
    isPWA: false,
    isMobile: false,
    isMobilePWA: false,
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    const checkPWA = () => {
      // Prüfe ob im Standalone-Modus (installiert)
      const isStandalone = window.matchMedia(
        "(display-mode: standalone)"
      ).matches;

      // iOS Standalone Mode
      const isIOSStandalone =
        (window.navigator as NavigatorStandalone).standalone === true;

      // Geräteerkennung
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      const isPWA = isStandalone || isIOSStandalone;

      setState({
        isPWA,
        isMobile,
        isMobilePWA: isPWA && isMobile,
        isIOS,
        isAndroid,
      });
    };

    checkPWA();

    // Listener für display-mode Änderungen
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = () => checkPWA();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  return state;
}
