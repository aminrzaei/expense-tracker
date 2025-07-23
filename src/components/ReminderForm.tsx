"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toPersianNumbers, toEnglishNumbers } from "@/lib/persian-date";

const frequencyOptions = [
  { value: "minutely", label: "دقیقه‌ای" },
  { value: "hourly", label: "ساعتی" },
  { value: "daily", label: "روزانه" },
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
  { value: "yearly", label: "سالانه" },
];

interface ReminderFormProps {
  trigger?: React.ReactNode;
}

export default function ReminderForm({ trigger }: ReminderFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("");
  const [nextDueDate, setNextDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !frequency || !nextDueDate) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: amount
            ? parseInt(toEnglishNumbers(amount.replace(/,/g, "")))
            : null,
          frequency,
          nextDueDate: new Date(nextDueDate).toISOString(),
        }),
      });

      if (response.ok) {
        setTitle("");
        setAmount("");
        setFrequency("");
        setNextDueDate("");
        setIsOpen(false);
        router.refresh();
      } else {
        console.error("Failed to add reminder");
      }
    } catch (error) {
      console.error("Error adding reminder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const englishValue = toEnglishNumbers(value.replace(/,/g, ""));
    if (!englishValue || isNaN(Number(englishValue))) return "";
    return toPersianNumbers(Number(englishValue).toLocaleString());
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value);
    setAmount(formatted);
  };

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split("T")[0];

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      ➕ افزودن یادآوری جدید
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>⏰ افزودن یادآوری جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-title">عنوان یادآوری *</Label>
            <Input
              id="reminder-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: پرداخت قبض برق"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-amount">مبلغ (تومان)</Label>
            <Input
              id="reminder-amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="مثال: ۵۰,۰۰۰ (اختیاری)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-frequency">تکرار *</Label>
            <Select value={frequency} onValueChange={setFrequency} required>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب دوره تکرار" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-date">
              {frequency === "minutely" || frequency === "hourly"
                ? "زمان اولین یادآوری *"
                : "تاریخ اولین یادآوری *"}
            </Label>
            <Input
              id="reminder-date"
              type={
                frequency === "minutely" || frequency === "hourly"
                  ? "datetime-local"
                  : "date"
              }
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              min={
                frequency === "minutely" || frequency === "hourly"
                  ? new Date().toISOString().slice(0, 16)
                  : today
              }
              required
            />
            {(frequency === "minutely" || frequency === "hourly") && (
              <p className="text-xs text-amber-600">
                ⚠️ توجه: یادآوری‌های{" "}
                {frequency === "minutely" ? "دقیقه‌ای" : "ساعتی"} ممکن است
                اعلان‌های زیادی ایجاد کنند
              </p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !title || !frequency || !nextDueDate}
              className="flex-1 btn-rtl"
            >
              {isLoading ? "در حال ذخیره..." : "💾 ذخیره یادآوری"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="btn-rtl"
            >
              انصراف
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
