import { NextRequest, NextResponse } from "next/server";
import { changeConsent, readConsent } from "../../../../lib/privacy/server-consent";
import { ConsentConflict } from "../../../../lib/privacy/consent-transition";
import { newSession, RECEIPT_COOKIE, SESSION_COOKIE, signPayload, signingKey, verifySession, type ConsentSession } from "../../../../lib/privacy/receipt";
import { CONSENT_VERSION } from "../../../../lib/privacy/consent";

export const runtime = "nodejs";
const reply = (body: object, status = 200) => NextResponse.json(body, {
  status, headers: { "Cache-Control": "no-store", "Vary": "Cookie", "Referrer-Policy": "no-referrer" },
});
const options = { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" };
function sessionResponse(session: ConsentSession, key: Buffer, advertising: boolean, receipt?: { issuedAt: number; expiresAt: number } | null) {
  const sessionToken = signPayload(session, key);
  const response = reply({ success: true, sessionId: session.id, revision: session.revision, sessionToken,
    sessionExpiresAt: session.expiresAt,
    advertising, issuedAt: receipt?.issuedAt, expiresAt: receipt?.expiresAt });
  response.cookies.set(SESSION_COOKIE, sessionToken, { ...options, expires: new Date(session.expiresAt) });
  return response;
}
export async function GET(request: NextRequest) {
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply({ error: "Origem inválida." }, 403);
  try {
    const key = signingKey();
    const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value, key);
    if (!session) return sessionResponse(newSession(), key, false);
    const current = await readConsent(session, request.cookies.get(RECEIPT_COOKIE)?.value);
    return sessionResponse(current.session, key, Boolean(current.receipt), current.receipt);
  } catch { return reply({ error: "Não foi possível verificar sua escolha." }, 503); }
}
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return reply({ error: "Origem inválida." }, 403);
  let body;
  try { body = await request.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
  if (!body || typeof body.advertising !== "boolean" || body.version !== CONSENT_VERSION ||
    !Number.isSafeInteger(body.expectedRevision) || body.expectedRevision < 0 || typeof body.sessionToken !== "string")
    return reply({ error: "Escolha inválida." }, 400);
  try {
    const key = signingKey();
    const session = verifySession(body.sessionToken, key);
    const cookie = verifySession(request.cookies.get(SESSION_COOKIE)?.value, key);
    if (!session || !cookie || session.id !== cookie.id || session.revision !== body.expectedRevision)
      return reply({ error: "Atualize as preferências antes de salvar." }, 409);
    const result = await changeConsent(session, body.advertising, body.expectedRevision);
    const response = sessionResponse(result.session, key, Boolean(result.issued), result.issued?.receipt);
    response.cookies.set(RECEIPT_COOKIE, result.issued?.token ?? "", { ...options,
      ...(result.issued ? { expires: new Date(result.issued.receipt.expiresAt) } : { maxAge: 0 }) });
    return response;
  } catch (error) {
    if (error instanceof ConsentConflict) return reply({ error: "A escolha mudou. Revise e tente novamente.", revision: error.revision }, error.status);
    // Do not claim revocation succeeded or discard the cookie needed for retry.
    return reply({ error: "Não foi possível confirmar a escolha. Tente novamente." }, 503);
  }
}
