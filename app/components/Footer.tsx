import Image from "next/image";
import Link from "next/link";

const navigation = [
  { label: "Comprar", href: "/comprar" },
  { label: "Alugar", href: "/alugar" },
  { label: "Lançamentos", href: "/lancamentos" },
  { label: "Bairros", href: "/bairros" },
  { label: "Consultoria", href: "/consultoria" },
  { label: "Sobre", href: "/quem-somos" },
];

const neighborhoods = [
  "Urbanova",
  "Jardim Aquarius",
  "Colinas do Parahyba",
  "Altos do Esplanada",
  "Condomínios fechados",
];

export default function Footer() {
  return (
    <footer className="border-t border-amber-500/30 bg-black text-white">
      <div className="mx-auto grid max-w-[1720px] gap-12 px-6 py-16 md:grid-cols-2 lg:px-10 xl:grid-cols-[1.2fr_0.7fr_0.9fr_1fr] xl:px-12">
        <div>
          <Link
            href="/"
            aria-label="B&B Consultoria Imobiliária"
            className="relative block h-[180px] w-[310px] max-w-full"
          >
            <Image
              src="/logo-bb.png"
              alt="B&B Consultoria Imobiliária"
              fill
              sizes="310px"
              className="object-contain object-left"
            />
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            Nós atuamos com análise, curadoria e orientação estratégica para
            decisões imobiliárias mais seguras em São José dos Campos.
          </p>

          <p className="mt-5 font-serif text-xl text-amber-400">
            Mais que imóveis. Estratégia para grandes decisões.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            Navegação
          </h2>

          <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-400">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            Regiões de atuação
          </h2>

          <div className="mt-6 space-y-3 text-sm text-zinc-400">
            {neighborhoods.map((neighborhood) => (
              <p key={neighborhood}>{neighborhood}</p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-400">
            Atendimento
          </h2>

          <div className="mt-6 space-y-3 text-sm leading-6 text-zinc-400">
            <p>São José dos Campos — SP</p>
            <p>(12) 97814-0636</p>
            <p>Atendimento consultivo e personalizado.</p>
            <p>CRECI: inserir número</p>
          </div>

          <a
            href="https://wa.me/5512978140636?text=Olá,%20gostaria%20de%20falar%20com%20a%20B%26B%20Consultoria%20Imobiliária."
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex min-h-13 w-full items-center justify-center bg-amber-500 px-6 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-3 px-6 py-5 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between lg:px-10 xl:px-12">
          <p>
            © {new Date().getFullYear()} B&B Consultoria Imobiliária. Todos os
            direitos reservados.
          </p>

          <p>Construindo valor. Realizando sonhos.</p>
        </div>
      </div>
    </footer>
  );
}