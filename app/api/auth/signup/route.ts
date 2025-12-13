import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  companyName: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, companyName } = signupSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const company = await prisma.company.create({
      data: {
        name: companyName,
        users: {
          create: {
            email,
            password: hashedPassword,
            name,
          },
        },
      },
      include: {
        users: true,
      },
    })

    return NextResponse.json({
      message: "User created successfully",
      userId: company.users[0].id,
    })
  } catch (error) {
    console.error("Signup error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    // Check for database connection errors
    if (error instanceof Error) {
      if (error.message.includes("Can't reach database server") || 
          error.message.includes("P1001") ||
          error.message.includes("Environment variable") ||
          error.message.includes("DATABASE_URL")) {
        return NextResponse.json(
          { 
            error: "Database connection failed", 
            message: "Please check your DATABASE_URL environment variable and ensure the database is set up."
          },
          { status: 500 }
        )
      }
      
      // Check for schema errors
      if (error.message.includes("does not exist") || 
          error.message.includes("P1001") ||
          error.message.includes("relation") ||
          error.message.includes("table")) {
        return NextResponse.json(
          { 
            error: "Database schema not initialized", 
            message: "Please run 'npx prisma db push' to initialize the database schema."
          },
          { status: 500 }
        )
      }
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

