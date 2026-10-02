import {
  createHmac,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "./lib/prisma";

const scryptAsync = promisify(scrypt);

const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;

async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
) {
  const derivedKey = (await scryptAsync(
    password,
    salt,
    64,
  )) as Buffer;

  const storedKey = Buffer.from(
    storedHash,
    "hex",
  );

  if (
    storedKey.length !==
    derivedKey.length
  ) {
    return false;
  }

  return timingSafeEqual(
    storedKey,
    derivedKey,
  );
}

function isAdminTwoFactorEnabled() {
  return (
    process.env.ADMIN_2FA_ENABLED
      ?.trim()
      .toLowerCase() === "true"
  );
}

function getAdminTotpSecret(
  email: string,
) {
  const raw =
    process.env
      .ADMIN_TOTP_SECRETS_JSON;

  if (!raw) {
    return null;
  }

  try {
    const parsed =
      JSON.parse(raw) as unknown;

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    const secrets =
      parsed as Record<
        string,
        unknown
      >;

    const normalizedEmail =
      email.trim().toLowerCase();

    for (
      const [
        configuredEmail,
        value,
      ] of Object.entries(
        secrets,
      )
    ) {
      if (
        configuredEmail
          .trim()
          .toLowerCase() !==
        normalizedEmail
      ) {
        continue;
      }

      if (
        typeof value !== "string"
      ) {
        return null;
      }

      const secret =
        value
          .trim()
          .toUpperCase()
          .replace(
            /[\s-]+/g,
            "",
          );

      return secret || null;
    }

    return null;
  } catch {
    return null;
  }
}

function decodeBase32(
  secret: string,
) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  const normalized =
    secret
      .trim()
      .toUpperCase()
      .replace(
        /[\s=-]+/g,
        "",
      );

  if (
    !normalized ||
    !/^[A-Z2-7]+$/.test(
      normalized,
    )
  ) {
    return null;
  }

  let bits = "";

  for (
    const character of normalized
  ) {
    const value =
      alphabet.indexOf(
        character,
      );

    if (value < 0) {
      return null;
    }

    bits += value
      .toString(2)
      .padStart(
        5,
        "0",
      );
  }

  const bytes: number[] = [];

  for (
    let index = 0;
    index + 8 <= bits.length;
    index += 8
  ) {
    bytes.push(
      Number.parseInt(
        bits.slice(
          index,
          index + 8,
        ),
        2,
      ),
    );
  }

  return Buffer.from(
    bytes,
  );
}

function generateTotp(
  secret: string,
  counter: number,
) {
  const decoded =
    decodeBase32(
      secret,
    );

  if (
    !decoded ||
    decoded.length === 0
  ) {
    return null;
  }

  const counterBuffer =
    Buffer.alloc(8);

  counterBuffer.writeBigUInt64BE(
    BigInt(counter),
  );

  const digest =
    createHmac(
      "sha1",
      decoded,
    )
      .update(
        counterBuffer,
      )
      .digest();

  const offset =
    digest[
      digest.length - 1
    ] & 0x0f;

  const binary =
    (
      (
        digest[offset] &
        0x7f
      ) <<
      24
    ) |
    (
      digest[
        offset + 1
      ] <<
      16
    ) |
    (
      digest[
        offset + 2
      ] <<
      8
    ) |
    digest[
      offset + 3
    ];

  const token =
    binary %
    10 ** TOTP_DIGITS;

  return token
    .toString()
    .padStart(
      TOTP_DIGITS,
      "0",
    );
}

function verifyTotp(
  secret: string,
  code: string,
) {
  const normalizedCode =
    code
      .trim()
      .replace(
        /\s+/g,
        "",
      );

  if (
    !/^\d{6}$/.test(
      normalizedCode,
    )
  ) {
    return false;
  }

  const currentCounter =
    Math.floor(
      Date.now() /
        1000 /
        TOTP_STEP_SECONDS,
    );

  for (
    const offset of [
      -1,
      0,
      1,
    ]
  ) {
    const expected =
      generateTotp(
        secret,
        currentCounter +
          offset,
      );

    if (!expected) {
      continue;
    }

    const expectedBuffer =
      Buffer.from(
        expected,
      );

    const receivedBuffer =
      Buffer.from(
        normalizedCode,
      );

    if (
      expectedBuffer.length ===
        receivedBuffer.length &&
      timingSafeEqual(
        expectedBuffer,
        receivedBuffer,
      )
    ) {
      return true;
    }
  }

  return false;
}

