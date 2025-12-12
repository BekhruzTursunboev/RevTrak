import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const clientSchema = z.object({
  name: z.string().min(1).optional(),
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
    const data = clientSchema.parse(body)

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client || client.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const updateData: any = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email || null
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.companyName !== undefined) updateData.companyName = data.companyName || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.totalDue !== undefined) updateData.totalDue = data.totalDue

    const updated = await prisma.client.update({
      where: { id: params.id },
      data: updateData,
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

    const client = await prisma.client.findUnique({
      where: { id: params.id },
    })

    if (!client || client.companyId !== session.user.companyId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.client.delete({
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

