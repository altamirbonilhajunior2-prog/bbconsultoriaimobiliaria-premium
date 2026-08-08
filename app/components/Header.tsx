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

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[112px] w-full max-w-[1800px] items-center px-5 sm:px-6 lg:px-8 xl:px-10">

        <div className="flex w-[215px] shrink-0 items-center justify-start xl:w-[235px] 2xl:w-[260px]">
          <Link
            href="/"
            aria-label="B&B Consultoria Imobili\u00E1ria"
            className="relative block h-[96px] w-[190px] overflow-hidden xl:w-[205px]"
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
        </div>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 lg:flex xl:gap-5 2xl:gap-6">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap py-3 text-[10px] font-medium uppercase tracking-[0.07em] text-zinc-200 transition after:absolute after:bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#D5A85A] after:transition-all hover:text-[#D5A85A] hover:after:w-full xl:text-[11px] xl:tracking-[0.08em] 2xl:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center justify-end gap-3">
          <Link
            href="/admin"
            className="inline-flex h-14 shrink-0 items-center justify-center border border-zinc-700 px-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-300 transition hover:border-[#D5A85A] hover:text-[#D5A85A] xl:px-6 xl:text-[11px]"
          >
            Admin
          </Link>

          <Link
            href="/agendar-visita"
            aria-label="Abrir question\u00E1rio para agendar uma visita"
            className="inline-flex h-14 shrink-0 items-center justify-center whitespace-nowrap border border-[#D5A85A] px-5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D5A85A] transition-all duration-300 hover:bg-[#D5A85A] hover:text-black xl:px-6 xl:text-[11px] 2xl:px-7"
          >
            Agendar visita
          </Link>
        </div>

      </div>
    </header>
  );
}
