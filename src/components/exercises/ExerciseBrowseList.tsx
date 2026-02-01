import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getExerciseCategoryLabel,
  getExerciseDisciplineLabel,
  getExerciseMuscleGroupLabel,
} from "@/components/exercises/exerciseLabels";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface ExerciseBrowseItem {
  id: string;
  name: string;
  category?: string | null;
  discipline?: string | null;
  measurementType?: string | null;
  requiresWeight?: boolean | null;
  difficultyTier?: number | null;
  supportsTime?: boolean | null;
  supportsDistance?: boolean | null;
  muscleGroups?: string[] | null;
}

export interface ExerciseBrowseLabels {
  name: string;
  category: string;
  discipline: string;
  measurement: string;
  weight: string;
  difficulty: string;
  muscleGroups: string;
  weightRequired: string;
  time: string;
  distance: string;
}

interface ExerciseBrowseGridProps {
  items: ExerciseBrowseItem[];
  onSelect: (item: ExerciseBrowseItem) => void;
  renderMenuItems: (item: ExerciseBrowseItem) => ReactNode;
  labels: ExerciseBrowseLabels;
}

export function ExerciseBrowseGrid({
  items,
  onSelect,
  renderMenuItems,
  labels,
}: ExerciseBrowseGridProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((exercise) => (
        <div
          key={exercise.id}
          className="border rounded-xl p-4 flex flex-col h-full bg-background/60"
          onClick={() => onSelect(exercise)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{exercise.name}</div>
              <div className="text-xs text-muted-foreground">
                {getExerciseCategoryLabel(exercise.category, t) || "-"} ·{" "}
                {getExerciseDisciplineLabel(exercise.discipline, t) || "-"}
              </div>
            </div>
            <div onClick={(event) => event.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {renderMenuItems(exercise)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.measurementType && (
              <Badge variant="secondary">{exercise.measurementType}</Badge>
            )}
            {exercise.difficultyTier !== null &&
              exercise.difficultyTier !== undefined && (
                <Badge variant="outline">
                  {labels.difficulty} {exercise.difficultyTier}
                </Badge>
              )}
            {exercise.requiresWeight && (
              <Badge variant="outline">{labels.weightRequired}</Badge>
            )}
            {exercise.supportsTime && <Badge variant="outline">{labels.time}</Badge>}
            {exercise.supportsDistance && (
              <Badge variant="outline">{labels.distance}</Badge>
            )}
          </div>

          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {labels.muscleGroups}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {exercise.muscleGroups.slice(0, 4).map((group) => (
                  <Badge key={group} variant="secondary">
                    {getExerciseMuscleGroupLabel(group, t)}
                  </Badge>
                ))}
                {exercise.muscleGroups.length > 4 && (
                  <Badge variant="secondary">
                    +{exercise.muscleGroups.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface ExerciseBrowseTableProps {
  items: ExerciseBrowseItem[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSortClick: (value: string) => void;
  onSelect: (item: ExerciseBrowseItem) => void;
  renderMenuItems: (item: ExerciseBrowseItem) => ReactNode;
  labels: ExerciseBrowseLabels;
}

export function ExerciseBrowseTable({
  items,
  sortBy,
  sortDirection,
  onSortClick,
  onSelect,
  renderMenuItems,
  labels,
}: ExerciseBrowseTableProps) {
  const { t } = useTranslation();
  const sortIcon = sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-background">
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("name")}
              >
                {labels.name}
                {sortBy === "name" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("category")}
              >
                {labels.category}
                {sortBy === "category" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("discipline")}
              >
                {labels.discipline}
                {sortBy === "discipline" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("measurement")}
              >
                {labels.measurement}
                {sortBy === "measurement" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("weight")}
              >
                {labels.weight}
                {sortBy === "weight" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("difficulty")}
              >
                {labels.difficulty}
                {sortBy === "difficulty" && sortIcon}
              </button>
            </TableHead>
            <TableHead className="sticky right-0 z-10 bg-background text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((exercise) => (
            <TableRow
              key={exercise.id}
              className="cursor-pointer"
              onClick={() => onSelect(exercise)}
            >
              <TableCell className="font-medium sticky left-0 bg-background z-10">
                {exercise.name}
              </TableCell>
              <TableCell>{getExerciseCategoryLabel(exercise.category, t) || "-"}</TableCell>
              <TableCell>{getExerciseDisciplineLabel(exercise.discipline, t) || "-"}</TableCell>
              <TableCell>{exercise.measurementType || "-"}</TableCell>
              <TableCell>
                {exercise.requiresWeight ? labels.weightRequired : "-"}
              </TableCell>
              <TableCell>
                {exercise.difficultyTier !== null &&
                exercise.difficultyTier !== undefined
                  ? exercise.difficultyTier
                  : "-"}
              </TableCell>
              <TableCell
                className="text-right sticky right-0 z-10 bg-background"
                onClick={(event) => event.stopPropagation()}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {renderMenuItems(exercise)}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
