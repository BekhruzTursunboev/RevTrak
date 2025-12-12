import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "transactions"

    if (type === "transactions") {
      const transactions = await prisma.transaction.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { date: "desc" },
      })

      const csv = [
        ["Date", "Type", "Amount", "Category", "Notes"].join(","),
        ...transactions.map(t =>
          [
            new Date(t.date).toLocaleDateString(),
            t.type,
            Math.abs(t.amount).toFixed(2),
            t.category,
            `"${(t.notes || "").replace(/"/g, '""')}"`,
          ].join(",")
        ),
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    } else if (type === "tasks") {
      const tasks = await prisma.task.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { createdAt: "desc" },
      })

      const csv = [
        ["Title", "Description", "Status", "Priority", "Due Date", "Created At"].join(","),
        ...tasks.map(t =>
          [
            `"${t.title.replace(/"/g, '""')}"`,
            `"${(t.description || "").replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "",
            new Date(t.createdAt).toLocaleDateString(),
          ].join(",")
        ),
      ].join("\n")

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="tasks-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      })
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

