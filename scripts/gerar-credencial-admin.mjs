import { randomBytes, scryptSync } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({
  input,
  output,
});

function escapeEnvValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function hiddenQuestion(question) {
  return new Promise((resolve, reject) => {
    let password = "";

    output.write(question);

    if (!input.isTTY) {
      reject(new Error("Execute este script diretamente no terminal."));
      return;
    }

    input.resume();
    input.setRawMode(true);

    const onData = (buffer) => {
      const char = buffer.toString("utf8");

      if (char === "\u0003") {
        input.setRawMode(false);
        input.pause();
        input.off("data", onData);
        output.write("\n");
        reject(new Error("Operação cancelada."));
        return;
      }

      if (char === "\r" || char === "\n") {
        input.setRawMode(false);
        input.pause();
        input.off("data", onData);
        output.write("\n");
        resolve(password);
        return;
      }

      if (char === "\u007f" || char === "\b") {
        password = password.slice(0, -1);
        return;
      }

      password += char;
    };

    input.on("data", onData);
  });
}

try {
  const email = (
    await rl.question("E-mail administrativo: ")
  )
    .trim()
    .toLowerCase();

  const name = (
    await rl.question("Nome exibido no painel: ")
  ).trim();

  rl.close();

  const password = await hiddenQuestion(
    "Crie uma senha com pelo menos 12 caracteres: ",
  );

  if (!email || !email.includes("@")) {
    throw new Error("Informe um e-mail válido.");
  }

  if (password.length < 12) {
    throw new Error(
      "A senha precisa ter pelo menos 12 caracteres.",
    );
  }

  const salt = randomBytes(24).toString("hex");

  const hash = scryptSync(
    password,
    salt,
    64,
  ).toString("hex");

  const envPath = path.join(
    process.cwd(),
    ".env.local",
  );

  let envContent = "";

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(
      envPath,
      "utf8",
    );
  }

  const keysToRemove = [
    "ADMIN_NAME",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD_SALT",
    "ADMIN_PASSWORD_HASH",
  ];

  const preservedLines = envContent
    .split(/\r?\n/)
    .filter((line) => {
      return !keysToRemove.some((key) =>
        line.startsWith(`${key}=`),
      );
    })
    .filter((line, index, array) => {
      return !(
        line === "" &&
        index === array.length - 1
      );
    });

  const adminLines = [
    `ADMIN_NAME="${escapeEnvValue(
      name || "Administrador B&B",
    )}"`,
    `ADMIN_EMAIL="${escapeEnvValue(email)}"`,
    `ADMIN_PASSWORD_SALT="${salt}"`,
    `ADMIN_PASSWORD_HASH="${hash}"`,
  ];

  const finalContent = [
    ...preservedLines,
    ...adminLines,
    "",
  ].join("\n");

  fs.writeFileSync(
    envPath,
    finalContent,
    "utf8",
  );

  console.log("");
  console.log(
    "Credenciais administrativas configuradas com sucesso.",
  );
  console.log(
    "A senha não foi gravada em texto puro.",
  );
} catch (error) {
  console.error("");
  console.error(
    error instanceof Error
      ? error.message
      : "Erro ao gerar as credenciais.",
  );

  process.exitCode = 1;
}