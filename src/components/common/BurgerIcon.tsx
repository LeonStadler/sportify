import { cn } from "@/lib/utils";

interface BurgerIconProps {
  isOpen?: boolean;
  className?: string;
}

export const BurgerIcon = ({ isOpen = false, className }: BurgerIconProps) => (
  <span
    className={cn("relative flex h-6 w-7 items-center justify-center", className)}
    aria-hidden="true"
  >
    <span
      className={cn(
        "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-in-out",
        isOpen ? "translate-y-0 rotate-45" : "-translate-y-[8px] rotate-0"
      )}
    />
    <span
      className={cn(
        "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-200 ease-in-out",
        isOpen ? "scale-x-0 opacity-0" : "scale-x-100 opacity-100"
      )}
    />
    <span
      className={cn(
        "absolute left-1/2 h-[1.5px] w-full -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-in-out",
        isOpen ? "translate-y-0 -rotate-45" : "translate-y-[8px] rotate-0"
      )}
    />
  </span>
);
