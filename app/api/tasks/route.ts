import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["pending", "in_progress", "completed", "overdue"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  dueDate: z.string().nullable().optional(),
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
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")

    const where: any = {
      companyId: DEFAULT_COMPANY_ID,
    }

    if (status) {
      where.status = status
    }

    if (priority) {
      where.priority = priority
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [
        { dueDate: "asc" },
        { createdAt: "desc" },
      ],
    })

    // Update overdue tasks
    const now = new Date()
    for (const task of tasks) {
      if (task.dueDate && task.dueDate < now && task.status !== "completed") {
        await prisma.task.update({
          where: { id: task.id },
          data: { status: "overdue" },
        })
      }
    }

    return NextResponse.json(tasks)
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
    const { title, description, status, priority, dueDate } = taskSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "pending",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        companyId: DEFAULT_COMPANY_ID,
      },
    })

    // Create notification for urgent tasks
    if (priority === "urgent" || (dueDate && new Date(dueDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000))) {
      await prisma.notification.create({
        data: {
          type: "task",
          title: "New Urgent Task",
          message: `Task "${title}" is due soon`,
          companyId: DEFAULT_COMPANY_ID,
        },
      })
    }

    return NextResponse.json(task)
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

