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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[120px] max-w-[1720px] items-center justify-between px-8 lg:px-10">

        <Link
          href="/"
          className="relative h-[88px] w-[230px] shrink-0 transition duration-300 hover:scale-[1.02]"
        >
          <Image
            src="/logo-bb.png"
            alt="B&B Consultoria Imobiliária"
            fill
            priority
            className="object-contain object-left"
          />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-[12px] font-medium uppercase tracking-[0.16em] text-zinc-200 transition duration-300 hover:text-[#D5A85A] after:absolute after:-bottom-2 after:left-0 after:h-px after:w-0 after:bg-[#D5A85A] after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <a
          href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20agendar%20uma%20conversa."
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center border border-[#D5A85A] px-7 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#D5A85A] transition-all duration-300 hover:bg-[#D5A85A] hover:text-black"
        >
          Agendar conversa
        </a>

      </div>
    </header>
  );
}