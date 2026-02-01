import { ReactNode } from "react";

import { SearchFilterToolbar } from "@/components/common/SearchFilterToolbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ExerciseBrowsePanelProps {
  title: string;
  query: string;
  onQueryChange: (value: string) => void;
  viewMode: "grid" | "table";
  onViewModeChange: (mode: "grid" | "table") => void;
  filtersOpen: boolean;
  onToggleFilters: () => void;
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortDirectionToggle: () => void;
  sortOptions: Array<{ value: string; label: string }>;
  filtersPanel?: ReactNode;
  loading: boolean;
  empty: boolean;
  emptyText: string;
  loadingText: string;
  grid: ReactNode;
  table: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function ExerciseBrowsePanel({
  title,
  query,
  onQueryChange,
  viewMode,
  onViewModeChange,
  filtersOpen,
  onToggleFilters,
  sortBy,
  sortDirection,
  onSortByChange,
  onSortDirectionToggle,
  sortOptions,
  filtersPanel,
  loading,
  empty,
  emptyText,
  loadingText,
  grid,
  table,
  footer,
  className,
}: ExerciseBrowsePanelProps) {
  return (
    <Card className={cn(className)}>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <CardTitle>{title}</CardTitle>
        </div>

        <SearchFilterToolbar
          query={query}
          onQueryChange={onQueryChange}
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          filtersOpen={filtersOpen}
          onToggleFilters={onToggleFilters}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortByChange={onSortByChange}
          onSortDirectionToggle={onSortDirectionToggle}
          sortOptions={sortOptions}
        />

        {filtersOpen && filtersPanel}
      </CardHeader>
      <CardContent>
        {loading && empty ? (
          <div className="text-sm text-muted-foreground">{loadingText}</div>
        ) : !loading && empty ? (
          <div className="text-sm text-muted-foreground">{emptyText}</div>
        ) : (
          <>
            {loading && (
              <div className="text-xs text-muted-foreground">{loadingText}</div>
            )}
            {viewMode === "grid" ? grid : table}
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
}
