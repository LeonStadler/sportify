import { Button } from "@/components/ui/button";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function MobileBurgerMenu() {
  const { toggleSidebar, openMobile, open, isMobile } = useSidebar();
  const isOpen = isMobile ? openMobile : open;

  return (
    <Button
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn(
        "lg:hidden fixed top-3 right-3 z-[60]",
        "h-12 w-12 rounded-md hover:bg-accent dark:hover:bg-accent/80",
        "transition-all duration-200 bg-transparent shadow-none border-none",
        "flex items-center justify-center"
      )}
      onClick={toggleSidebar}
      aria-label="Navigation umschalten"
      aria-expanded={isOpen}
      aria-pressed={isOpen}
      aria-controls="app-sidebar"
    >
      <span className="relative flex h-6 w-7 items-center justify-center">
        <span
          className={cn(
            "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
            isOpen ? "translate-y-0 rotate-45" : "-translate-y-[8px] rotate-0"
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-200 ease-[cubic-bezier(.4,0,.2,1)]",
            isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
          )}
        />
        <span
          className={cn(
            "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(.4,0,.2,1)]",
            isOpen ? "translate-y-0 -rotate-45" : "translate-y-[8px] rotate-0"
          )}
        />
      </span>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
