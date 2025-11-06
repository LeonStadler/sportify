
import { PageTemplate } from "@/components/PageTemplate";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Award, Calendar, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function Stats() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetrics, setSelectedMetrics] = useState(["pullups", "pushups"]);

  const weeklyData = [
    { day: "Mon", pullups: 12, pushups: 40, running: 3.2, cycling: 8.5 },
    { day: "Tue", pullups: 15, pushups: 45, running: 0, cycling: 12.1 },
    { day: "Wed", pullups: 8, pushups: 30, running: 5.1, cycling: 0 },
    { day: "Thu", pullups: 18, pushups: 55, running: 2.8, cycling: 15.3 },
    { day: "Fri", pullups: 14, pushups: 42, running: 4.2, cycling: 9.8 },
    { day: "Sat", pullups: 20, pushups: 60, running: 7.5, cycling: 18.2 },
    { day: "Sun", pullups: 10, pushups: 35, running: 3.1, cycling: 6.4 },
  ];

  const monthlyData = [
    { week: "Week 1", pullups: 85, pushups: 320, running: 22.1, cycling: 65.2 },
    { week: "Week 2", pullups: 92, pushups: 355, running: 18.3, cycling: 78.4 },
    { week: "Week 3", pullups: 78, pushups: 298, running: 25.7, cycling: 82.1 },
    { week: "Week 4", pullups: 97, pushups: 387, running: 29.2, cycling: 94.3 },
  ];

  const progressData = [
    { week: t('stats.week1', 'Week 1'), score: 1650 },
    { week: t('stats.week2', 'Week 2'), score: 1720 },
    { week: t('stats.week3', 'Week 3'), score: 1850 },
    { week: t('stats.week4', 'Week 4'), score: 1980 },
  ];

  const activityDistribution = [
    { name: t('stats.pullups', 'Pull-ups'), value: 30, color: "#3b82f6" },
    { name: t('stats.pushups', 'Push-ups'), value: 25, color: "#ef4444" },
    { name: t('stats.running', 'Running'), value: 25, color: "#22c55e" },
    { name: t('stats.cycling', 'Cycling'), value: 20, color: "#8b5cf6" },
  ];

  const currentData = timeRange === "week" ? weeklyData : monthlyData;

  const metricColors = {
    pullups: "#3b82f6",
    pushups: "#ef4444",
    running: "#22c55e",
    cycling: "#8b5cf6"
  };

  const metricNames = {
    pullups: t('stats.pullups', 'Pull-ups'),
    pushups: t('stats.pushups', 'Push-ups'),
    running: t('stats.runningKm', 'Running (km)'),
    cycling: t('stats.cyclingKm', 'Cycling (km)')
  };

  return (
    <PageTemplate
      title={t('stats.title', 'Statistics')}
      subtitle={t('stats.subtitle', 'Detailed analysis of your athletic performance')}
      headerActions={
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{t('stats.thisWeek', 'This Week')}</SelectItem>
            <SelectItem value="month">{t('stats.thisMonth', 'This Month')}</SelectItem>
            <SelectItem value="quarter">{t('stats.thisQuarter', 'This Quarter')}</SelectItem>
          </SelectContent>
        </Select>
      }
      className="space-y-4 md:space-y-6"
    >
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-end">
        <div className="flex flex-wrap gap-2">
          {Object.entries(metricNames).map(([key, name]) => (
            <Button
              key={key}
              variant={selectedMetrics.includes(key) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (selectedMetrics.includes(key)) {
                  setSelectedMetrics(selectedMetrics.filter(m => m !== key));
                } else {
                  setSelectedMetrics([...selectedMetrics, key]);
                }
              }}
              className={selectedMetrics.includes(key) ? 'text-white' : ''}
              style={selectedMetrics.includes(key) ? { backgroundColor: metricColors[key] } : {}}
            >
              {name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">{t('stats.overview', 'Overview')}</TabsTrigger>
          <TabsTrigger value="trends">{t('stats.trends', 'Trends')}</TabsTrigger>
          <TabsTrigger value="records">{t('stats.records', 'Records')}</TabsTrigger>
          <TabsTrigger value="distribution">{t('stats.distribution', 'Distribution')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Main Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {timeRange === "week" ? t('stats.weeklyActivity', 'Weekly Activity') : t('stats.monthlyActivity', 'Monthly Activity')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={timeRange === "week" ? "day" : "week"} />
                    <YAxis />
                    <Tooltip />
                    {selectedMetrics.map(metric => (
                      <Bar
                        key={metric}
                        dataKey={metric}
                        fill={metricColors[metric]}
                        name={metricNames[metric]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  {t('stats.progress', 'Progress')} ({t('stats.totalPoints', 'Total Points')})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#f97316"
                      strokeWidth={3}
                      name={t('stats.points', 'Points')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.weeklyStatistics', 'Weekly Statistics')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">97</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.pullups', 'Pull-ups')}</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">387</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.pushups', 'Push-ups')}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">29.2</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.kmRunning', 'km Running')}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">94.3</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('stats.kmCycling', 'km Cycling')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.strengthTrainingTrend', 'Strength Training Trend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name={t('stats.strengthPoints', 'Strength Points')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('stats.enduranceTrend', 'Endurance Trend')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} name={t('stats.endurancePoints', 'Endurance Points')} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                {t('stats.personalRecords', 'Personal Records')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">{t('stats.pullups', 'Pull-ups')}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{t('stats.onSaturday', 'on Saturday')}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">20</p>
                </div>

                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="font-medium text-red-900 dark:text-red-100">{t('stats.pushups', 'Push-ups')}</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{t('stats.onSaturday', 'on Saturday')}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">60</p>
                </div>

                <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏃</span>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">{t('stats.longestRun', 'Longest Run')}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">{t('stats.onSaturday', 'on Saturday')}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">7.5</p>
                </div>

                <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚴</span>
                    <div>
                      <p className="font-medium text-purple-900 dark:text-purple-100">{t('stats.longestRide', 'Longest Ride')}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{t('stats.onSaturday', 'on Saturday')}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">18.2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('stats.activityDistribution', 'Activity Distribution')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={activityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {activityDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t('stats.trainingIntensity', 'Training Intensity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: t('stats.monday', 'Monday'), intensity: 85, color: "bg-red-500" },
                    { day: t('stats.tuesday', 'Tuesday'), intensity: 70, color: "bg-yellow-500" },
                    { day: t('stats.wednesday', 'Wednesday'), intensity: 45, color: "bg-green-500" },
                    { day: t('stats.thursday', 'Thursday'), intensity: 95, color: "bg-red-500" },
                    { day: t('stats.friday', 'Friday'), intensity: 65, color: "bg-yellow-500" },
                    { day: t('stats.saturday', 'Saturday'), intensity: 100, color: "bg-red-600" },
                    { day: t('stats.sunday', 'Sunday'), intensity: 30, color: "bg-green-500" },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600 dark:text-gray-400">{day.day}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${day.color}`}
                          style={{ width: `${day.intensity}%` }}
                        />
                      </div>
                      <span className="w-10 text-sm font-medium">{day.intensity}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
