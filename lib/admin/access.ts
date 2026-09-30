import { redirect } from "next/navigation";

import { auth } from "../../auth";
import { prisma } from "../prisma";

export async function requireUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  const agentId = session.user.agentId;

  if (
    session.user.role === "CAPTADOR" &&
    !agentId
  ) {
    redirect("/login-admin");
  }

  if (agentId) {
    const agent =
      await prisma.agent.findUnique({
        where: {
          id: agentId,
        },
        select: {
          active: true,
          role: true,
        },
      });

    if (
      !agent?.active ||
      agent.role !== session.user.role
    ) {
      redirect("/login-admin");
    }
  }

  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== "ADMIN") {
    redirect("/admin");
  }

  return user;
}

export async function getAccessContext() {
  const user = await requireUser();

  return {
    user,
    isAdmin: user.role === "ADMIN",
    agentId: user.agentId ?? null,
  };
}
