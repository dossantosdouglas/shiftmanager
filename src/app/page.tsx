"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ShiftForm } from "@/components/ShiftForm";
import { ShiftsTable } from "@/components/ShiftsTable";
import { Reports } from "@/components/Reports";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, List, TrendingUp, LogOut, Shield, User } from "lucide-react";

export default function ShiftManagementPanel() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, isAdmin, logout, isLoading } = useAuth();

  const handleFormSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Shift Management Panel
          </h1>
          <p className="text-muted-foreground">
            Manage employee shift actions including cancellations,
            modifications, and additions.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {isAdmin ? (
              <Shield className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-gray-600" />
            )}
            <span className="font-medium">{user.name}</span>
            <span className="text-muted-foreground">({user.role})</span>
          </div>
          <Button onClick={logout} variant="outline" size="sm">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <Tabs defaultValue="form" className="w-full">
        <TabsList
          className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"}`}
        >
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Log Shift
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            View Shifts
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Reports
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="form" className="mt-6">
          <ShiftForm onSuccess={handleFormSuccess} />
        </TabsContent>

        <TabsContent value="shifts" className="mt-6">
          <ShiftsTable refreshTrigger={refreshTrigger} />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="reports" className="mt-6">
            <Reports refreshTrigger={refreshTrigger} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
