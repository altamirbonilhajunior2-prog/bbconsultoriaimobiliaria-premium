import { promisify } from "node:util";
import { scrypt, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "./lib/prisma";

const scryptAsync = promisify(scrypt);

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
    maxAge: 60 * 60 * 8,
  },

  providers: [
    Credentials({
      name: "Acesso administrativo",

      credentials: {
        email: {
          label: "E-mail",
          type: "email",
        },

        password: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
        const email =
          typeof credentials?.email ===
          "string"
            ? credentials.email
                .trim()
                .toLowerCase()
            : "";

        const password =
          typeof credentials?.password ===
          "string"
            ? credentials.password
            : "";

        if (!email || !password) {
          return null;
        }

        // ADMINISTRADOR PRINCIPAL
        const adminEmail =
          process.env.ADMIN_EMAIL
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

          if (passwordIsValid) {
            return {
              id: "bb-admin",
              name:
                process.env.ADMIN_NAME ||
                "Administrador B&B",
              email: adminEmail,
              role: "ADMIN",
              agentId: null,
            };
          }
        }

        // CAPTADOR / ANGARIADOR
        const agent =
          await prisma.agent.findUnique({
            where: {
              email,
            },
          });

        if (!agent || !agent.active) {
          return null;
        }

        const passwordIsValid =
          await verifyPassword(
            password,
            agent.passwordHash,
            agent.passwordSalt,
          );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: `agent-${agent.id}`,
          name: agent.name,
          email: agent.email,
          role: agent.role,
          agentId: agent.id,
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
      if (session.user) {
        session.user.role =
          token.role === "ADMIN"
            ? "ADMIN"
            : "CAPTADOR";

        session.user.agentId =
          typeof token.agentId ===
          "number"
            ? token.agentId
            : null;
      }

      return session;
    },
  },
});