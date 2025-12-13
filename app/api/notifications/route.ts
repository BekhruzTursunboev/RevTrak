import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { DEFAULT_COMPANY_ID } from "@/lib/constants"

export async function GET() {
  try {
    await prisma.company.upsert({
      where: { id: DEFAULT_COMPANY_ID },
      update: {},
      create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
    })

    const notifications = await prisma.notification.findMany({
      where: {
        companyId: DEFAULT_COMPANY_ID,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    await prisma.company.upsert({
      where: { id: DEFAULT_COMPANY_ID },
      update: {},
      create: { id: DEFAULT_COMPANY_ID, name: "Default Company" },
    })

    const body = await request.json()
    const { id, read } = body

    if (id) {
      await prisma.notification.update({
        where: { id },
        data: { read },
      })
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: {
          companyId: DEFAULT_COMPANY_ID,
          read: false,
        },
        data: { read: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

