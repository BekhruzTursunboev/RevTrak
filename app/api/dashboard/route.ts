import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const companyId = session.user.companyId

    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: { companyId },
      orderBy: { date: "desc" },
    })

    // Calculate revenue metrics
    const totalRevenue = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const totalExpenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0))
    
    const netIncome = totalRevenue - totalExpenses

    // Get monthly data for charts
    const monthlyData = transactions.reduce((acc: any, transaction) => {
      const month = new Date(transaction.date).toLocaleString('default', { month: 'short', year: 'numeric' })
      if (!acc[month]) {
        acc[month] = { revenue: 0, expenses: 0 }
      }
      if (transaction.amount > 0) {
        acc[month].revenue += transaction.amount
      } else {
        acc[month].expenses += Math.abs(transaction.amount)
      }
      return acc
    }, {})

    const chartData = Object.entries(monthlyData)
      .map(([month, data]: [string, any]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        net: data.revenue - data.expenses,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

    // Category breakdown
    const categoryData = transactions.reduce((acc: any, transaction) => {
      const category = transaction.category
      if (!acc[category]) {
        acc[category] = { income: 0, expense: 0 }
      }
      if (transaction.amount > 0) {
        acc[category].income += transaction.amount
      } else {
        acc[category].expense += Math.abs(transaction.amount)
      }
      return acc
    }, {})

    const categoryBreakdown = Object.entries(categoryData)
      .map(([category, data]: [string, any]) => ({
        category,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      }))
      .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))

    // Get tasks
    const tasks = await prisma.task.findMany({
      where: { companyId },
    })

    const taskStats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === "completed").length,
      pending: tasks.filter(t => t.status === "pending").length,
      inProgress: tasks.filter(t => t.status === "in_progress").length,
      overdue: tasks.filter(t => t.status === "overdue").length,
    }

    // Recent transactions
    const recentTransactions = transactions.slice(0, 5)

    return NextResponse.json({
      revenue: {
        total: totalRevenue,
        expenses: totalExpenses,
        net: netIncome,
      },
      chartData,
      categoryBreakdown,
      taskStats,
      recentTransactions,
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

