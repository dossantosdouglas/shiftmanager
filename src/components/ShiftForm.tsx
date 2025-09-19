"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, X, Edit, Plus, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { cn } from "@/lib/utils";
import { ActionType, ShiftType } from "@prisma/client";

// Define predefined time slots
const TIME_SLOTS = [
  {
    label: "5am-7am",
    value: "05:00-07:00",
    startTime: "05:00",
    endTime: "07:00",
  },
  {
    label: "7am-9am",
    value: "07:00-09:00",
    startTime: "07:00",
    endTime: "09:00",
  },
  {
    label: "9am-11am",
    value: "09:00-11:00",
    startTime: "09:00",
    endTime: "11:00",
  },
  {
    label: "11am-1pm",
    value: "11:00-13:00",
    startTime: "11:00",
    endTime: "13:00",
  },
  {
    label: "1pm-3pm",
    value: "13:00-15:00",
    startTime: "13:00",
    endTime: "15:00",
  },
  {
    label: "3pm-5pm",
    value: "15:00-17:00",
    startTime: "15:00",
    endTime: "17:00",
  },
  {
    label: "5pm-7pm",
    value: "17:00-19:00",
    startTime: "17:00",
    endTime: "19:00",
  },
];

const formSchema = z.object({
  employeeName: z.string().min(2, {
    message: "Employee name must be at least 2 characters.",
  }),
  actionType: z.nativeEnum(ActionType, {
    message: "Please select an action type.",
  }),
  shiftDate: z.date({
    message: "Please select a shift date.",
  }),
  timeSlot: z.string().min(1, {
    message: "Please select a time slot.",
  }),
  shiftType: z.nativeEnum(ShiftType, {
    message: "Please select a shift type.",
  }),
});

type FormData = z.infer<typeof formSchema>;

interface ShiftFormProps {
  onSuccess?: () => void;
}

export function ShiftForm({ onSuccess }: ShiftFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      timeSlot: "",
    },
  });

  const onSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      // Find the selected time slot to extract start/end times
      const selectedTimeSlot = TIME_SLOTS.find(
        (slot) => slot.value === values.timeSlot
      );
      if (!selectedTimeSlot) {
        throw new Error("Invalid time slot selected");
      }

      const response = await fetch("/api/shifts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeName: values.employeeName,
          actionType: values.actionType,
          shiftDate: values.shiftDate.toISOString(),
          startTime: selectedTimeSlot.startTime,
          endTime: selectedTimeSlot.endTime,
          shiftType: values.shiftType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit shift");
      }

      setSubmitMessage({ type: "success", text: "Shift logged successfully!" });
      form.reset();
      onSuccess?.();
    } catch (error) {
      setSubmitMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit shift",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Log Shift Action
        </CardTitle>
        <CardDescription>
          Submit a shift cancellation, modification, or addition request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Employee Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">
                  Employee Information
                </h3>
              </div>

              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Employee Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your full name"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actionType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Action Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select action type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ActionType.CANCEL}>
                          <div className="flex items-center gap-2">
                            <X className="h-4 w-4 text-red-500" />
                            <span className="text-red-700 font-medium">
                              Cancel Shift
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ActionType.MODIFY}>
                          <div className="flex items-center gap-2">
                            <Edit className="h-4 w-4 text-blue-500" />
                            <span className="text-blue-700 font-medium">
                              Missing
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ActionType.ADD}>
                          <div className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-green-500" />
                            <span className="text-green-700 font-medium">
                              Add Shift
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Shift Details Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-border">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-foreground">Shift Details</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shiftDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        Shift Date
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal text-base",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeSlot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Time Slot
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Select a time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIME_SLOTS.map((slot) => (
                            <SelectItem key={slot.value} value={slot.value}>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">
                                  {slot.label}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="shiftType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Shift Type
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="text-base">
                          <SelectValue placeholder="Select shift type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={ShiftType.VOICE}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="font-medium">Voice Support</span>
                          </div>
                        </SelectItem>
                        <SelectItem value={ShiftType.CHAT}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span className="font-medium">Chat Support</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {submitMessage && (
              <div
                className={cn(
                  "p-4 rounded-lg text-sm font-medium",
                  submitMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                )}
              >
                {submitMessage.text}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Submit Shift Action
                </div>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
