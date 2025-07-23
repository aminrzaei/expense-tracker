"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPersianDateTime } from "@/lib/persian-date";

interface TestResult {
  success: boolean;
  message?: string;
  error?: string;
  cronStatus?: {
    isRunning: boolean;
    nextRun: string;
    type: string;
    timezone: string;
  };
  timestamp?: string;
  note?: string;
}

export default function ReminderDebugger() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

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
                {/* Success Message */}
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-green-800 font-medium">
                    ✅ تست موفقیت‌آمیز
                  </div>
                  <div className="text-green-700 text-sm mt-1">
                    {testResult.message}
                  </div>
                  {testResult.note && (
                    <div className="text-green-600 text-xs mt-2">
                      {testResult.note}
                    </div>
                  )}
                </div>

                {/* Cron Status */}
                {testResult.cronStatus && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-blue-800 font-medium mb-2">
                      وضعیت Cron Job:
                    </div>
                    <div className="text-sm text-blue-700 space-y-1">
                      <div>نوع: {testResult.cronStatus.type}</div>
                      <div>
                        وضعیت:{" "}
                        {testResult.cronStatus.isRunning ? "فعال" : "غیرفعال"}
                      </div>
                      <div>زمان‌بندی: {testResult.cronStatus.nextRun}</div>
                      <div>منطقه زمانی: {testResult.cronStatus.timezone}</div>
                    </div>
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
            <li>روی دکمه &quot;تست دستی&quot; کلیک کنید</li>
            <li>نتایج را در قسمت نتایج تست مشاهده کنید</li>
            <li>اگر push notification فعال باشد، اعلان دریافت خواهید کرد</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
