import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowUp, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SortOption {
  value: string;
  label: string;
}

interface SearchFilterToolbarProps {
  query: string;
  onQueryChange: (value: string) => void;
  viewMode?: "grid" | "table";
  onViewModeChange?: (mode: "grid" | "table") => void;
  filtersOpen?: boolean;
  onToggleFilters?: () => void;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  onSortByChange?: (value: string) => void;
  onSortDirectionToggle?: () => void;
  sortOptions?: SortOption[];
}

export function SearchFilterToolbar({
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
}: SearchFilterToolbarProps) {
  const { t } = useTranslation();
  const hasViewToggle = Boolean(viewMode && onViewModeChange);
  const hasFiltersToggle = Boolean(onToggleFilters);
  const hasSort = Boolean(sortBy && onSortByChange && sortOptions && sortOptions.length > 0);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={t("common.search", "Suche")}
          className="flex-1 min-w-[220px]"
        />
        {hasViewToggle && (
          <div className="flex w-full gap-2 sm:w-auto">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange?.("grid")}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="mr-2 h-4 w-4" />
              Grid
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => onViewModeChange?.("table")}
              className="flex-1 sm:flex-none"
            >
              <List className="mr-2 h-4 w-4" />
              Tabelle
            </Button>
          </div>
        )}
      </div>

      {(hasFiltersToggle || hasSort) && (
        <div className="flex flex-wrap items-center gap-2">
          {hasFiltersToggle ? (
            <Button
              variant={filtersOpen ? "default" : "outline"}
              size="sm"
              onClick={onToggleFilters}
              className="w-full sm:w-auto"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              {filtersOpen ? t("filters.hide", "Filter ausblenden") : t("filters.show", "Filter")}
            </Button>
          ) : (
            <div />
          )}

          {hasSort && (
            <div className="flex flex-nowrap items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <span className="text-xs text-muted-foreground">{t("filters.sort", "Sortieren")}</span>
              <Select value={sortBy} onValueChange={(next) => onSortByChange?.(next)}>
                <SelectTrigger className="w-full sm:w-[180px] flex-1 sm:flex-none min-w-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions?.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={onSortDirectionToggle}
                disabled={sortBy === "none"}
              >
                {sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
