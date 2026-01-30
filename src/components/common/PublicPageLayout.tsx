import { cn } from "@/lib/utils";
import { ReactNode } from "react";

/**
 * Wrapper for all public (unauthenticated) pages so they can scroll despite
 * html/body having overflow: hidden in global CSS (used by the app layout).
 * Use this once per page; do not add h-screen/overflow-y-auto on the page itself.
 */
interface PublicPageLayoutProps {
  children: ReactNode;
  className?: string;
  lang?: string;
}

export function PublicPageLayout({
  children,
  className,
  lang,
}: PublicPageLayoutProps) {
  return (
    <div
      className={cn("h-screen overflow-y-auto", className)}
      {...(lang ? { lang } : {})}
    >
      {children}
    </div>
  );
}
