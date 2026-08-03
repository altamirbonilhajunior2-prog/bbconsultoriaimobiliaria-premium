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

const neighborhoods = [
  "Urbanova",
  "Jardim Aquarius",
  "Colinas do Parahyba",
  "Altos do Esplanada",
  "Condomínios fechados",
];

export default function Footer() {
  return (
    <footer className="border-t border-[#D5A85A]/30 bg-black text-white">
      <div className="mx-auto grid max-w-[1720px] gap-12 px-6 py-16 md:grid-cols-2 lg:px-10 xl:grid-cols-[1.25fr_0.7fr_0.9fr_1fr] xl:px-12">
        <div>
          <Link
            href="/"
            aria-label="B&B Consultoria Imobiliária"
            className="relative block h-[190px] w-[340px] max-w-full overflow-hidden"
          >
            <Image
              src="/logo-bb.png"
              alt="B&B Consultoria Imobiliária"
              fill
              sizes="340px"
              className="scale-[1.28] object-contain object-center"
            />
          </Link>

          <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
            Nós atuamos com análise, curadoria e orientação estratégica para
            decisões imobiliárias mais seguras em São José dos Campos.
          </p>

          <p className="mt-5 max-w-md font-serif text-xl leading-8 text-[#D5A85A]">
            Mais que imóveis. Estratégia para grandes decisões.
          </p>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#D5A85A]">
            Navegação
          </h2>

          <div className="mt-6 flex flex-col gap-3 text-sm text-zinc-400">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="w-fit transition-colors duration-300 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#D5A85A]">
            Regiões de atuação
          </h2>

          <div className="mt-6 space-y-3 text-sm text-zinc-400">
            {neighborhoods.map((neighborhood) => (
              <p key={neighborhood}>{neighborhood}</p>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-[#D5A85A]">
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
            className="mt-7 inline-flex min-h-13 w-full items-center justify-center bg-[#D5A85A] px-6 text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors duration-300 hover:bg-[#E5BC6B]"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1720px] flex-col gap-3 px-6 py-5 text-xs text-zinc-600 md:flex-row md:items-center md:justify-between lg:px-10 xl:px-12">
          <p>
            © {new Date().getFullYear()} B&amp;B Consultoria Imobiliária. Todos
            os direitos reservados.
          </p>

          <p>Construindo valor. Realizando sonhos.</p>
        </div>
      </div>
    </footer>
  );
}