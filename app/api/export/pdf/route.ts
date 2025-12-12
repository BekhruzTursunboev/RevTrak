import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "transactions"

    const company = await prisma.company.findUnique({
      where: { id: session.user.companyId },
    })

    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`${company?.name || "Company"} - ${type === "transactions" ? "Transactions" : "Tasks"} Report`, 14, 22)
    doc.setFontSize(11)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

    if (type === "transactions") {
      const transactions = await prisma.transaction.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { date: "desc" },
      })

      const totalRevenue = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0))
      const netIncome = totalRevenue - totalExpenses

      doc.setFontSize(12)
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 40)
      doc.text(`Total Expenses: $${totalExpenses.toFixed(2)}`, 14, 47)
      doc.text(`Net Income: $${netIncome.toFixed(2)}`, 14, 54)

      autoTable(doc, {
        startY: 60,
        head: [["Date", "Type", "Amount", "Category", "Notes"]],
        body: transactions.map(t => [
          new Date(t.date).toLocaleDateString(),
          t.type,
          `$${Math.abs(t.amount).toFixed(2)}`,
          t.category,
          t.notes || "",
        ]),
      })
    } else if (type === "tasks") {
      const tasks = await prisma.task.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { createdAt: "desc" },
      })

      const stats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === "completed").length,
        pending: tasks.filter(t => t.status === "pending").length,
        overdue: tasks.filter(t => t.status === "overdue").length,
      }

      doc.setFontSize(12)
      doc.text(`Total Tasks: ${stats.total}`, 14, 40)
      doc.text(`Completed: ${stats.completed}`, 14, 47)
      doc.text(`Pending: ${stats.pending}`, 14, 54)
      doc.text(`Overdue: ${stats.overdue}`, 14, 61)

      autoTable(doc, {
        startY: 70,
        head: [["Title", "Status", "Priority", "Due Date", "Created"]],
        body: tasks.map(t => [
          t.title,
          t.status,
          t.priority,
          t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "N/A",
          new Date(t.createdAt).toLocaleDateString(),
        ]),
      })
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

