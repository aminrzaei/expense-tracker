"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPersianDate, toPersianNumbers } from "@/lib/persian-date";
import ReminderForm from "./ReminderForm";
import { useRouter } from "next/navigation";

type Reminder = {
  id: string;
  title: string;
  amount?: number | null;
  frequency: string;
  nextDueDate: Date;
  isActive: boolean;
};

const frequencyMap: Record<string, string> = {
  minutely: "دقیقه‌ای",
  hourly: "ساعتی",
  daily: "روزانه",
  weekly: "هفتگی",
  monthly: "ماهانه",
  yearly: "سالانه",
};

interface ReminderSectionProps {
  reminders: Reminder[];
}

export default function ReminderSection({ reminders }: ReminderSectionProps) {
  const router = useRouter();

  const handleCompleteReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/complete`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the page to show updated reminders
        router.refresh();
      }
    } catch (error) {
      console.error("Error completing reminder:", error);
    }
  };

  const handleSnoozeReminder = async (reminderId: string) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/snooze`, {
        method: "POST",
      });

      if (response.ok) {
        // Refresh the page to show updated reminders
        router.refresh();
      }
    } catch (error) {
      console.error("Error snoozing reminder:", error);
    }
  };
  if (reminders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">⏰</div>
        <p>هیچ یادآوری‌ای تنظیم نشده است</p>
        <p className="text-sm mt-1">
          یادآوری‌ها به شما کمک می‌کنند هزینه‌هایتان را فراموش نکنید
        </p>
        <div className="mt-3">
          <ReminderForm />
        </div>
      </div>
    );
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "minutely":
        return "#dc2626"; // Red-600 - very urgent
      case "hourly":
        return "#ea580c"; // Orange-600 - urgent
      case "daily":
        return "#ef4444"; // Red-500
      case "weekly":
        return "#f59e0b"; // Amber-500
      case "monthly":
        return "#3b82f6"; // Blue-500
      case "yearly":
        return "#10b981"; // Emerald-500
      default:
        return "#6b7280"; // Gray-500
    }
  };

  const getTimeStatus = (nextDueDate: Date) => {
    const now = new Date();
    const due = new Date(nextDueDate);
    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "عقب‌افتاده", color: "#ef4444", urgent: true };
    } else if (diffDays === 0) {
      return { text: "امروز", color: "#f59e0b", urgent: true };
    } else if (diffDays === 1) {
      return { text: "فردا", color: "#f59e0b", urgent: false };
    } else if (diffDays <= 7) {
      return {
        text: `${toPersianNumbers(diffDays)} روز دیگر`,
        color: "#3b82f6",
        urgent: false,
      };
    } else {
      return {
        text: formatPersianDate(nextDueDate),
        color: "#6b7280",
        urgent: false,
      };
    }
  };

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const timeStatus = getTimeStatus(reminder.nextDueDate);
        const frequencyColor = getFrequencyColor(reminder.frequency);

        return (
          <div
            key={reminder.id}
            className={`p-4 bg-white rounded-lg border transition-all ${
              timeStatus.urgent
                ? "border-orange-200 bg-orange-50"
                : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 flex items-center">
                  ⏰ {reminder.title}
                </h3>

                {reminder.amount && (
                  <div className="text-emerald-600 font-semibold mt-1 toman-amount">
                    {toPersianNumbers(reminder.amount.toLocaleString())} تومان
                  </div>
                )}

                <div className="flex items-center space-x-2 space-x-reverse mt-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: frequencyColor,
                      color: frequencyColor,
                    }}
                  >
                    {frequencyMap[reminder.frequency]}
                  </Badge>

                  <Badge
                    variant={timeStatus.urgent ? "destructive" : "outline"}
                    style={
                      !timeStatus.urgent
                        ? {
                            borderColor: timeStatus.color,
                            color: timeStatus.color,
                          }
                        : {}
                    }
                  >
                    {timeStatus.text}
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => handleCompleteReminder(reminder.id)}
                >
                  ✅ انجام شد
                </Button>
                {timeStatus.urgent && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-gray-500"
                    onClick={() => handleSnoozeReminder(reminder.id)}
                  >
                    ⏭️ بعداً
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="text-center pt-4">
        <ReminderForm />
      </div>
    </div>
  );
}
