import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
  disabled?: boolean;
  pageSize?: number;
  labels?: {
    previous?: string;
    next?: string;
    page?: (current: number, total: number) => string;
    summary?: (start: number, end: number, total?: number) => string;
  };
}

export function PaginationControls({
  pagination,
  onPageChange,
  className,
  disabled,
  pageSize,
  labels,
}: PaginationControlsProps) {
  const { currentPage, totalPages, totalItems, hasNext, hasPrev } = pagination;

  const effectivePageSize =
    pageSize ??
    (totalItems && totalPages > 0 ? Math.ceil(totalItems / totalPages) : undefined);
  const startItem =
    effectivePageSize && totalItems !== undefined
      ? Math.min((currentPage - 1) * effectivePageSize + 1, totalItems)
      : null;
  const endItem =
    effectivePageSize && totalItems !== undefined
      ? Math.min(currentPage * effectivePageSize, totalItems)
      : null;

  const summaryLabel =
    labels?.summary && startItem !== null && endItem !== null
      ? labels.summary(startItem, endItem, totalItems)
      : startItem !== null && endItem !== null && totalItems !== undefined
        ? `${startItem}–${endItem} / ${totalItems}`
        : labels?.page
          ? labels.page(currentPage, totalPages)
          : `Page ${currentPage} / ${totalPages}`;

  const previousLabel = labels?.previous ?? "Previous";
  const nextLabel = labels?.next ?? "Next";

  const handlePrev = () => {
    if (disabled || currentPage <= 1 || (!hasPrev && currentPage <= 1)) return;
    onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (
      disabled ||
      currentPage >= totalPages ||
      (!hasNext && currentPage >= totalPages)
    )
      return;
    onPageChange(currentPage + 1);
  };

  return (
    <div className={cn("flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between", className)}>
      <div className="text-xs text-muted-foreground sm:text-sm">{summaryLabel}</div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          disabled={disabled || (!hasPrev && currentPage <= 1)}
          className="text-xs sm:text-sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          {previousLabel}
        </Button>
        <div className="text-xs text-muted-foreground sm:text-sm">
          {labels?.page
            ? labels.page(currentPage, totalPages)
            : `${currentPage}/${totalPages}`}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={disabled || (!hasNext && currentPage >= totalPages)}
          className="text-xs sm:text-sm"
        >
          {nextLabel}
          <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
