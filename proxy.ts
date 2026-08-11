import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const hostname =
    request.headers.get("host")?.split(":")[0] ?? "";

  const isCrmDomain =
    hostname === "crm.bbconsultoriaimoveis.com.br";

  if (isCrmDomain && request.nextUrl.pathname === "/") {
    const url = request.nextUrl.clone();

    url.pathname = "/admin";

    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};