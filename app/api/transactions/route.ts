import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const transactionSchema = z.object({
  date: z.string(),
  amount: z.number(),
  category: z.string(),
  notes: z.string().optional(),
  type: z.enum(["income", "expense"]),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      companyId: session.user.companyId,
    }

    if (search) {
      where.OR = [
        { notes: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ]
    }

    if (category) {
      where.category = category
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: "desc" },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, amount, category, notes, type } = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        amount: type === "income" ? Math.abs(amount) : -Math.abs(amount),
        category,
        notes,
        type,
        companyId: session.user.companyId,
      },
    })

    // Create notification for large transactions
    if (Math.abs(amount) > 10000) {
      await prisma.notification.create({
        data: {
          type: "transaction",
          title: "Large Transaction",
          message: `A ${type} of ${Math.abs(amount).toLocaleString()} was recorded in ${category}`,
          companyId: session.user.companyId,
        },
      })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

