import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional().refine(
    (val) => {
      if (!val || val.trim() === "") return true
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    },
    { message: "Invalid email format" }
  ),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  notes: z.string().optional(),
  totalDue: z.number().optional(),
})

import { DEFAULT_COMPANY_ID } from "@/lib/constants"

export async function GET(request: Request) {
  try {
    // Ensure default company exists
    await prisma.company.upsert({
      where: { id: DEFAULT_COMPANY_ID },
      update: {},
      create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
    })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const where: any = {
      companyId: DEFAULT_COMPANY_ID,
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { companyName: { contains: search } },
      ]
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        payments: {
          orderBy: { paymentDate: "desc" },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(clients)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Ensure default company exists
    await prisma.company.upsert({
      where: { id: DEFAULT_COMPANY_ID },
      update: {},
      create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
    })

    const body = await request.json()
    const validated = clientSchema.parse(body)
    const { name, email, phone, companyName, notes, totalDue } = validated

    const client = await prisma.client.create({
      data: {
        name,
        email: email && email.trim() !== "" ? email.trim() : null,
        phone: phone && phone.trim() !== "" ? phone.trim() : null,
        companyName: companyName && companyName.trim() !== "" ? companyName.trim() : null,
        notes: notes && notes.trim() !== "" ? notes.trim() : null,
        totalDue: totalDue || 0,
        companyId: DEFAULT_COMPANY_ID,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Error creating client:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

