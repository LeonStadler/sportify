import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color = "orange" }: StatCardProps) {
  const colorClasses = {
    orange: "bg-orange-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-3 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <p className="text-lg md:text-2xl font-bold text-foreground mt-1">{value}</p>
            {trend && (
              <p className="text-xs md:text-sm text-green-600 mt-1 line-clamp-2">{trend}</p>
            )}
          </div>
          <div className={`p-2 md:p-3 rounded-full ${colorClasses[color]} text-white flex-shrink-0 ml-2`}>
            <Icon size={16} className="md:w-6 md:h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

