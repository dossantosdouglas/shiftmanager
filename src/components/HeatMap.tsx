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

  // Get color class based on intensity
  const getColorClass = (value: number) => {
    const intensity = getIntensity(value);
    if (intensity === 0) return "bg-gray-100 hover:bg-gray-200";
    if (intensity <= 0.2) return "bg-red-100 hover:bg-red-150";
    if (intensity <= 0.4) return "bg-red-200 hover:bg-red-250";
    if (intensity <= 0.6) return "bg-red-300 hover:bg-red-350";
    if (intensity <= 0.8) return "bg-red-400 hover:bg-red-450";
    return "bg-red-500 hover:bg-red-550";
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
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Hours Header */}
              <div className="flex mb-2">
                <div className="w-12"></div> {/* Space for day labels */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="w-8 text-xs text-center text-muted-foreground"
                  >
                    {parseInt(hour) % 4 === 0 ? hour : ""}
                  </div>
                ))}
              </div>

              {/* Heat Map Rows */}
              {DAYS.map((day, dayIndex) => (
                <div key={day} className="flex items-center mb-1">
                  <div className="w-12 text-xs font-medium text-right pr-2">
                    {day}
                  </div>
                  {data[dayIndex].map((value, hourIndex) => (
                    <div
                      key={`${day}-${hourIndex}`}
                      className={cn(
                        "w-8 h-6 border border-gray-200 flex items-center justify-center text-xs transition-colors cursor-pointer",
                        getColorClass(value)
                      )}
                      title={`${day} ${HOURS[hourIndex]}:00 - ${value} cancellations`}
                    >
                      {value > 0 ? value : ""}
                    </div>
                  ))}
                  <div className="ml-2 text-xs text-muted-foreground">
                    {dailyTotals[dayIndex]}
                  </div>
                </div>
              ))}

              {/* Hourly Totals Footer */}
              <div className="flex mt-2">
                <div className="w-12"></div>
                {hourlyTotals.map((total, index) => (
                  <div
                    key={index}
                    className="w-8 text-xs text-center text-muted-foreground"
                  >
                    {total > 0 ? total : ""}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground">Less</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-100 border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-200 border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-300 border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-400 border border-gray-200"></div>
              <div className="w-3 h-3 bg-red-500 border border-gray-200"></div>
            </div>
            <span className="text-muted-foreground">More</span>
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
