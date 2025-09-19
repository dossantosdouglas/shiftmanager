"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Filter, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ActionType, ShiftType } from "@prisma/client";
import { Shift } from "@/types/shift";
import { useAuth } from "@/contexts/AuthContext";

interface ShiftsTableProps {
  refreshTrigger?: number;
}

export function ShiftsTable({ refreshTrigger }: ShiftsTableProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth();

  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [actionTypeFilter, setActionTypeFilter] =
    useState<string>("all-actions");
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string>("all-types");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Handle shift confirmation toggle
  const handleConfirmationToggle = async (
    shiftId: string,
    currentConfirmed: boolean
  ) => {
    try {
      const response = await fetch("/api/shifts", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: shiftId,
          confirmed: !currentConfirmed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update confirmation");
      }

      // Update the local state immediately for better UX
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.id === shiftId
            ? { ...shift, confirmed: !currentConfirmed }
            : shift
        )
      );
    } catch (error) {
      console.error("Error updating confirmation:", error);
      // You could add a toast notification here
    }
  };

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (employeeFilter) params.append("employee", employeeFilter);
      if (actionTypeFilter && actionTypeFilter !== "all-actions")
        params.append("actionType", actionTypeFilter);
      if (shiftTypeFilter && shiftTypeFilter !== "all-types")
        params.append("shiftType", shiftTypeFilter);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const response = await fetch(`/api/shifts?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch shifts");
      }

      const data = await response.json();
      setShifts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch shifts");
    } finally {
      setIsLoading(false);
    }
  }, [employeeFilter, actionTypeFilter, shiftTypeFilter, startDate, endDate]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts, refreshTrigger]);

  const handleFilterChange = () => {
    fetchShifts();
  };

  const clearFilters = () => {
    setEmployeeFilter("");
    setActionTypeFilter("all-actions");
    setShiftTypeFilter("all-types");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const getActionTypeBadge = (actionType: ActionType) => {
    const variants = {
      [ActionType.CANCEL]: "destructive" as const,
      [ActionType.MODIFY]: "default" as const,
      [ActionType.ADD]: "default" as const,
    };

    const labels = {
      [ActionType.CANCEL]: "Cancel",
      [ActionType.MODIFY]: "Missing",
      [ActionType.ADD]: "Add",
    };

    if (actionType === ActionType.ADD) {
      return (
        <Badge
          variant="default"
          className="bg-green-600 hover:bg-green-700 text-white border-green-600"
        >
          {labels[actionType]}
        </Badge>
      );
    }

    if (actionType === ActionType.MODIFY) {
      return (
        <Badge
          variant="default"
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        >
          {labels[actionType]}
        </Badge>
      );
    }

    return <Badge variant={variants[actionType]}>{labels[actionType]}</Badge>;
  };

  const getShiftTypeBadge = (shiftType: ShiftType) => {
    if (shiftType === ShiftType.VOICE) {
      return (
        <Badge
          variant="outline"
          className="border-purple-200 bg-purple-50 text-purple-700"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            Voice
          </div>
        </Badge>
      );
    }
    if (shiftType === ShiftType.CHAT) {
      return (
        <Badge
          variant="outline"
          className="border-orange-200 bg-orange-50 text-orange-700"
        >
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            Chat
          </div>
        </Badge>
      );
    }
    return <Badge variant="outline">{shiftType}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Shift Records
        </CardTitle>
        <CardDescription>
          View and filter all recorded shift actions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Employee name..."
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
              />
            </div>

            <div>
              <Select
                value={actionTypeFilter}
                onValueChange={setActionTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-actions">All Actions</SelectItem>
                  <SelectItem value={ActionType.CANCEL}>Cancel</SelectItem>
                  <SelectItem value={ActionType.MODIFY}>Missing</SelectItem>
                  <SelectItem value={ActionType.ADD}>Add</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={shiftTypeFilter}
                onValueChange={setShiftTypeFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Shift type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value={ShiftType.VOICE}>Voice</SelectItem>
                  <SelectItem value={ShiftType.CHAT}>Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "MMM dd") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "MMM dd") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleFilterChange} size="sm">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">Loading shifts...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center py-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex justify-center py-8">
            <div className="text-muted-foreground">No shifts found.</div>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Shift Date</TableHead>
                  <TableHead>Time Range</TableHead>
                  <TableHead>Type</TableHead>
                  {isAdmin && <TableHead>Confirmed</TableHead>}
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">
                      {shift.employeeName}
                    </TableCell>
                    <TableCell>
                      {getActionTypeBadge(shift.actionType)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(shift.shiftDate), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      {shift.startTime} - {shift.endTime}
                    </TableCell>
                    <TableCell>{getShiftTypeBadge(shift.shiftType)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={shift.confirmed || false}
                            onChange={() =>
                              handleConfirmationToggle(
                                shift.id,
                                shift.confirmed || false
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                            title={
                              shift.confirmed
                                ? "Shift confirmed"
                                : "Click to confirm shift completion"
                            }
                          />
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {format(new Date(shift.createdAt), "MMM dd, HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {shifts.length} record{shifts.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
}
