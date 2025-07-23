import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExpenseForm from "@/components/ExpenseForm";
import ExpenseList from "@/components/ExpenseList";
import ReminderSection from "@/components/ReminderSection";
import AuthButton from "@/components/AuthButton";
import PushNotificationManager from "@/app/components/PushNotificationManager";
import ReminderDebugger from "@/components/ReminderDebugger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">💰 مدیریت هزینه‌ها</CardTitle>
            <p className="text-muted-foreground">
              برای استفاده از برنامه، ابتدا وارد شوید
            </p>
          </CardHeader>
          <CardContent>
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get user's recent expenses
  const expenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { date: "desc" },
    take: 10,
  });

  // Get user's active reminders
  const reminders = await prisma.reminder.findMany({
    where: {
      userId: session.user.id,
      isActive: true,
    },
    orderBy: { nextDueDate: "asc" },
    take: 5,
  });

  // Calculate total expenses for this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const monthlyTotal = await prisma.expense.aggregate({
    where: {
      userId: session.user.id,
      date: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              💰 مدیریت هزینه‌ها
            </h1>
            <p className="text-gray-600 mt-2">
              سلام {session.user.name}، خوش آمدید! 👋
            </p>
          </div>
          <AuthButton />
        </div>

        {/* Monthly Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">📊 خلاصه ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600 toman-amount">
              {monthlyTotal._sum.amount?.toLocaleString("fa-IR") || "۰"} تومان
            </div>
            <p className="text-gray-600 mt-1">کل هزینه‌های این ماه</p>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Add New Expense */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">➕ افزودن هزینه جدید</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm />
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">🔔 اعلان‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <PushNotificationManager />
            </CardContent>
          </Card>
        </div>

        {/* Reminders and Recent Expenses */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">⏰ یادآوری‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              <ReminderSection reminders={reminders} />
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">📝 هزینه‌های اخیر</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseList expenses={expenses} isPreview={true} />
            </CardContent>
          </Card>
        </div>

        {/* Debug Section (only show if in development or localhost) */}
        {process.env.NODE_ENV === "development" && <ReminderDebugger />}
      </div>
    </div>
  );
}
