import { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDown, ArrowUp, MoreHorizontal } from "lucide-react";

export interface TemplateBrowseItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  discipline?: string | null;
  movementPattern?: string | null;
  visibility?: "private" | "friends" | "public";
  difficulty?: number | null;
  muscleGroups?: string[] | null;
  activitiesCount: number;
  usageCount: number;
  ownerName: string;
  isOwn: boolean;
  updatedAt?: string;
}

export interface TemplateBrowseLabels {
  title: string;
  owner: string;
  visibility: string;
  category: string;
  discipline: string;
  difficulty: string;
  muscleGroups: string;
  usageCount: string;
  activities: string;
}

interface TemplateBrowseGridProps {
  items: TemplateBrowseItem[];
  onSelect: (item: TemplateBrowseItem) => void;
  renderMenuItems: (item: TemplateBrowseItem) => ReactNode;
  labels: TemplateBrowseLabels;
}

const visibilityBadgeClass = (visibility?: string) => {
  switch (visibility) {
    case "public":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "friends":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const visibilityLabel = (visibility: string | undefined) => {
  switch (visibility) {
    case "public":
      return "Public";
    case "friends":
      return "Friends";
    default:
      return "Private";
  }
};

export function TemplateBrowseGrid({
  items,
  onSelect,
  renderMenuItems,
  labels,
}: TemplateBrowseGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((template) => (
        <div
          key={template.id}
          className="border rounded-xl p-4 flex flex-col h-full bg-background/60 cursor-pointer"
          onClick={() => onSelect(template)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-semibold truncate">{template.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {template.ownerName}
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
                  {renderMenuItems(template)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Badge variant="secondary" className={visibilityBadgeClass(template.visibility)}>
              {visibilityLabel(template.visibility)}
            </Badge>
            {template.category && <Badge variant="outline">{template.category}</Badge>}
            {template.discipline && <Badge variant="outline">{template.discipline}</Badge>}
            {template.difficulty !== null && template.difficulty !== undefined && (
              <Badge variant="outline">
                {labels.difficulty}: {template.difficulty}
              </Badge>
            )}
          </div>

          {template.description && (
            <p className="mt-3 text-xs text-muted-foreground line-clamp-2">
              {template.description}
            </p>
          )}

          {template.muscleGroups && template.muscleGroups.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {template.muscleGroups.slice(0, 3).map((group) => (
                <Badge key={group} variant="secondary">
                  {group}
                </Badge>
              ))}
              {template.muscleGroups.length > 3 && (
                <Badge variant="secondary">+{template.muscleGroups.length - 3}</Badge>
              )}
            </div>
          )}

          <div className="mt-auto pt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {labels.activities}: {template.activitiesCount}
            </span>
            <span>
              {labels.usageCount}: {template.usageCount}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TemplateBrowseTableProps {
  items: TemplateBrowseItem[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSortClick: (value: string) => void;
  onSelect: (item: TemplateBrowseItem) => void;
  renderMenuItems: (item: TemplateBrowseItem) => ReactNode;
  labels: TemplateBrowseLabels;
}

export function TemplateBrowseTable({
  items,
  sortBy,
  sortDirection,
  onSortClick,
  onSelect,
  renderMenuItems,
  labels,
}: TemplateBrowseTableProps) {
  const sortIcon = sortDirection === "asc" ? (
    <ArrowUp className="h-3 w-3" />
  ) : (
    <ArrowDown className="h-3 w-3" />
  );

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-background">
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("title")}
              >
                {labels.title}
                {sortBy === "title" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("owner")}
              >
                {labels.owner}
                {sortBy === "owner" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("visibility")}
              >
                {labels.visibility}
                {sortBy === "visibility" && sortIcon}
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
                onClick={() => onSortClick("difficulty")}
              >
                {labels.difficulty}
                {sortBy === "difficulty" && sortIcon}
              </button>
            </TableHead>
            <TableHead>
              <button
                className="inline-flex items-center gap-1 text-left"
                onClick={() => onSortClick("usage")}
              >
                {labels.usageCount}
                {sortBy === "usage" && sortIcon}
              </button>
            </TableHead>
            <TableHead>{labels.activities}</TableHead>
            <TableHead className="sticky right-0 z-10 bg-background text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((template) => (
            <TableRow
              key={template.id}
              className="cursor-pointer"
              onClick={() => onSelect(template)}
            >
              <TableCell className="font-medium sticky left-0 bg-background z-10">
                {template.title}
              </TableCell>
              <TableCell>{template.ownerName}</TableCell>
              <TableCell>
                <Badge variant="secondary" className={visibilityBadgeClass(template.visibility)}>
                  {visibilityLabel(template.visibility)}
                </Badge>
              </TableCell>
              <TableCell>{template.category || "-"}</TableCell>
              <TableCell>
                {template.difficulty !== null && template.difficulty !== undefined
                  ? template.difficulty
                  : "-"}
              </TableCell>
              <TableCell>{template.usageCount}</TableCell>
              <TableCell>{template.activitiesCount}</TableCell>
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
                    {renderMenuItems(template)}
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
