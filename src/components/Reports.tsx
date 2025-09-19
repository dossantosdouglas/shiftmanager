"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { CalendarIcon, Download, TrendingUp } from "lucide-react";

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
import { ReportResponse } from "@/types/shift";

interface ReportsProps {
  refreshTrigger?: number;
}

export function Reports({ refreshTrigger }: ReportsProps) {
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [actionTypeFilter, setActionTypeFilter] =
    useState<string>("all-actions");
  const [shiftTypeFilter, setShiftTypeFilter] = useState<string>("all-types");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const fetchReports = useCallback(async () => {
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

      const response = await fetch(`/api/reports?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch reports");
      }

      const data = await response.json();
      setReportData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  }, [employeeFilter, actionTypeFilter, shiftTypeFilter, startDate, endDate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports, refreshTrigger]);

  const handleFilterChange = () => {
    fetchReports();
  };

  const clearFilters = () => {
    setEmployeeFilter("");
    setActionTypeFilter("all-actions");
    setShiftTypeFilter("all-types");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = ["Employee Name", "Cancel", "Missing", "Add", "Total"];
    const csvContent = [
      headers.join(","),
      ...reportData.summary.map((row) =>
        [row.employeeName, row.CANCEL, row.MODIFY, row.ADD, row.total].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `shift-report-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalsByAction = () => {
    if (!reportData) return { CANCEL: 0, MODIFY: 0, ADD: 0 };

    return reportData.summary.reduce(
      (totals, row) => ({
        CANCEL: totals.CANCEL + row.CANCEL,
        MODIFY: totals.MODIFY + row.MODIFY,
        ADD: totals.ADD + row.ADD,
      }),
      { CANCEL: 0, MODIFY: 0, ADD: 0 }
    );
  };

  const actionTotals = getTotalsByAction();

  return (
    <div className="space-y-6">
      {/* Global Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Select date range to filter all reports and summaries below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Start Date
              </label>
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
                    {startDate ? format(startDate, "PPP") : "Select start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
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
                    {endDate ? format(endDate, "PPP") : "Select end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 items-end">
              <Button onClick={fetchReports} size="default">
                Apply Filter
              </Button>
              <Button
                onClick={() => {
                  setStartDate(undefined);
                  setEndDate(undefined);
                }}
                variant="outline"
                size="default"
              >
                Clear Dates
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reportData?.totalRecords || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancellations</CardTitle>
            <Badge variant="destructive" className="text-xs">
              {actionTotals.CANCEL}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {actionTotals.CANCEL}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Missing</CardTitle>
            <Badge variant="default" className="text-xs">
              {actionTotals.MODIFY}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {actionTotals.MODIFY}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Additions</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {actionTotals.ADD}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {actionTotals.ADD}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Shift Reports
              </CardTitle>
              <CardDescription>
                Summary of shift actions by employee with filtering options.
              </CardDescription>
            </div>
            <Button
              onClick={exportToCSV}
              disabled={!reportData || reportData.summary.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Additional Filters */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Employee Name
                </label>
                <Input
                  placeholder="Employee name..."
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Action Type
                </label>
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
                <label className="text-sm font-medium mb-2 block">
                  Shift Type
                </label>
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
            </div>

            <div className="flex gap-2">
              <Button onClick={handleFilterChange} size="sm">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Loading reports...</div>
            </div>
          ) : error ? (
            <div className="flex justify-center py-8">
              <div className="text-red-500">Error: {error}</div>
            </div>
          ) : !reportData || reportData.summary.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">
                No data found for the selected filters.
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee Name</TableHead>
                    <TableHead className="text-center">Cancellations</TableHead>
                    <TableHead className="text-center">Modifications</TableHead>
                    <TableHead className="text-center">Additions</TableHead>
                    <TableHead className="text-center">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.summary.map((row) => (
                    <TableRow key={row.employeeName}>
                      <TableCell className="font-medium">
                        {row.employeeName}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="destructive"
                          className={row.CANCEL === 0 ? "opacity-50" : ""}
                        >
                          {row.CANCEL}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="default"
                          className={row.MODIFY === 0 ? "opacity-50" : ""}
                        >
                          {row.MODIFY}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={row.ADD === 0 ? "opacity-50" : ""}
                        >
                          {row.ADD}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        {row.total}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {reportData?.summary.length || 0} employee
            {reportData?.summary.length !== 1 ? "s" : ""} with{" "}
            {reportData?.totalRecords || 0} total records
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
