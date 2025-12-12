import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentDate: z.string(),
  notes: z.string().optional(),
})

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client || client.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const payments = await prisma.clientPayment.findMany({
      where: { clientId: params.id },
      orderBy: { paymentDate: "desc" },
    })

    return NextResponse.json(payments)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paymentDate, notes } = paymentSchema.parse(body)

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client || client.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    // Create payment
    const payment = await prisma.clientPayment.create({
      data: {
        clientId: params.id,
        amount,
        paymentDate: new Date(paymentDate),
        notes: notes || null,
      },
    })

    // Update client's total paid amount
    const newTotalPaid = client.totalPaid + amount
    await prisma.client.update({
      where: { id: params.id },
      data: { totalPaid: newTotalPaid },
    })

    // Create transaction for the payment if it's income
    if (amount > 0) {
      await prisma.transaction.create({
        data: {
          date: new Date(paymentDate),
          amount: amount,
          category: "Client Payment",
          notes: `Payment from ${client.name}${notes ? ` - ${notes}` : ""}`,
          type: "income",
          companyId: session.user.companyId,
        },
      })
    }

    return NextResponse.json(payment)
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