function verifyAdminSecondFactor(
  email: string,
  code: string,
) {
  if (
    !isAdminTwoFactorEnabled()
  ) {
    return true;
  }

  const secret =
    getAdminTotpSecret(
      email,
    );

  if (!secret) {
    return false;
  }

  return verifyTotp(
    secret,
    code,
  );
}

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  trustHost: true,

  pages: {
    signIn: "/login-admin",
  },

  session: {
    strategy: "jwt",
    maxAge:
      60 * 60 * 8,
  },

  providers: [
    Credentials({
      name:
        "Acesso administrativo",

      credentials: {
        email: {
          label: "E-mail",
          type: "email",
        },

        password: {
          label: "Senha",
          type: "password",
        },

        otp: {
          label:
            "Código de autenticação",
          type: "text",
        },
      },

      async authorize(
        credentials,
      ) {
        const email =
          typeof credentials
            ?.email ===
          "string"
            ? credentials.email
                .trim()
                .toLowerCase()
            : "";

        const password =
          typeof credentials
            ?.password ===
          "string"
            ? credentials
                .password
            : "";

        const otp =
          typeof credentials
            ?.otp ===
          "string"
            ? credentials.otp
            : "";

        if (
          !email ||
          !password
        ) {
          return null;
        }

        // ADMINISTRADOR PRINCIPAL
        const adminEmail =
          process.env
            .ADMIN_EMAIL
            ?.trim()
            .toLowerCase();

        const adminPasswordHash =
          process.env
            .ADMIN_PASSWORD_HASH;

        const adminPasswordSalt =
          process.env
            .ADMIN_PASSWORD_SALT;

        if (
          adminEmail &&
          adminPasswordHash &&
          adminPasswordSalt &&
          email === adminEmail
        ) {
          const passwordIsValid =
            await verifyPassword(
              password,
              adminPasswordHash,
              adminPasswordSalt,
            );

          if (
            passwordIsValid &&
            verifyAdminSecondFactor(
              adminEmail,
              otp,
            )
          ) {
            return {
              id: "bb-admin",
              name:
                process.env
                  .ADMIN_NAME ||
                "Administrador B&B",
              email:
                adminEmail,
              role: "ADMIN",
              agentId:
                null,
            };
          }

          return null;
        }

        // CAPTADOR / ADMIN DO CRM
        const agent =
          await prisma.agent.findUnique(
            {
              where: {
                email,
              },
            },
          );

        if (
          !agent ||
          !agent.active
        ) {
          return null;
        }

        const passwordIsValid =
          await verifyPassword(
            password,
            agent.passwordHash,
            agent.passwordSalt,
          );

        if (
          !passwordIsValid
        ) {
          return null;
        }

        if (
          agent.role ===
            "ADMIN" &&
          !verifyAdminSecondFactor(
            agent.email,
            otp,
          )
        ) {
          return null;
        }

        return {
          id:
            `agent-${agent.id}`,
          name:
            agent.name,
          email:
            agent.email,
          role:
            agent.role,
          agentId:
            agent.id,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({
      token,
      user,
    }) {
      if (user) {
        token.role =
          "role" in user
            ? user.role
            : "CAPTADOR";

        token.agentId =
          "agentId" in user
            ? user.agentId
            : null;
      }

      return token;
    },

    async session({
      session,
      token,
    }) {
      if (
        session.user
      ) {
        session.user.role =
          token.role ===
          "ADMIN"
            ? "ADMIN"
            : "CAPTADOR";

        session.user.agentId =
          typeof token
            .agentId ===
          "number"
            ? token.agentId
            : null;
      }

      return session;
    },
  },
});