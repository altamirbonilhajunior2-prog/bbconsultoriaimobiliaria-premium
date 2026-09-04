import Link from "next/link";

import { prisma } from "../../lib/prisma";
import { getAccessContext } from "../../lib/admin/access";
import LogoutButton from "./components/LogoutButton";

export const dynamic = "force-dynamic";

const managementLinks = [
  {
    title: "Imóveis",
    description:
      "Visualizar, editar e gerenciar os imóveis cadastrados.",
    href: "/admin/imoveis",
  },
  {
    title: "Proprietários",
    description:
      "Cadastrar e consultar proprietários dos imóveis.",
    href: "/admin/proprietarios",
  },
  {
    title: "Captadores / Angariadores",
    description:
      "Gerenciar profissionais responsáveis pelas captações.",
    href: "/admin/captadores",
  },
  {
    title: "Captação IA",
    description:
      "Localizar, selecionar e acompanhar oportunidades até a autorização e publicação.",
    href: "/admin/captacao-ia",
  },
  {
    title: "Bairros",
    description:
      "Organizar bairros e regiões atendidas pela B&B.",
    href: "/admin/bairros",
  },
  {
    title: "Referências de mercado",
    description:
      "Registrar fontes, imóveis comparáveis e faixas de valor por metro quadrado.",
    href: "/admin/referencias-mercado",
  },
  {
    title: "Localização dos bairros",
    description:
      "Validar o ponto público usado pelo mapa de cada bairro, sem cadastrar o endereço do imóvel.",
    href: "/admin/localizacoes-mapa",
  },
  {
    title: "Condomínios",
    description:
      "Gerenciar condomínios residenciais cadastrados.",
    href: "/admin/condominios",
  },
  {
    title: "Edifícios",
    description:
      "Gerenciar edifícios e empreendimentos verticais.",
    href: "/admin/edificios",
  },
  {
    title: "Clientes e leads",
    description:
      "Acompanhar contatos e oportunidades comerciais.",
    href: "/admin/clientes",
  },
  {
    title: "Configurações",
    description:
      "Dados da empresa, SEO e integrações do portal.",
    href: "/admin/configuracoes",
  },
];

function formatLeadDate(
  value: Date,
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone:
        "America/Sao_Paulo",
    },
  ).format(value);
}

