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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[132px] max-w-[1720px] items-center gap-6 px-6 lg:px-8 xl:px-10">
        <Link
          href="/"
          aria-label="B&B Consultoria Imobiliária"
          className="relative block h-[124px] w-[270px] shrink-0 overflow-hidden"
        >
          <Image
            src="/logo-bb.png"
            alt="B&B Consultoria Imobiliária"
            fill
            priority
            sizes="270px"
            className="scale-[1.38] object-contain object-center transition-transform duration-300 hover:scale-[1.43]"
          />
        </Link>

        <nav
          aria-label="Navegação principal"
          className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative whitespace-nowrap py-3 text-[11px] font-medium uppercase tracking-[0.1em] text-zinc-200 transition-colors duration-300 after:absolute after:bottom-1 after:left-0 after:h-px after:w-0 after:bg-[#D5A85A] after:transition-all after:duration-300 hover:text-[#D5A85A] hover:after:w-full xl:text-[12px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20agendar%20uma%20conversa."
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-14 shrink-0 items-center justify-center border border-[#D5A85A] px-6 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-[#D5A85A] transition-all duration-300 hover:bg-[#D5A85A] hover:text-black xl:px-8 xl:text-[11px]"
        >
          Agendar conversa
        </a>
      </div>
    </header>
  );
}