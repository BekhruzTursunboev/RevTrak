import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { DEFAULT_COMPANY_ID } from "@/lib/constants"

export async function GET(request: Request) {
  try {
    await prisma.company.upsert({
      where: { id: DEFAULT_COMPANY_ID },
      update: {},
      create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
    })

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "transactions"

    if (type === "transactions") {
      const transactions = await prisma.transaction.findMany({
        where: { companyId: DEFAULT_COMPANY_ID },
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
        where: { companyId: DEFAULT_COMPANY_ID },
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

