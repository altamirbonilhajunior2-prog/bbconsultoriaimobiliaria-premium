import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

export const dynamic = "force-dynamic";

type AdminLayoutProps = {
  children: ReactNode;
};

export default async function AdminLayout({
  children,
}: AdminLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  return <>{children}</>;
}