"use client";

type DeleteOwnerButtonProps = {
  action: () => void;
};

export default function DeleteOwnerButton({
  action,
}: DeleteOwnerButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        const confirmed =
          window.confirm(
            "Tem certeza que deseja excluir este proprietário?",
          );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="min-h-14 border border-red-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-red-400 transition hover:bg-red-500 hover:text-white"
      >
        Excluir proprietário
      </button>
    </form>
  );
}