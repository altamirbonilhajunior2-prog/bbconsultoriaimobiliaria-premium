"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
} from "react";
import { propertyTypes } from "../../../data/searchOptions";
import {
  createPropertyAction,
  type PropertyFormState,
} from "./actions";

type PropertyType = keyof typeof propertyTypes;

const purposes = [
  "Venda",
  "Locação",
  "Venda e locação",
] as const;

type Purpose = (typeof purposes)[number];

const opportunityProfiles = [
  "Moradia",
  "Investimento",
  "Renda",
  "Valorização",
  "Lançamento",
] as const;

const statuses = [
  "Disponível",
  "Reservado",
  "Vendido",
  "Alugado",
  "Em análise",
] as const;

const initialState: PropertyFormState = {
  success: false,
  message: "",
};

const inputClass =
  "h-14 w-full border border-white/10 bg-[#111111] px-4 text-sm text-white outline-none transition focus:border-amber-500";

const textareaClass =
  "w-full resize-y border border-white/10 bg-[#111111] px-4 py-4 text-sm leading-7 text-white outline-none transition focus:border-amber-500";

const labelTitleClass =
  "text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500";

const sectionClass =
  "border border-white/10 bg-[#0b0b0b] p-7";

const sectionTitleClass =
  "text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400";

const codePrefixes: Record<PropertyType, string> = {
  Casa: "BBC",
  Apartamento: "BBA",
  Terreno: "BBT",
  Comercial: "BBM",
  Rural: "BBR",
};

