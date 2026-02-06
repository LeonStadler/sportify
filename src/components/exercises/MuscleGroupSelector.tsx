import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getExerciseMuscleGroupLabel } from "@/components/exercises/exerciseLabels";

type MuscleGroupTree = Array<{
  label: string;
  children: string[];
}>;

interface MuscleGroupSelectorProps {
  value: string[];
  onChange: (next: string[]) => void;
  groups: MuscleGroupTree;
  placeholder?: string;
}

export function MuscleGroupSelector({
  value,
  onChange,
  groups,
  placeholder,
}: MuscleGroupSelectorProps) {
  const { t } = useTranslation();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const selectedSet = useMemo(() => new Set(value), [value]);

  const toggleGroup = (label: string, children: string[]) => {
    const allSelected = children.every((child) => selectedSet.has(child));
    if (allSelected) {
      onChange(value.filter((item) => !children.includes(item)));
    } else {
      const next = new Set(value);
      children.forEach((child) => next.add(child));
      onChange(Array.from(next));
    }
  };

  const toggleChild = (child: string) => {
    if (selectedSet.has(child)) {
      onChange(value.filter((item) => item !== child));
    } else {
      onChange([...value, child]);
    }
  };

  const clearAll = () => onChange([]);

  const labelText =
    value.length > 0
      ? value.map((item) => getExerciseMuscleGroupLabel(item, t)).join(", ")
      : placeholder || t("exerciseLibrary.muscleGroupsPlaceholder", "Muskelgruppen auswählen");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between h-9 max-w-full overflow-hidden"
        >
          <span className="truncate text-left">{labelText}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[280px] p-3 z-[300] max-h-80 overflow-auto"
        align="start"
        side="bottom"
        collisionPadding={16}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-muted-foreground">
            {t("exerciseLibrary.muscleGroups", "Muskelgruppen")}
          </div>
          <Button variant="ghost" size="sm" onClick={clearAll}>
            {t("filters.reset", "Zurücksetzen")}
          </Button>
        </div>
        <div className="space-y-2">
          {groups.map((group) => {
            const allSelected = group.children.every((child) => selectedSet.has(child));
            const someSelected = group.children.some((child) => selectedSet.has(child));
            const isOpen = openGroups[group.label] ?? false;
            const isSingle = group.children.length === 1 && group.children[0] === group.label;
            return (
              <div key={group.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "indeterminate" : false}
                      onCheckedChange={() => toggleGroup(group.label, group.children)}
                    />
                    <span className="font-medium">
                      {getExerciseMuscleGroupLabel(group.label, t)}
                    </span>
                  </label>
                  {!isSingle && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={() =>
                        setOpenGroups((prev) => ({
                          ...prev,
                          [group.label]: !isOpen,
                        }))
                      }
                    >
                      {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                {!isSingle && isOpen && (
                  <div className="pl-6 space-y-1">
                    {group.children.map((child) => (
                      <label key={child} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox
                          checked={selectedSet.has(child)}
                          onCheckedChange={() => toggleChild(child)}
                        />
                        {getExerciseMuscleGroupLabel(child, t)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
