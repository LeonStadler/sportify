import { PageTemplate } from "@/components/common/PageTemplate";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { GlobalRankingWarningDialog } from "@/components/ranking/GlobalRankingWarningDialog";
import { ScoreboardTable } from "@/components/ranking/ScoreboardTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getNormalizedRange, getRangeForPeriod } from "@/utils/dateRanges";
import { ChevronDown, Eye, EyeOff, Globe, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { useTranslation } from "react-i18next";

export function Scoreboard() {
  const { user, updateProfile } = useAuth();
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [scope, setScope] = useState("friends");
  const [period, setPeriod] = useState("all");
  const [customRange, setCustomRange] = useState<DateRange | undefined>();
  const [offset, setOffset] = useState(0);
  const [showInGlobalRankings, setShowInGlobalRankings] = useState(
    user?.showInGlobalRankings ?? true
  );
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  useEffect(() => {
    if (user) {
      setShowInGlobalRankings(user.showInGlobalRankings ?? true);
    }
  }, [user]);

  const handleGlobalRankingToggle = (checked: boolean) => {
    if (!checked) {
      setShowWarningDialog(true);
    } else {
      performGlobalRankingUpdate(true);
    }
  };

  const performGlobalRankingUpdate = async (checked: boolean) => {
    setShowInGlobalRankings(checked);
    try {
      await updateProfile(
        {
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          nickname: user?.nickname || "",
          displayPreference: user?.displayPreference || "firstName",
          showInGlobalRankings: checked,
        },
        true
      );
      toast({
        title: t("settings.saved", "Gespeichert"),
        description: t(
          "settings.settingSaved",
          "{{setting}} wurde aktualisiert.",
          { setting: "Sichtbarkeit in globaler Rangliste" }
        ),
      });
    } catch (error) {
      setShowInGlobalRankings(!checked); // Revert on error
      toast({
        title: t("common.error", "Fehler"),
        description:
          error instanceof Error
            ? error.message
            : t("settings.saveError", "Fehler beim Speichern"),
        variant: "destructive",
      });
    }
  };

  const activityTypes = useMemo(
    () => [
      { id: "all", name: t("scoreboard.activityTypes.all"), icon: "🏆" },
      {
        id: "pullups",
        name: t("scoreboard.activityTypes.pullups"),
        icon: "💪",
      },
      {
        id: "pushups",
        name: t("scoreboard.activityTypes.pushups"),
        icon: "🔥",
      },
      {
        id: "running",
        name: t("scoreboard.activityTypes.running"),
        icon: "🏃",
      },
      {
        id: "cycling",
        name: t("scoreboard.activityTypes.cycling"),
        icon: "🚴",
      },
      { id: "situps", name: t("scoreboard.activityTypes.situps"), icon: "🚀" },
    ],
    [t]
  );

  const formatDate = (date: Date) =>
    date.toLocaleDateString(i18n.language === "en" ? "en-US" : "de-DE");

  const resolvedRange = useMemo(
    () => getNormalizedRange(getRangeForPeriod(period, customRange, offset)),
    [customRange, period, offset]
  );
  const effectivePeriod = offset > 0 && period !== "custom" ? "custom" : period;

  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    setOffset(0);
    if (value !== "custom") {
      setCustomRange(undefined);
    }
  };

  const handleRangeChange = (range: DateRange | undefined) => {
    setCustomRange(range);
    if (range?.from && range?.to) {
      setPeriod("custom");
      setOffset(0);
    }
  };

  const handleOffsetChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const activePeriodLabel =
    effectivePeriod === "custom" && resolvedRange?.from && resolvedRange?.to
      ? `${formatDate(resolvedRange.from)} → ${formatDate(resolvedRange.to)}`
      : (() => {
        switch (period) {
          case "all":
            return t("filters.period.all");
          case "week":
            return t("filters.period.week");
          case "month":
            return t("filters.period.month");
          case "year":
            return t("filters.period.year");
          default:
            return t("filters.period.custom");
        }
      })();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t("scoreboard.mustBeLoggedIn")}</p>
      </div>
    );
  }

  return (
    <PageTemplate
      title={t("scoreboard.title", "Rangliste")}
      subtitle={t("scoreboard.subtitle", "Vergleiche dich mit anderen")}
      headerActions={
        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <TimeRangeFilter
            period={period}
            range={customRange}
            offset={offset}
            onPeriodChange={handlePeriodChange}
            onRangeChange={handleRangeChange}
            onOffsetChange={handleOffsetChange}
            t={t}
            locale={i18n.language}
            presets={[
              { value: "all", label: t("filters.period.all") },
              { value: "week", label: t("filters.period.week") },
              { value: "month", label: t("filters.period.month") },
              { value: "year", label: t("filters.period.year") },
              { value: "custom", label: t("filters.period.custom") },
            ]}
            formatDate={formatDate}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[140px] justify-between">
                <div className="flex items-center gap-2">
                  {scope === "friends" ? (
                    <>
                      <Users className="h-4 w-4" />
                      <span>{t("scoreboard.scope.friends", "Freunde")}</span>
                    </>
                  ) : (
                    <>
                      <Globe className="h-4 w-4" />
                      <span>{t("scoreboard.scope.global", "Global")}</span>
                    </>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Ansicht</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={scope} onValueChange={setScope}>
                <DropdownMenuRadioItem value="friends">
                  <Users className="mr-2 h-4 w-4" />
                  {t("scoreboard.scope.friends", "Freunde")}
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="global">
                  <Globe className="mr-2 h-4 w-4" />
                  {t("scoreboard.scope.global", "Global")}
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Einstellungen</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={showInGlobalRankings}
                onCheckedChange={handleGlobalRankingToggle}
                className="justify-between"
              >
                <div className="flex items-center gap-2">
                  {showInGlobalRankings ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>In globaler Rangliste anzeigen</span>
                </div>
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <GlobalRankingWarningDialog
            open={showWarningDialog}
            onOpenChange={setShowWarningDialog}
            onConfirm={() => performGlobalRankingUpdate(false)}
          />
        </div>
      }
      className="space-y-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          {activityTypes.map((activity) => (
            <TabsTrigger key={activity.id} value={activity.id}>
              <span className="mr-1.5">{activity.icon}</span>
              <span>{activity.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {activityTypes.map((activity) => (
          <TabsContent key={activity.id} value={activity.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {activity.icon} {activity.name} {t("scoreboard.leaderboard")} ({activePeriodLabel})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScoreboardTable
                  activity={activity.id}
                  period={effectivePeriod}
                  dateRange={resolvedRange}
                  scope={scope}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </PageTemplate>
  );
}
