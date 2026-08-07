import { promisify } from "node:util";
import { scrypt, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const scryptAsync = promisify(scrypt);

async function verifyPassword(
  password: string,
  storedHash: string,
  salt: string,
) {
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(storedHash, "hex");

  if (storedKey.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedKey, derivedKey);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
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
          typeof credentials?.email === "string"
            ? credentials.email.trim().toLowerCase()
            : "";

        const password =
          typeof credentials?.password === "string"
            ? credentials.password
            : "";

        const adminEmail =
          process.env.ADMIN_EMAIL?.trim().toLowerCase();

        const adminPasswordHash =
          process.env.ADMIN_PASSWORD_HASH;

        const adminPasswordSalt =
          process.env.ADMIN_PASSWORD_SALT;

        if (
          !email ||
          !password ||
          !adminEmail ||
          !adminPasswordHash ||
          !adminPasswordSalt
        ) {
          return null;
        }

        if (email !== adminEmail) {
          return null;
        }

        const passwordIsValid = await verifyPassword(
          password,
          adminPasswordHash,
          adminPasswordSalt,
        );

        if (!passwordIsValid) {
          return null;
        }

        return {
          id: "bb-admin",
          name:
            process.env.ADMIN_NAME ||
            "Administrador B&B",
          email: adminEmail,
        };
      },
    }),
  ],
});