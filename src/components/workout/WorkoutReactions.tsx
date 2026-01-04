import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { createReaction, removeReaction } from "@/services/reactions";
import type { WorkoutReaction } from "@/types/workout";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const emojiOptions = ["👍", "❤️", "🔥", "💪", "🎉", "😊"];

interface WorkoutReactionsProps {
  workoutId: string;
  reactions?: WorkoutReaction[];
  isOwnWorkout?: boolean;
  onReactionChange?: (reactions: WorkoutReaction[]) => void;
}

const getCurrentUserReaction = (
  reactions: WorkoutReaction[],
  userId?: string
) => {
  if (!reactions.length) {
    return null;
  }

  const explicit = reactions.find((reaction) => reaction.currentUserReaction);
  if (explicit?.currentUserReaction) {
    return explicit.currentUserReaction;
  }

  if (userId) {
    const match = reactions.find((reaction) =>
      reaction.users?.some((user) => user.id === userId)
    );
    return match?.emoji ?? null;
  }

  return null;
};

export const WorkoutReactions = ({
  workoutId,
  reactions = [],
  isOwnWorkout = false,
  onReactionChange,
}: WorkoutReactionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [localReactions, setLocalReactions] = useState(reactions);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalReactions(reactions);
  }, [reactions]);

  const currentReaction = useMemo(
    () => getCurrentUserReaction(localReactions, user?.id),
    [localReactions, user?.id]
  );

  const updateReactions = (nextReactions: WorkoutReaction[]) => {
    setLocalReactions(nextReactions);
    onReactionChange?.(nextReactions);
  };

  const handleReactionChange = async (emoji: string) => {
    if (isOwnWorkout || isSaving) {
      return;
    }

    if (!user?.id) {
      toast({
        title: t("reactions.errorTitle", "Fehler"),
        description: t("reactions.loginRequired", "Bitte melde dich an."),
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const nextReactions =
        currentReaction === emoji
          ? await removeReaction(workoutId)
          : await createReaction(workoutId, emoji);
      updateReactions(nextReactions);
    } catch (error: any) {
      console.error("Error updating reaction:", error);
      toast({
        title: t("reactions.errorTitle", "Fehler"),
        description:
          error?.message || t("reactions.errorMessage", "Aktion fehlgeschlagen."),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {localReactions.map((reaction) => {
        const isActive = reaction.emoji === currentReaction;
        // Only show names if users array is populated (owner allows it)
        const content =
          reaction.users && reaction.users.length > 0
            ? reaction.users.map((user) => user.name).join(", ")
            : reaction.count > 0
            ? t("reactions.countOnly", "{{count}} Reaktionen", { count: reaction.count })
            : t("reactions.noReactions", "Noch keine Reaktionen");

        return (
          <HoverCard key={reaction.emoji}>
            <HoverCardTrigger asChild>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className={cn(
                  "rounded-full px-2 py-1 text-sm font-medium",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                )}
                onClick={() => handleReactionChange(reaction.emoji)}
                disabled={isOwnWorkout || isSaving}
                aria-label={t("reactions.reactWith", {
                  emoji: reaction.emoji,
                  defaultValue: "Mit {{emoji}} reagieren",
                })}
              >
                <span className="text-base">{reaction.emoji}</span>
                <span className="ml-1">{reaction.count}</span>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="max-w-xs text-sm">
              {content}
            </HoverCardContent>
          </HoverCard>
        );
      })}

      {!isOwnWorkout && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="rounded-full border border-dashed border-muted-foreground/40 px-2 py-1 text-sm"
              disabled={isSaving}
              aria-label={t("reactions.openPicker", "Reaktion auswählen")}
            >
              {currentReaction || "＋"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex items-center gap-2">
              {emojiOptions.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-10 w-10 rounded-full p-0 text-lg",
                    currentReaction === emoji && "bg-muted"
                  )}
                  onClick={() => handleReactionChange(emoji)}
                  disabled={isSaving}
                  aria-label={t("reactions.reactWith", {
                    emoji,
                    defaultValue: "Mit {{emoji}} reagieren",
                  })}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};
