import type { ReactNode } from "react";

import { requireAdmin } from "../../../lib/admin/access";

type CaptacaoIALayoutProps = {
  children: ReactNode;
};

export default async function CaptacaoIALayout({
  children,
}: CaptacaoIALayoutProps) {
  await requireAdmin();

  return <>{children}</>;
}
