import type { ReactNode } from "react";

import { requireUser } from "../../../lib/admin/access";

type ProprietariosLayoutProps = {
  children: ReactNode;
};

export default async function ProprietariosLayout({
  children,
}: ProprietariosLayoutProps) {
  await requireUser();

  return <>{children}</>;
}
