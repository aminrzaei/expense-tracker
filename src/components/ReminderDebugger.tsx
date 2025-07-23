"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPersianDateTime, toPersianNumbers } from "@/lib/persian-date";

export default function ReminderDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleTestReminders = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/test-reminders");
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: "Failed to test reminders",
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">🔧 تست سیستم یادآوری</CardTitle>
        <p className="text-sm text-gray-600">
          برای تست دستی سیستم یادآوری‌ها استفاده کنید
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cron Job Flow Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            📋 مراحل اجرای Node.js Cron Job:
          </h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>هر دقیقه بررسی یادآوری‌های سررسید</li>
            <li>ارسال اعلان فوری به کاربران</li>
            <li>محاسبه تاریخ بعدی بر اساس نوع تکرار</li>
            <li>به‌روزرسانی پایگاه داده</li>
          </ol>
          <div className="mt-2 p-2 bg-green-100 rounded text-xs">
            <strong>✅ مزیت:</strong> این Cron Job روی localhost و production هر
            دو کار می‌کند!
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">زمان فعلی</div>
            <div className="font-semibold">
              {formatPersianDateTime(new Date())}
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-600">محیط اجرا</div>
            <div className="font-semibold">
              {typeof window !== "undefined" &&
              window.location.hostname === "localhost"
                ? "🏠 Local"
                : "☁️ Production"}
            </div>
          </div>
        </div>

        {/* Manual Test Button */}
        <Button
          onClick={handleTestReminders}
          disabled={isLoading}
          className="w-full btn-rtl"
        >
          {isLoading ? "در حال تست..." : "🧪 تست دستی یادآوری‌ها"}
        </Button>

        {/* Test Results */}
        {testResult && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">📊 نتایج تست:</h3>

            {testResult.success ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {toPersianNumbers(testResult.summary?.totalDue || 0)}
                      </div>
                      <div className="text-xs text-green-700">سررسید شده</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {toPersianNumbers(testResult.summary?.processed || 0)}
                      </div>
                      <div className="text-xs text-blue-700">پردازش شده</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">
                        {toPersianNumbers(testResult.summary?.errors || 0)}
                      </div>
                      <div className="text-xs text-red-700">خطا</div>
                    </div>
                  </div>
                </div>

                {/* Details */}
                {testResult.details && testResult.details.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">جزئیات:</h4>
                    {testResult.details.map((detail, index) => (
                      <div
                        key={index}
                        className="p-2 border rounded-lg text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{detail.title}</span>
                          <Badge
                            variant={
                              detail.status === "success"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {detail.status === "success" ? "موفق" : "خطا"}
                          </Badge>
                        </div>
                        {detail.status === "success" && (
                          <div className="text-xs text-gray-600 mt-1">
                            بعدی:{" "}
                            {formatPersianDateTime(new Date(detail.newDueDate))}
                          </div>
                        )}
                        {detail.error && (
                          <div className="text-xs text-red-600 mt-1">
                            خطا: {detail.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-red-800 font-medium">❌ خطا در تست</div>
                <div className="text-red-700 text-sm mt-1">
                  {testResult.message || testResult.error}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">
            📝 راهنمای تست:
          </h3>
          <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
            <li>ابتدا یادآوری با تاریخ گذشته یا حال ایجاد کنید</li>
            <li>روی دکمه "تست دستی" کلیک کنید</li>
            <li>نتایج را در قسمت نتایج تست مشاهده کنید</li>
            <li>اگر push notification فعال باشد، اعلان دریافت خواهید کرد</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
