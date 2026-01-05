import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface WidgetFooterButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  ariaLabel?: string;
  asChild?: boolean;
}

export function WidgetFooterButton({
  children,
  className,
  onClick,
  ariaLabel,
  asChild = false,
}: WidgetFooterButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn("w-full justify-center gap-2", className)}
      onClick={onClick}
      aria-label={ariaLabel}
      asChild={asChild}
    >
      {children}
    </Button>
  );
}