export default function NovoImovelPage() {
  const [
    formState,
    formAction,
    isPending,
  ] = useActionState(
    createPropertyAction,
    initialState,
  );

  const [propertyType, setPropertyType] =
    useState<PropertyType>("Casa");

  const [purpose, setPurpose] =
    useState<Purpose>("Venda");

  const [
    selectedProfiles,
    setSelectedProfiles,
  ] = useState<string[]>([]);

  const [photoNames, setPhotoNames] =
    useState<string[]>([]);

  const categories = useMemo(
    () => [
      ...propertyTypes[propertyType],
    ],
    [propertyType],
  );

  useEffect(() => {
    if (!formState.message) {
      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [formState.message]);

  function toggleProfile(
    profile: string,
  ) {
    setSelectedProfiles(
      (current) => {
        if (
          current.includes(
            profile,
          )
        ) {
          return current.filter(
            (item) =>
              item !== profile,
          );
        }

        return [
          ...current,
          profile,
        ];
      },
    );
  }

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-[1500px] px-6 py-12 lg:px-10">
        <div className="border-b border-white/10 pb-8">
          <Link
            href="/admin/imoveis"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 transition hover:text-amber-300"
          >
            ← Voltar para imóveis
          </Link>

          <p className="mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            CRM B&amp;B
          </p>

          <h1 className="mt-3 font-serif text-5xl font-normal">
            Novo imóvel
          </h1>

          <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
            Cadastro completo para
            organização, gestão e futura
            publicação dos imóveis no
            Portal B&amp;B.
          </p>

          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm leading-6 text-amber-200">
              O código interno será gerado
              automaticamente pelo CRM de
              acordo com o tipo do imóvel.
            </p>
          </div>

          {formState.message ? (
            <div
              className={`mt-6 border px-5 py-4 ${
                formState.success
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-red-500/30 bg-red-500/10"
              }`}
            >
              <p
                className={`text-sm leading-6 ${
                  formState.success
                    ? "text-emerald-300"
                    : "text-red-300"
                }`}
              >
                {
                  formState.message
                }
              </p>

              {formState.success &&
              formState.propertyId ? (
                <p className="mt-2 text-xs text-emerald-400/70">
                  Registro interno: #
                  {
                    formState.propertyId
                  }
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        <form
          action={formAction}
          className="mt-10 space-y-10"
        >
          {/* IDENTIFICAÇÃO */}

          <section
            className={
              sectionClass
            }
          >
            <p
              className={
                sectionTitleClass
              }
            >
              01. Identificação
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Código automático
                </span>

                <div className="flex h-14 items-center border border-amber-500/20 bg-amber-500/5 px-4 text-sm text-amber-200">
                  {codePrefixes[propertyType]}
                  ### — gerado ao salvar
                </div>
              </div>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Título do imóvel
                </span>

                <input
                  name="title"
                  type="text"
                  required
                  maxLength={200}
                  placeholder="Ex.: Casa contemporânea no Alphaville II"
                  className={
                    inputClass
                  }
                />
              </label>

              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Status
                </span>

                <select
                  name="status"
                  defaultValue="Disponível"
                  className={
                    inputClass
                  }
                >
                  {statuses.map(
                    (status) => (
                      <option
                        key={
                          status
                        }
                        value={
                          status
                        }
                      >
                        {
                          status
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Identificação comercial
                </span>

                <input
                  name="tag"
                  type="text"
                  placeholder="Ex.: Exclusividade B&B"
                  className={
                    inputClass
                  }
                />
              </label>

              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Nota consultiva
                </span>

                <input
                  name="consultantScore"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="0 a 10"
                  className={
                    inputClass
                  }
                />
              </label>

              <label className="flex min-h-14 items-center gap-3 border border-white/10 bg-[#111111] px-4 md:col-span-2">
                <input
                  name="highlight"
                  type="checkbox"
                  className="h-4 w-4 accent-amber-500"
                />

                <span className="text-sm text-zinc-300">
                  Exibir este imóvel como
                  destaque no portal
                </span>
              </label>
            </div>
          </section>

          {/* COMERCIAL */}

          <section
            className={
              sectionClass
            }
          >
            <p
              className={
                sectionTitleClass
              }
            >
              02. Classificação comercial
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Finalidade
                </span>

                <select
                  name="purpose"
                  value={purpose}
                  onChange={(
                    event,
                  ) =>
                    setPurpose(
                      event
                        .target
                        .value as Purpose,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  {purposes.map(
                    (item) => (
                      <option
                        key={
                          item
                        }
                        value={
                          item
                        }
                      >
                        {
                          item
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Tipo
                </span>

                <select
                  name="propertyType"
                  value={
                    propertyType
                  }
                  onChange={(
                    event,
                  ) =>
                    setPropertyType(
                      event
                        .target
                        .value as PropertyType,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  {Object.keys(
                    propertyTypes,
                  ).map(
                    (type) => (
                      <option
                        key={
                          type
                        }
                        value={
                          type
                        }
                      >
                        {
                          type
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="flex flex-col gap-2">
                <span
                  className={
                    labelTitleClass
                  }
                >
                  Categoria
                </span>

                <select
                  name="category"
                  className={
                    inputClass
                  }
                >
                  {categories.map(
                    (
                      category,
                    ) => (
                      <option
                        key={
                          category
                        }
                        value={
                          category
                        }
                      >
                        {
                          category
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            </div>

            <div className="mt-8">
              <p
                className={
                  labelTitleClass
                }
              >
                Perfil da oportunidade
              </p>

              <p className="mt-2 text-sm text-zinc-500">
                É possível selecionar
                mais de um perfil.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {opportunityProfiles.map(
                  (profile) => {
                    const selected =
                      selectedProfiles.includes(
                        profile,
                      );

                    return (
                      <label
                        key={
                          profile
                        }
                        className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 transition ${
                          selected
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-white/10 bg-[#111111] hover:border-white/20"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="opportunityProfile"
                          value={
                            profile
                          }
                          checked={
                            selected
                          }
                          onChange={() =>
                            toggleProfile(
                              profile,
                            )
                          }
                          className="h-4 w-4 accent-amber-500"
                        />

                        <span className="text-sm text-zinc-300">
                          {
                            profile
                          }
                        </span>
                      </label>
                    );
                  },
                )}
              </div>
            </div>
          </section>

          {/* LOCALIZAÇÃO */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              03. Localização
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Estado
                </span>
                <input
                  name="state"
                  type="text"
                  required
                  maxLength={2}
                  defaultValue="SP"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Cidade
                </span>
                <input
                  name="city"
                  type="text"
                  required
                  defaultValue="São José dos Campos"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Bairro
                </span>
                <input
                  name="neighborhood"
                  type="text"
                  required
                  placeholder="Ex.: Urbanova"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Condomínio ou edifício
                </span>
                <input
                  name="development"
                  type="text"
                  placeholder="Ex.: Alphaville II"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-3">
                <span className={labelTitleClass}>
                  Endereço
                </span>
                <input
                  name="address"
                  type="text"
                  placeholder="Rua, avenida, número e complemento"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  CEP
                </span>
                <input
                  name="zipCode"
                  type="text"
                  placeholder="00000-000"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2 xl:col-span-4">
                <span className={labelTitleClass}>
                  Localização resumida
                </span>
                <input
                  name="location"
                  type="text"
                  placeholder="Ex.: Alphaville II, Urbanova — São José dos Campos/SP"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {/* MAPA */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              04. Mapa e geolocalização
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Latitude
                </span>
                <input
                  name="latitude"
                  type="text"
                  placeholder="-23.000000"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Longitude
                </span>
                <input
                  name="longitude"
                  type="text"
                  placeholder="-45.000000"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelTitleClass}>
                  Link Google Maps
                </span>
                <input
                  name="googleMapsUrl"
                  type="url"
                  placeholder="https://maps.google.com/..."
                  className={inputClass}
                />
              </label>
            </div>

            <div className="mt-5 border border-dashed border-white/10 bg-black/20 px-5 py-5">
              <p className="text-sm leading-7 text-zinc-500">
                A localização automática
                pelo endereço e a
                visualização do mapa poderão
                ser adicionadas posteriormente.
              </p>
            </div>
          </section>

          {/* VALORES */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              05. Valores
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {purpose !== "Locação" ? (
                <label className="flex flex-col gap-2">
                  <span className={labelTitleClass}>
                    Valor de venda
                  </span>
                  <input
                    name="price"
                    type="text"
                    placeholder="Ex.: R$ 3.300.000"
                    className={inputClass}
                  />
                </label>
              ) : null}

              {purpose !== "Venda" ? (
                <label className="flex flex-col gap-2">
                  <span className={labelTitleClass}>
                    Valor de locação
                  </span>
                  <input
                    name="rentalPrice"
                    type="text"
                    placeholder="Ex.: R$ 12.000/mês"
                    className={inputClass}
                  />
                </label>
              ) : null}

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Condomínio
                </span>
                <input
                  name="condominium"
                  type="text"
                  placeholder="Ex.: R$ 940,00"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  IPTU
                </span>
                <input
                  name="iptu"
                  type="text"
                  placeholder="Ex.: R$ 2.800,00"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {/* ÁREAS */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              06. Áreas e ambientes
            </p>

            <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Área construída / privativa
                </span>
                <input
                  name="area"
                  type="text"
                  placeholder="Ex.: 310 m²"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Área do terreno
                </span>
                <input
                  name="landArea"
                  type="text"
                  placeholder="Ex.: 479 m²"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Dormitórios
                </span>
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Suítes
                </span>
                <input
                  name="suites"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Banheiros
                </span>
                <input
                  name="bathrooms"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Vagas
                </span>
                <input
                  name="parking"
                  type="number"
                  min="0"
                  placeholder="0"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {/* APRESENTAÇÃO */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              07. Apresentação do imóvel
            </p>

            <div className="mt-7 space-y-6">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Descrição comercial
                </span>
                <textarea
                  name="description"
                  rows={10}
                  placeholder="Descreva o imóvel, seus diferenciais, localização e proposta..."
                  className={textareaClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Características e diferenciais
                </span>
                <textarea
                  name="features"
                  rows={8}
                  placeholder={`Digite uma característica por linha.

Exemplo:
Piscina
Espaço gourmet
Energia fotovoltaica
Automação
Ar-condicionado`}
                  className={textareaClass}
                />
              </label>
            </div>
          </section>

          {/* GALERIA */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              08. Galeria de imagens
            </p>

            <div className="mt-3 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
              <p className="text-sm leading-6 text-amber-200">
                A seleção abaixo é somente
                uma prévia nesta etapa. As
                imagens ainda não serão
                enviadas nem gravadas.
              </p>
            </div>

            <label className="mt-7 flex min-h-56 cursor-pointer flex-col items-center justify-center border border-dashed border-amber-500/50 bg-black/30 px-6 text-center transition hover:border-amber-500 hover:bg-amber-500/5">
              <span className="font-serif text-2xl">
                Selecionar fotos do imóvel
              </span>

              <span className="mt-3 text-sm text-zinc-500">
                JPG, JPEG, PNG ou WEBP
              </span>

              <span className="mt-2 text-xs text-zinc-600">
                É possível selecionar várias
                imagens.
              </span>

              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(
                  event,
                ) => {
                  const files =
                    event.target.files;

                  if (!files) {
                    setPhotoNames([]);
                    return;
                  }

                  setPhotoNames(
                    Array.from(files).map(
                      (file) => file.name,
                    ),
                  );
                }}
              />
            </label>

            {photoNames.length > 0 ? (
              <div className="mt-5 border border-white/10 bg-[#111111] p-5">
                <p className="text-sm font-medium text-white">
                  {photoNames.length}{" "}
                  {photoNames.length === 1
                    ? "foto selecionada"
                    : "fotos selecionadas"}
                </p>

                <div className="mt-3 space-y-1">
                  {photoNames
                    .slice(0, 5)
                    .map((name) => (
                      <p
                        key={name}
                        className="truncate text-xs text-zinc-500"
                      >
                        {name}
                      </p>
                    ))}

                  {photoNames.length > 5 ? (
                    <p className="text-xs text-amber-400">
                      + {photoNames.length - 5} arquivos
                    </p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          {/* MÍDIA */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              09. Vídeo e materiais
            </p>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Vídeo
                </span>
                <input
                  name="video"
                  type="url"
                  placeholder="Link do YouTube ou Vimeo"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Tour virtual
                </span>
                <input
                  name="virtualTour"
                  type="url"
                  placeholder="Link Matterport ou similar"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2 md:col-span-2">
                <span className={labelTitleClass}>
                  Apresentação / Brochura
                </span>
                <input
                  name="brochure"
                  type="url"
                  placeholder="Link para PDF ou apresentação do imóvel"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {/* SEO */}

          <section className={sectionClass}>
            <p className={sectionTitleClass}>
              10. SEO e compartilhamento
            </p>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">
              Estes dados serão utilizados
              pelo Google, WhatsApp e redes
              sociais na apresentação do
              imóvel.
            </p>

            <div className="mt-7 space-y-5">
              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Título SEO
                </span>
                <input
                  name="seoTitle"
                  type="text"
                  maxLength={70}
                  placeholder="Ex.: Casa Alto Padrão Alphaville II Urbanova | 4 Suítes"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Descrição SEO
                </span>
                <textarea
                  name="seoDescription"
                  rows={4}
                  maxLength={170}
                  placeholder="Descrição resumida para mecanismos de busca..."
                  className={textareaClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={labelTitleClass}>
                  Imagem de compartilhamento
                </span>
                <input
                  name="seoImage"
                  type="text"
                  placeholder="URL ou caminho da imagem principal"
                  className={inputClass}
                />
              </label>
            </div>
          </section>

          {/* AÇÕES */}

          <div className="flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:justify-end">
            <Link
              href="/admin/imoveis"
              className="inline-flex min-h-14 items-center justify-center border border-white/15 px-7 text-xs font-bold uppercase tracking-[0.16em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-14 items-center justify-center bg-amber-500 px-8 text-xs font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending
                ? "Salvando..."
                : "Salvar imóvel"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}