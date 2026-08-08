import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Comprar", href: "/comprar" },
  { label: "Alugar", href: "/alugar" },
  { label: "Lan\u00E7amentos", href: "/lancamentos" },
  { label: "Bairros", href: "/bairros" },
  { label: "Nossa metodologia", href: "/consultoria" },
  { label: "Sobre", href: "/quem-somos" },
  { label: "Contato", href: "/contato" },
];

type HeaderProps = {
  hideScheduleButton?: boolean;
};

export default function Header({
  hideScheduleButton = false,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[104px] w-full max-w-[1720px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-5 lg:px-7 xl:px-9 2xl:px-10">
        <Link
          href="/"
          aria-label="B&B Consultoria Imobili\u00E1ria"
          className="relative block h-[88px] w-[165px] shrink-0 overflow-hidden sm:w-[185px] lg:w-[195px] xl:w-[205px]"
        >
          <Image
            src="/logo-bb.png"
            alt="B&B Consultoria Imobili\u00E1ria"
            fill
            priority
            sizes="205px"
            className="object-contain object-center transition-transform duration-300 hover:scale-[1.03]"
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-3 lg:flex xl:gap-4 2xl:gap-5">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap py-3 text-[9px] font-medium uppercase tracking-[0.07em] text-zinc-200 transition after:absolute after:bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#D5A85A] after:transition-all hover:text-[#D5A85A] hover:after:w-full xl:text-[10px] xl:tracking-[0.08em] 2xl:text-[11px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 xl:gap-3">
          <Link
            href="/admin"
            className="inline-flex h-12 items-center justify-center border border-zinc-700 px-3 text-[9px] font-semibold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-[#D5A85A] hover:text-[#D5A85A] xl:px-4 xl:text-[10px]"
          >
            Admin
          </Link>

          {!hideScheduleButton && (
            <Link
              href="/agendar-visita"
              aria-label="Abrir question\u00E1rio para agendar uma visita"
              className="inline-flex h-12 shrink-0 items-center justify-center whitespace-nowrap border border-[#D5A85A] px-4 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-[#D5A85A] transition-all duration-300 hover:bg-[#D5A85A] hover:text-black xl:px-5 xl:text-[10px] 2xl:px-6"
            >
              Agendar visita
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
