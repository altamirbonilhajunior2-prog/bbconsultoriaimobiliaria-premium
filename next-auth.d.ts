import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: "ADMIN" | "CAPTADOR";
    agentId?: number | null;
  }

  interface Session {
    user: {
      role: "ADMIN" | "CAPTADOR";
      agentId: number | null;
    } & Session["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "CAPTADOR";
    agentId?: number | null;
  }
}