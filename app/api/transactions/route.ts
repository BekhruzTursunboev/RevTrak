import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const transactionSchema = z.object({
  date: z.string(),
  amount: z.number(),
  category: z.string(),
  notes: z.string().optional(),
  type: z.enum(["income", "expense"]),
})

import { DEFAULT_COMPANY_ID } from "@/lib/constants"

export async function GET(request: Request) {
  try {
    // Ensure default company exists (with error handling)
    try {
      await prisma.company.upsert({
        where: { id: DEFAULT_COMPANY_ID },
        update: {},
        create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
      })
    } catch (dbError) {
      return NextResponse.json([])
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const where: any = {
      companyId: DEFAULT_COMPANY_ID,
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
    console.error("Transactions error:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    // Ensure default company exists (with error handling)
    try {
      await prisma.company.upsert({
        where: { id: DEFAULT_COMPANY_ID },
        update: {},
        create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
      })
    } catch (dbError) {
      console.error("Database connection error:", dbError)
      return NextResponse.json(
        { 
          error: "Database connection failed", 
          message: "Please check your DATABASE_URL and ensure the database is set up. Run 'npx prisma db push' to initialize the database."
        },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { date, amount, category, notes, type } = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        amount: type === "income" ? Math.abs(amount) : -Math.abs(amount),
        category,
        notes: notes || null,
        type,
        companyId: DEFAULT_COMPANY_ID,
      },
    })

    // Create notification for large transactions (optional, don't fail if this fails)
    try {
      if (Math.abs(amount) > 10000) {
        await prisma.notification.create({
          data: {
            type: "transaction",
            title: "Large Transaction",
            message: `A ${type} of ${Math.abs(amount).toLocaleString()} was recorded in ${category}`,
            companyId: DEFAULT_COMPANY_ID,
          },
        })
      }
    } catch (notifError) {
      // Don't fail transaction creation if notification fails
      console.error("Failed to create notification:", notifError)
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Transaction creation error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error occurred"
      },
      { status: 500 }
    )
  }
}

