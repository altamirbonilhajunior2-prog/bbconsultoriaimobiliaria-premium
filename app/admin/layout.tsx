import type { Metadata } from "next";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "../../auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

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
