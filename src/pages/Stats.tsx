
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Calendar, TrendingUp, Award, Activity } from "lucide-react";
import { useState } from "react";

export function Stats() {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedMetrics, setSelectedMetrics] = useState(["pullups", "pushups"]);

  const weeklyData = [
    { day: "Mo", pullups: 12, pushups: 40, running: 3.2, cycling: 8.5 },
    { day: "Di", pullups: 15, pushups: 45, running: 0, cycling: 12.1 },
    { day: "Mi", pullups: 8, pushups: 30, running: 5.1, cycling: 0 },
    { day: "Do", pullups: 18, pushups: 55, running: 2.8, cycling: 15.3 },
    { day: "Fr", pullups: 14, pushups: 42, running: 4.2, cycling: 9.8 },
    { day: "Sa", pullups: 20, pushups: 60, running: 7.5, cycling: 18.2 },
    { day: "So", pullups: 10, pushups: 35, running: 3.1, cycling: 6.4 },
  ];

  const monthlyData = [
    { week: "KW 1", pullups: 85, pushups: 320, running: 22.1, cycling: 65.2 },
    { week: "KW 2", pullups: 92, pushups: 355, running: 18.3, cycling: 78.4 },
    { week: "KW 3", pullups: 78, pushups: 298, running: 25.7, cycling: 82.1 },
    { week: "KW 4", pullups: 97, pushups: 387, running: 29.2, cycling: 94.3 },
  ];

  const progressData = [
    { week: "Woche 1", score: 1650 },
    { week: "Woche 2", score: 1720 },
    { week: "Woche 3", score: 1850 },
    { week: "Woche 4", score: 1980 },
  ];

  const activityDistribution = [
    { name: "Klimmzüge", value: 30, color: "#3b82f6" },
    { name: "Liegestütze", value: 25, color: "#ef4444" },
    { name: "Laufen", value: 25, color: "#22c55e" },
    { name: "Radfahren", value: 20, color: "#8b5cf6" },
  ];

  const currentData = timeRange === "week" ? weeklyData : monthlyData;

  const metricColors = {
    pullups: "#3b82f6",
    pushups: "#ef4444", 
    running: "#22c55e",
    cycling: "#8b5cf6"
  };

  const metricNames = {
    pullups: "Klimmzüge",
    pushups: "Liegestütze",
    running: "Laufen (km)",
    cycling: "Radfahren (km)"
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Statistiken</h1>
        <p className="text-gray-600 mt-2">Detaillierte Analyse deiner sportlichen Leistungen</p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="quarter">Dieses Quartal</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="records">Rekorde</TabsTrigger>
          <TabsTrigger value="distribution">Verteilung</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
            {/* Main Chart */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  {timeRange === "week" ? "Wöchentliche" : "Monatliche"} Aktivität
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
                  Fortschritt (Gesamtpunkte)
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
                      name="Punkte"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Wochenstatistiken</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">97</p>
                    <p className="text-sm text-gray-600">Klimmzüge</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">387</p>
                    <p className="text-sm text-gray-600">Liegestütze</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">29.2</p>
                    <p className="text-sm text-gray-600">km Laufen</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">94.3</p>
                    <p className="text-sm text-gray-600">km Radfahren</p>
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
                <CardTitle>Kraft-Training Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} name="Kraft-Punkte" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ausdauer Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} name="Ausdauer-Punkte" />
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
                Persönliche Rekorde
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💪</span>
                    <div>
                      <p className="font-medium text-blue-900">Klimmzüge</p>
                      <p className="text-sm text-blue-600">am Samstag</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">20</p>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="font-medium text-red-900">Liegestütze</p>
                      <p className="text-sm text-red-600">am Samstag</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-red-600">60</p>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🏃</span>
                    <div>
                      <p className="font-medium text-green-900">Längster Lauf</p>
                      <p className="text-sm text-green-600">am Samstag</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-green-600">7.5</p>
                </div>
                
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🚴</span>
                    <div>
                      <p className="font-medium text-purple-900">Längste Tour</p>
                      <p className="text-sm text-purple-600">am Samstag</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">18.2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4 md:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Aktivitätsverteilung</CardTitle>
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
                <CardTitle>Training Intensität</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { day: "Montag", intensity: 85, color: "bg-red-500" },
                    { day: "Dienstag", intensity: 70, color: "bg-yellow-500" },
                    { day: "Mittwoch", intensity: 45, color: "bg-green-500" },
                    { day: "Donnerstag", intensity: 95, color: "bg-red-500" },
                    { day: "Freitag", intensity: 65, color: "bg-yellow-500" },
                    { day: "Samstag", intensity: 100, color: "bg-red-600" },
                    { day: "Sonntag", intensity: 30, color: "bg-green-500" },
                  ].map((day) => (
                    <div key={day.day} className="flex items-center gap-3">
                      <span className="w-20 text-sm text-gray-600">{day.day}</span>
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
    </div>
  );
}
