import type { ReactNode } from "react";

import { requireAdmin } from "../../../lib/admin/access";

type ProprietariosLayoutProps = {
  children: ReactNode;
};

export default async function ProprietariosLayout({
  children,
}: ProprietariosLayoutProps) {
  await requireAdmin();

  return <>{children}</>;
}
