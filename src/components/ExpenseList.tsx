"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPersianDate,
  formatPersianRelativeTime,
  toPersianNumbers,
} from "@/lib/persian-date";

type Category = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
};

type Expense = {
  id: string;
  title: string;
  amount: number;
  description?: string | null;
  date: Date;
  category?: Category | null;
};

const categoryMap: Record<
  string,
  { name: string; icon: string; color: string }
> = {
  food: { name: "غذا و نوشیدنی", icon: "🍽️", color: "#f59e0b" },
  transport: { name: "حمل و نقل", icon: "🚗", color: "#3b82f6" },
  shopping: { name: "خرید", icon: "🛍️", color: "#ec4899" },
  bills: { name: "قبوض", icon: "📄", color: "#ef4444" },
  health: { name: "سلامت", icon: "🏥", color: "#10b981" },
  entertainment: { name: "سرگرمی", icon: "🎬", color: "#8b5cf6" },
  education: { name: "آموزش", icon: "📚", color: "#f97316" },
  other: { name: "سایر", icon: "📦", color: "#6b7280" },
};

interface ExpenseListProps {
  expenses: Expense[];
  isPreview?: boolean;
}

export default function ExpenseList({
  expenses,
  isPreview = false,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📝</div>
        <p>هنوز هزینه‌ای ثبت نشده است</p>
        {isPreview && (
          <p className="text-sm mt-1">
            پس از افزودن هزینه، اینجا نمایش داده می‌شود
          </p>
        )}
      </div>
    );
  }

  const displayedExpenses = isPreview ? expenses.slice(0, 5) : expenses;

  return (
    <div className="space-y-3">
      {displayedExpenses.map((expense) => {
        const category = expense.category?.id
          ? categoryMap[expense.category.id]
          : categoryMap.other;

        return (
          <div
            key={expense.id}
            className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="text-2xl">{category.icon}</div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{expense.title}</h3>
                {expense.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {expense.description}
                  </p>
                )}
                <div className="flex items-center space-x-2 space-x-reverse mt-1">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: category.color,
                      color: category.color,
                    }}
                  >
                    {category.name}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatPersianRelativeTime(expense.date)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left">
              <div className="font-bold text-lg text-red-600 toman-amount">
                {toPersianNumbers(expense.amount.toLocaleString())} تومان
              </div>
              <div className="text-xs text-gray-500">
                {formatPersianDate(expense.date)}
              </div>
            </div>
          </div>
        );
      })}

      {isPreview && expenses.length > 5 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            مشاهده همه ({toPersianNumbers(expenses.length)} هزینه)
          </Button>
        </div>
      )}
    </div>
  );
}
