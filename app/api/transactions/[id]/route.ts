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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, amount, category, notes, type } = transactionSchema.parse(body)

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction || transaction.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updated = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        date: new Date(date),
        amount: type === "income" ? Math.abs(amount) : -Math.abs(amount),
        category,
        notes,
        type,
      },
    })

    return NextResponse.json(updated)
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: params.id },
    })

    if (!transaction || transaction.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

