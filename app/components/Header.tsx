import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Comprar", href: "/comprar" },
  { label: "Alugar", href: "/alugar" },
  { label: "Lançamentos", href: "/lancamentos" },
  { label: "Bairros", href: "/bairros" },
  { label: "Nossa metodologia", href: "/consultoria" },
  { label: "Sobre", href: "/quem-somos" },
  { label: "Contato", href: "/contato" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[84px] w-full max-w-[1800px] items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:h-[112px] lg:px-8 xl:px-10">

        <div className="flex w-[105px] shrink-0 items-center justify-start sm:w-[145px] lg:w-[215px] xl:w-[235px] 2xl:w-[260px]">
          <Link
            href="/"
            aria-label={"B&B Consultoria Imobiliária"}
            className="relative block h-[66px] w-[105px] overflow-hidden sm:h-[74px] sm:w-[145px] lg:h-[96px] lg:w-[190px] xl:w-[205px]"
          >
            <Image
              src="/logo-bb.png"
              alt={"B&B Consultoria Imobiliária"}
              fill
              priority
              sizes="(max-width: 640px) 105px, (max-width: 1024px) 145px, 205px"
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

        <div className="ml-auto hidden shrink-0 items-center justify-end gap-3 lg:flex">
          <Link
            href="/agendar-visita"
            className="inline-flex h-14 shrink-0 items-center justify-center whitespace-nowrap border border-[#D5A85A] px-5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-[#D5A85A] transition-all duration-300 hover:bg-[#D5A85A] hover:text-black xl:px-6 xl:text-[11px] 2xl:px-7"
          >
            Agendar visita
          </Link>
        </div>

        <div className="ml-auto flex min-w-0 items-center justify-end gap-2 lg:hidden">
          <Link
            href="/agendar-visita"
            className="inline-flex h-10 shrink-0 items-center justify-center whitespace-nowrap border border-[#D5A85A] px-2.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#D5A85A] transition hover:bg-[#D5A85A] hover:text-black sm:h-11 sm:px-4 sm:text-[9px] sm:tracking-[0.10em]"
          >
            Agendar visita
          </Link>

          <details className="group relative shrink-0">
            <summary
              aria-label="Abrir menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center border border-white/15 text-white transition hover:border-[#D5A85A] hover:text-[#D5A85A] sm:h-11 sm:w-11 [&::-webkit-details-marker]:hidden"
            >
              <span className="flex w-5 flex-col gap-[5px]">
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
                <span className="block h-px w-full bg-current" />
              </span>
            </summary>

            <div className="absolute right-0 top-[50px] z-[70] w-[280px] border border-white/10 bg-[#080808] p-3 shadow-2xl">
              <nav className="flex flex-col">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-b border-white/10 px-4 py-4 text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-200 transition hover:bg-white/5 hover:text-[#D5A85A]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </div>

      </div>
    </header>
  );
}