export default async function AdminPage() {
  const access =
    await getAccessContext();

  const visibleManagementLinks =
    access.isAdmin
      ? managementLinks
      : managementLinks.filter(
          (item) =>
            item.href !==
            "/admin/captadores",
        );

  const [
    totalProperties,
    highlightedProperties,
    saleProperties,
    rentalProperties,
    availableProperties,
    analysisProperties,
    newPortalLeads,
    latestNewLeads,
  ] = await Promise.all([
    prisma.property.count(),

    prisma.property.count({
      where: {
        highlight: true,
      },
    }),

    prisma.property.count({
      where: {
        purpose: {
          in: [
            "VENDA",
            "VENDA_E_LOCACAO",
          ],
        },
      },
    }),

    prisma.property.count({
      where: {
        purpose: {
          in: [
            "LOCACAO",
            "VENDA_E_LOCACAO",
          ],
        },
      },
    }),

    prisma.property.count({
      where: {
        status: "DISPONIVEL",
      },
    }),

    prisma.property.count({
      where: {
        status: "EM_ANALISE",
      },
    }),

    prisma.portalLead.count({
      where: {
        status: "NOVO",
      },
    }),

    prisma.portalLead.findMany({
      where: {
        status: "NOVO",
      },

      orderBy: {
        createdAt: "desc",
      },

      take: 3,

      select: {
        id: true,
        name: true,
        propertyCode: true,
        propertyTitle: true,
        createdAt: true,
        utmSource: true,
        utmCampaign: true,
      },
    }),
  ]);

  const indicators = [
    {
      label:
        "Imóveis cadastrados",
      value:
        totalProperties,
      detail:
        "Total no banco de dados",
    },
    {
      label:
        "Destaques",
      value:
        highlightedProperties,
      detail:
        "Exibidos com prioridade",
    },
    {
      label:
        "À venda",
      value:
        saleProperties,
      detail:
        "Venda ou venda e locação",
    },
    {
      label:
        "Para locação",
      value:
        rentalProperties,
      detail:
        "Locação ou venda e locação",
    },
    {
      label:
        "Disponíveis",
      value:
        availableProperties,
      detail:
        "Prontos para atendimento",
    },
    {
      label:
        "Em análise",
      value:
        analysisProperties,
      detail:
        "Aguardando revisão",
    },
    {
      label:
        "Novos leads",
      value:
        newPortalLeads,
      detail:
        "Aguardando atendimento",
    },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <header className="flex flex-col gap-8 border-b border-white/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              B&amp;B Consultoria
              Imobiliária
            </p>

            <h1 className="mt-3 font-serif text-5xl font-normal">
              CRM B&amp;B
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400">
              Ambiente interno para
              gestão de imóveis,
              proprietários,
              captações, clientes e
              operações da B&amp;B
              Consultoria Imobiliária.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              target="_blank"
              className="inline-flex min-h-14 items-center justify-center border border-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-amber-400 transition hover:bg-amber-500 hover:text-black"
            >
              Ver portal público
            </Link>

            <LogoutButton />
          </div>
        </header>

        {newPortalLeads > 0 ? (
          <section className="mt-8 border border-amber-500 bg-amber-500/10">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between lg:p-8">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex min-h-9 items-center justify-center bg-amber-500 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                    Atenção
                  </span>

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
                    Novos contatos
                    aguardando atendimento
                  </p>
                </div>

                <h2 className="mt-4 font-serif text-3xl font-normal">
                  {newPortalLeads === 1
                    ? "1 novo lead no CRM"
                    : `${newPortalLeads} novos leads no CRM`}
                </h2>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                  Estes contatos ainda
                  estão com status Novo.
                  Abra a área de Clientes
                  e leads para iniciar o
                  atendimento e atualizar
                  a etapa comercial.
                </p>

                {latestNewLeads.length >
                0 ? (
                  <div className="mt-6 grid gap-3 xl:grid-cols-3">
                    {latestNewLeads.map(
                      (lead) => {
                        const source =
                          lead.utmSource ||
                          lead.utmCampaign
                            ? [
                                lead.utmSource,
                                lead.utmCampaign,
                              ]
                                .filter(
                                  Boolean,
                                )
                                .join(
                                  " · ",
                                )
                            : "Portal";

                        return (
                          <article
                            key={
                              lead.id
                            }
                            className="border border-amber-500/20 bg-black/30 p-4"
                          >
                            <p className="text-base font-semibold text-white">
                              {
                                lead.name
                              }
                            </p>

                            <p className="mt-2 text-xs leading-5 text-zinc-300">
                              <span className="font-semibold text-amber-300">
                                {
                                  lead.propertyCode
                                }
                              </span>
                              {" — "}
                              {
                                lead.propertyTitle
                              }
                            </p>

                            <div className="mt-3 border-t border-white/10 pt-3 text-[10px] leading-5 text-zinc-500">
                              <p>
                                {
                                  formatLeadDate(
                                    lead.createdAt,
                                  )
                                }
                              </p>

                              <p>
                                Origem:{" "}
                                {
                                  source
                                }
                              </p>
                            </div>
                          </article>
                        );
                      },
                    )}
                  </div>
                ) : null}
              </div>

              <Link
                href="/admin/clientes"
                className="inline-flex min-h-12 shrink-0 items-center justify-center bg-amber-500 px-6 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-black transition hover:bg-amber-400"
              >
                Atender novos leads
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 border border-emerald-500/20 bg-emerald-500/5 px-6 py-5">
            <p className="text-sm text-emerald-300">
              Nenhum lead novo
              aguardando atendimento
              neste momento.
            </p>
          </section>
        )}

        <section className="mt-10">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
                Visão geral
              </p>

              <h2 className="mt-3 font-serif text-4xl font-normal">
                Indicadores da operação
              </h2>
            </div>

            <Link
              href="/admin/imoveis/novo"
              className="inline-flex min-h-14 w-fit items-center justify-center bg-amber-500 px-7 text-center text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400"
            >
              Cadastrar imóvel
            </Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {indicators.map(
              (indicator) => (
                <article
                  key={
                    indicator.label
                  }
                  className="border border-white/10 bg-[#0b0b0b] p-7"
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
                    {
                      indicator.label
                    }
                  </p>

                  <p className="mt-4 font-serif text-5xl font-normal text-white">
                    {
                      indicator.value
                    }
                  </p>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {
                      indicator.detail
                    }
                  </p>
                </article>
              ),
            )}
          </div>
        </section>

        <section className="mt-14">
          <div className="border-b border-white/10 pb-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
              CRM B&amp;B
            </p>

            <h2 className="mt-3 font-serif text-4xl font-normal">
              Áreas de gestão
            </h2>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleManagementLinks.map(
              (item) => (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className="group border border-white/10 bg-[#0b0b0b] p-7 transition hover:border-amber-500/60 hover:bg-[#101010]"
                >
                  <h3 className="font-serif text-2xl font-normal transition group-hover:text-amber-400">
                    {
                      item.title
                    }
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-zinc-400">
                    {
                      item.description
                    }
                  </p>

                  <span className="mt-7 inline-flex text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">
                    Abrir área →
                  </span>
                </Link>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}