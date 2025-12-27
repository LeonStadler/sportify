import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface PageSizeSelectorProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function PageSizeSelector({
  pageSize,
  onPageSizeChange,
  options = [5, 10, 20, 50],
  label,
  className,
  disabled,
}: PageSizeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      )}
      <Select
        value={pageSize.toString()}
        onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
        disabled={disabled}
      >
        <SelectTrigger className="w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((size) => (
            <SelectItem key={size} value={size.toString()}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
