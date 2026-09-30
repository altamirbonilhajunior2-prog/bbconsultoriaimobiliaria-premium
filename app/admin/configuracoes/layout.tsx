import type { ReactNode } from "react";

import { requireAdmin } from "../../../lib/admin/access";

type AdminOnlyLayoutProps = {
  children: ReactNode;
};

export default async function AdminOnlyLayout({
  children,
}: AdminOnlyLayoutProps) {
  await requireAdmin();

  return <>{children}</>;
}
