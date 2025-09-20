"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface HeatMapProps {
  data: number[][];
  hourlyTotals: number[];
  dailyTotals: number[];
  totalCancellations: number;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0")
);

export function HeatMap({
  data,
  hourlyTotals,
  dailyTotals,
  totalCancellations,
}: HeatMapProps) {
  // Find max value for color intensity calculation
  const maxValue = Math.max(...data.flat());

  // Get color intensity based on value
  const getIntensity = (value: number) => {
    if (value === 0) return 0;
    return Math.max(0.1, value / maxValue);
  };

  // Get text color based on background intensity
  const getTextColor = (value: number) => {
    const intensity = getIntensity(value);
    return intensity > 0.5 ? "text-white" : "text-gray-800";
  };

  // Get color class based on intensity
  const getColorClass = (value: number) => {
    const intensity = getIntensity(value);
    const textColor = getTextColor(value);
    if (intensity === 0)
      return `bg-slate-100 hover:bg-slate-200 border-slate-200 ${textColor}`;
    if (intensity <= 0.2)
      return `bg-orange-200 hover:bg-orange-300 border-orange-300 ${textColor}`;
    if (intensity <= 0.4)
      return `bg-orange-400 hover:bg-orange-500 border-orange-400 ${textColor}`;
    if (intensity <= 0.6)
      return `bg-red-400 hover:bg-red-500 border-red-400 text-white`;
    if (intensity <= 0.8)
      return `bg-red-600 hover:bg-red-700 border-red-600 text-white`;
    return `bg-red-800 hover:bg-red-900 border-red-800 text-white`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Cancellation Heat Map
        </CardTitle>
        <CardDescription>
          Visual representation of when shifts are most likely to be canceled.
          Darker colors indicate more cancellations at that time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              Total Cancellations: <strong>{totalCancellations}</strong>
            </span>
            <span>
              Peak Hour:{" "}
              <strong>
                {HOURS[hourlyTotals.indexOf(Math.max(...hourlyTotals))]}:00
              </strong>
            </span>
            <span>
              Peak Day:{" "}
              <strong>
                {DAYS[dailyTotals.indexOf(Math.max(...dailyTotals))]}
              </strong>
            </span>
          </div>
          {/* Heat Map Grid */}
          <div className="w-full">
            <div className="w-full">
              {/* Hours Header */}
              <div className="flex mb-2">
                <div className="w-16 flex-shrink-0"></div>{" "}
                {/* Space for day labels */}
                <div className="flex-1 flex">
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 text-xs text-center text-muted-foreground min-w-0"
                    >
                      {parseInt(hour) % 4 === 0 ? hour : ""}
                    </div>
                  ))}
                </div>
                <div className="w-12 flex-shrink-0"></div>{" "}
                {/* Space for totals */}
              </div>

              {/* Heat Map Rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-16 flex-shrink-0 text-xs font-medium text-right pr-2">
                    {day}
                  </div>
                  <div className="flex-1 flex">
                    {data[dayIndex].map((value, hourIndex) => (
                      <div
                        key={`${day}-${hourIndex}`}
                        className={cn(
                          "flex-1 h-8 border flex items-center justify-center text-xs font-medium transition-all duration-200 cursor-pointer min-w-0 shadow-sm rounded-sm",
                          getColorClass(value)
                        )}
                        title={`${day} ${HOURS[hourIndex]}:00 - ${value} cancellations`}
                      >
                        {value > 0 ? value : ""}
                      </div>
                    ))}
                  </div>
                  <div className="w-12 flex-shrink-0 text-xs text-center text-muted-foreground">
                    {dailyTotals[dayIndex]}
                  </div>
                </div>
              ))}

              {/* Hourly Totals Footer */}
              <div className="flex mt-2">
                <div className="w-16 flex-shrink-0"></div>
                <div className="flex-1 flex">
                  {hourlyTotals.map((total, index) => (
                    <div
                      key={index}
                      className="flex-1 text-xs text-center text-muted-foreground min-w-0"
                    >
                      {total > 0 ? total : ""}
                    </div>
                  ))}
                </div>
                <div className="w-12 flex-shrink-0"></div>
              </div>
            </div>
          </div>{" "}
          {/* Legend */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground font-medium">Menos</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-sm"></div>
              <div className="w-4 h-4 bg-orange-200 border border-orange-300 rounded-sm"></div>
              <div className="w-4 h-4 bg-orange-400 border border-orange-400 rounded-sm"></div>
              <div className="w-4 h-4 bg-red-400 border border-red-400 rounded-sm"></div>
              <div className="w-4 h-4 bg-red-600 border border-red-600 rounded-sm"></div>
              <div className="w-4 h-4 bg-red-800 border border-red-800 rounded-sm"></div>
            </div>
            <span className="text-muted-foreground font-medium">Mais</span>
          </div>
          {/* Insights */}
          {totalCancellations > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">📊 Insights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Most cancellations occur on{" "}
                  <strong>
                    {DAYS[dailyTotals.indexOf(Math.max(...dailyTotals))]}
                  </strong>
                  ({Math.max(...dailyTotals)} cancellations)
                </li>
                <li>
                  • Peak cancellation time is{" "}
                  <strong>
                    {HOURS[hourlyTotals.indexOf(Math.max(...hourlyTotals))]}:00
                  </strong>
                  ({Math.max(...hourlyTotals)} cancellations)
                </li>
                {dailyTotals.filter((t) => t === 0).length > 0 && (
                  <li>
                    • {dailyTotals.filter((t) => t === 0).length} day(s) with no
                    cancellations
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
