"use server";

import { AuthError } from "next-auth";
import { signIn } from "../../auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return {
      error: "Preencha o e-mail e a senha.",
    };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: "/admin",
    });

    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        error: "E-mail ou senha inválidos.",
      };
    }

    throw error;
  }
}