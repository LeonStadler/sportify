import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const childCount = React.Children.count(children);

  // Versuche zunächst, alle Tabs in einer Zeile zu halten
  // Die flex-basis wird so berechnet, dass alle Tabs gleichmäßig verteilt werden
  const gapSize = 0.25; // gap-1 = 0.25rem
  const paddingSize = 0.25; // p-1 = 0.25rem

  // Berechne flex-basis basierend auf der Gesamtzahl der Tabs
  // Dies versucht, alle Tabs in einer Zeile zu halten
  const totalGaps = (childCount - 1) * gapSize;
  const totalPadding = paddingSize * 2;
  const flexBasis = `calc((100% - ${totalGaps}rem - ${totalPadding}rem) / ${childCount})`;

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(
        "flex h-auto flex-wrap items-center justify-center rounded-md bg-muted p-1 text-muted-foreground gap-1 w-full",
        className
      )}
      style={
        {
          "--tabs-flex-basis": flexBasis,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </TabsPrimitive.List>
  );
});
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, style, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1 min-w-fit",
      className
    )}
    style={{
      flexBasis: "var(--tabs-flex-basis, auto)",
      minWidth: "fit-content",
      ...style,
    }}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsContent, TabsList, TabsTrigger };
