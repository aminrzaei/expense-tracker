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
import { toPersianNumbers, toEnglishNumbers } from "@/lib/persian-date";

const defaultCategories = [
  { id: "food", name: "🍽️ غذا و نوشیدنی", color: "#f59e0b" },
  { id: "transport", name: "🚗 حمل و نقل", color: "#3b82f6" },
  { id: "shopping", name: "🛍️ خرید", color: "#ec4899" },
  { id: "bills", name: "📄 قبوض", color: "#ef4444" },
  { id: "health", name: "🏥 سلامت", color: "#10b981" },
  { id: "entertainment", name: "🎬 سرگرمی", color: "#8b5cf6" },
  { id: "education", name: "📚 آموزش", color: "#f97316" },
  { id: "other", name: "📦 سایر", color: "#6b7280" },
];

export default function ExpenseForm() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          amount: parseInt(toEnglishNumbers(amount.replace(/,/g, ""))),
          categoryId: category || null,
          description: description || null,
        }),
      });

      if (response.ok) {
        setTitle("");
        setAmount("");
        setCategory("");
        setDescription("");
        router.refresh();
      } else {
        console.error("Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">عنوان هزینه *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: خرید نان"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amount">مبلغ (تومان) *</Label>
        <Input
          id="amount"
          value={amount}
          onChange={handleAmountChange}
          placeholder="مثال: ۱۰,۰۰۰"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">دسته‌بندی</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="انتخاب دسته‌بندی" />
          </SelectTrigger>
          <SelectContent>
            {defaultCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">توضیحات</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات اضافی (اختیاری)"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading || !title || !amount}
        className="w-full btn-rtl"
      >
        {isLoading ? "در حال ذخیره..." : "💾 ذخیره هزینه"}
      </Button>
    </form>
  );
}
