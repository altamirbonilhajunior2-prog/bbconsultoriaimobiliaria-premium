import { signOut } from "../../../auth";

export default function LogoutButton() {
  return (
    <form
      action={async () => {
        "use server";

        await signOut({
          redirectTo: "/login-admin",
        });
      }}
    >
      <button
        type="submit"
        className="inline-flex min-h-14 items-center justify-center border border-white/15 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition hover:border-red-400 hover:text-red-300"
      >
        Sair
      </button>
    </form>
  );
}