import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      companyId: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    companyId: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    companyId: string
  }
}

