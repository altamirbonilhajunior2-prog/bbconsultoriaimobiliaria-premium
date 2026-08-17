"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import { propertyTypes } from "../../../data/searchOptions";
import {
  type PropertyEditState,
  updatePropertyAction,
} from "./actions";

type PropertyType =
  keyof typeof propertyTypes;

const purposes = [
  "Venda",
  "Locação",
  "Venda e locação",
] as const;

type Purpose =
  (typeof purposes)[number];

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

type EditableProperty = {
  code: string;
  title: string;

  purpose: Purpose;
  opportunityProfiles: string[];

  propertyType: PropertyType;
  category: string;

  status: string;
  highlight: boolean;

  internalNotes: string | null;
  tag: string | null;

  state: string;
  city: string;

  ownerId: number | null;

  captorId: number | null;
  coCaptorId: number | null;

  neighborhood: string;

  development: string | null;
  location: string | null;

  address: string | null;
  zipCode: string | null;

  latitude: string | null;
  longitude: string | null;
  googleMapsUrl: string | null;

  price: string | null;
  rentalPrice: string | null;

  condominium: string | null;
  iptu: string | null;

  area: string | null;
  landArea: string | null;

  bedrooms: number;
  suites: number;
  bathrooms: number;
  parking: number;

  description: string | null;
  features: string[];

  video: string | null;
  virtualTour: string | null;
  brochure: string | null;

  seoTitle: string | null;
  seoDescription: string | null;
  seoImage: string | null;

  published: boolean;

  images: {
    id: number;
    url: string;
    alt: string | null;
    position: number;
    isCover: boolean;
  }[];
};

type AgentOption = {
  id: number;
  name: string;
  role: "ADMIN" | "CAPTADOR";
};

type EditPropertyFormProps = {
  property: EditableProperty;

  owners: {
    id: number;
    name: string;
    cpf: string | null;
  }[];

  agents: AgentOption[];

  isAdmin: boolean;

  agentId: number | null;
};

type FieldProps = {
  label: string;
  children: ReactNode;
  className?: string;
};

const initialState: PropertyEditState = {
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

function Field({
  label,
  children,
  className = "",
}: FieldProps) {
  return (
    <label
      className={`flex flex-col gap-2 ${className}`}
    >
      <span
        className={
          labelTitleClass
        }
      >
        {label}
      </span>

      {children}
    </label>
  );
}

export default function EditPropertyForm({
  property,
  owners,
  agents,
  isAdmin,
  agentId,
}: EditPropertyFormProps) {
  const router =
    useRouter();

  const [
    formState,
    formAction,
    isPending,
  ] = useActionState(
    updatePropertyAction,
    initialState,
  );

  const [
    propertyType,
    setPropertyType,
  ] =
    useState<PropertyType>(
      property.propertyType,
    );

  const [
    purpose,
    setPurpose,
  ] =
    useState<Purpose>(
      property.purpose,
    );

  const [
    category,
    setCategory,
  ] =
    useState<string>(
      property.category,
    );

  const [
    selectedProfiles,
    setSelectedProfiles,
  ] =
    useState<string[]>(
      property.opportunityProfiles,
    );

  const [
    selectedCaptorId,
    setSelectedCaptorId,
  ] =
    useState<string>(
      property.captorId
        ? String(
            property.captorId,
          )
        : "",
    );

  const [
    selectedCoCaptorId,
    setSelectedCoCaptorId,
  ] =
    useState<string>(
      property.coCaptorId
        ? String(
            property.coCaptorId,
          )
        : "",
    );

  const categories =
    useMemo<string[]>(
      () => [
        ...propertyTypes[
          propertyType
        ],
      ],
      [propertyType],
    );

  const principalCaptorId =
    isAdmin
      ? selectedCaptorId
      : property.captorId
        ? String(
            property.captorId,
          )
        : agentId
          ? String(
              agentId,
            )
          : "";

  const currentPrincipalCaptor =
    useMemo(
      () =>
        agents.find(
          (agent) =>
            String(
              agent.id,
            ) ===
            principalCaptorId,
        ) ?? null,
      [
        agents,
        principalCaptorId,
      ],
    );

  const availableCoCaptors =
    useMemo(
      () =>
        agents.filter(
          (agent) =>
            String(
              agent.id,
            ) !==
            principalCaptorId,
        ),
      [
        agents,
        principalCaptorId,
      ],
    );

  useEffect(() => {
    if (
      selectedCoCaptorId &&
      selectedCoCaptorId ===
        principalCaptorId
    ) {
      setSelectedCoCaptorId(
        "",
      );
    }
  }, [
    principalCaptorId,
    selectedCoCaptorId,
  ]);

  useEffect(() => {
    if (!formState.message) {
      return;
    }

    if (formState.success) {
      router.replace(
        "/admin/imoveis",
      );

      router.refresh();

      return;
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [
    formState.message,
    formState.success,
    router,
  ]);

  function toggleProfile(
    profile: string,
  ) {
    setSelectedProfiles(
      (current) =>
        current.includes(
          profile,
        )
          ? current.filter(
              (item) =>
                item !==
                profile,
            )
          : [
              ...current,
              profile,
            ],
    );
  }

  function handlePropertyTypeChange(
    event:
      ChangeEvent<HTMLSelectElement>,
  ) {
    const nextType =
      event.target
        .value as PropertyType;

    const nextCategories:
      string[] = [
        ...propertyTypes[
          nextType
        ],
      ];

    setPropertyType(
      nextType,
    );

    if (
      !nextCategories.includes(
        category,
      )
    ) {
      setCategory(
        nextCategories[
          0
        ] ?? "",
      );
    }
  }

  return (
    <div>
      {formState.message ? (
        <div
          className={`mb-8 border px-5 py-4 ${
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
        </div>
      ) : null}

      <form
        action={
          formAction
        }
        className="space-y-10"
      >
        <input
          type="hidden"
          name="originalCode"
          value={
            property.code
          }
        />

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
            <Field label="Código">
              <input
                value={
                  property.code
                }
                readOnly
                className={`${inputClass} cursor-not-allowed text-zinc-500`}
              />

              <span className="text-[10px] leading-5 text-zinc-600">
                O código não pode
                ser alterado nesta
                etapa.
              </span>
            </Field>

            <Field
              label="Título do imóvel"
              className="md:col-span-2"
            >
              <input
                name="title"
                type="text"
                required
                maxLength={
                  200
                }
                defaultValue={
                  property.title
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field label="Status">
              <select
                name="status"
                defaultValue={
                  property.status
                }
                className={
                  inputClass
                }
              >
                {statuses.map(
                  (
                    status,
                  ) => (
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
            </Field>

            <Field label="Identificação comercial">
              <input
                name="tag"
                type="text"
                defaultValue={
                  property.tag ??
                  ""
                }
                className={
                  inputClass
                }
              />
            </Field>

            <Field
              label="Observações internas"
              className="md:col-span-2 xl:col-span-3"
            >
              <textarea
                name="internalNotes"
                rows={5}
                defaultValue={
                  property.internalNotes ??
                  ""
                }
                placeholder="Anotações visíveis somente no CRM/ADM. Ex.: condições de negociação, comissão, disponibilidade para visitas, documentação ou observações do proprietário."
                className={
                  textareaClass
                }
              />

              <span className="text-[10px] leading-5 text-zinc-600">
                Uso interno da imobiliária. Este conteúdo não é exibido no portal público.
              </span>
            </Field>

            <label className="flex min-h-14 items-center gap-3 border border-white/10 bg-[#111111] px-4 md:col-span-2">
              <input
                name="highlight"
                type="checkbox"
                defaultChecked={
                  property.highlight
                }
                className="h-4 w-4 accent-amber-500"
              />

              <span className="text-sm text-zinc-300">
                Exibir este imóvel
                como destaque no
                portal
              </span>
            </label>
          </div>

          <div className="mt-8 border-t border-white/10 pt-7">
            <p
              className={
                labelTitleClass
              }
            >
              Angariação
            </p>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              Defina o corretor
              responsável pela
              angariação do imóvel
              e, quando houver, um
              co-angariador.
            </p>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {isAdmin ? (
                <Field label="Angariador principal *">
                  <select
                    name="captorId"
                    required
                    value={
                      selectedCaptorId
                    }
                    onChange={(
                      event,
                    ) =>
                      setSelectedCaptorId(
                        event
                          .target
                          .value,
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="">
                      Selecione o
                      angariador
                      principal
                    </option>

                    {agents.map(
                      (
                        agent,
                      ) => (
                        <option
                          key={
                            agent.id
                          }
                          value={
                            agent.id
                          }
                        >
                          {
                            agent.name
                          }
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              ) : (
                <div className="flex flex-col gap-2">
                  <span
                    className={
                      labelTitleClass
                    }
                  >
                    Angariador
                    principal *
                  </span>

                  <input
                    type="hidden"
                    name="captorId"
                    value={
                      principalCaptorId
                    }
                  />

                  <div className="flex h-14 items-center border border-amber-500/20 bg-amber-500/5 px-4 text-sm text-amber-200">
                    {currentPrincipalCaptor
                      ?.name ??
                      "Angariador principal"}
                  </div>
                </div>
              )}

              <Field label="Co-angariador">
                <select
                  name="coCaptorId"
                  value={
                    selectedCoCaptorId
                  }
                  onChange={(
                    event,
                  ) =>
                    setSelectedCoCaptorId(
                      event
                        .target
                        .value,
                    )
                  }
                  className={
                    inputClass
                  }
                >
                  <option value="">
                    Sem
                    co-angariador
                  </option>

                  {availableCoCaptors.map(
                    (
                      agent,
                    ) => (
                      <option
                        key={
                          agent.id
                        }
                        value={
                          agent.id
                        }
                      >
                        {
                          agent.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </Field>
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            02. Classificação comercial
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <Field label="Finalidade">
              <select
                name="purpose"
                value={purpose}
                onChange={(event) =>
                  setPurpose(event.target.value as Purpose)
                }
                className={inputClass}
              >
                {purposes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo">
              <select
                name="propertyType"
                value={propertyType}
                onChange={handlePropertyTypeChange}
                className={inputClass}
              >
                {Object.keys(propertyTypes).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Categoria">
              <select
                name="category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={inputClass}
              >
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-8">
            <p className={labelTitleClass}>
              Perfil da oportunidade
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {opportunityProfiles.map((profile) => {
                const selected = selectedProfiles.includes(profile);

                return (
                  <label
                    key={profile}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 border px-4 transition ${
                      selected
                        ? "border-amber-500 bg-amber-500/10"
                        : "border-white/10 bg-[#111111] hover:border-white/20"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="opportunityProfile"
                      value={profile}
                      checked={selected}
                      onChange={() => toggleProfile(profile)}
                      className="h-4 w-4 accent-amber-500"
                    />

                    <span className="text-sm text-zinc-300">
                      {profile}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            03. Localização
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Estado">
              <input
                name="state"
                required
                maxLength={2}
                defaultValue={property.state}
                className={inputClass}
              />
            </Field>

            <Field label="Cidade">
              <input
                name="city"
                required
                defaultValue={property.city}
                className={inputClass}
              />
            </Field>

            <Field label="Proprietário">
              <select
                name="ownerId"
                defaultValue={property.ownerId?.toString() ?? ""}
                className={inputClass}
              >
                <option value="">
                  Nenhum proprietário vinculado
                </option>

                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name}
                    {owner.cpf ? ` — CPF ${owner.cpf}` : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Bairro">
              <input
                name="neighborhood"
                required
                defaultValue={property.neighborhood}
                className={inputClass}
              />
            </Field>

            <Field label="Condomínio ou edifício">
              <input
                name="development"
                defaultValue={property.development ?? ""}
                className={inputClass}
              />
            </Field>

            <Field
              label="Endereço"
              className="md:col-span-2 xl:col-span-3"
            >
              <input
                name="address"
                defaultValue={property.address ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="CEP">
              <input
                name="zipCode"
                defaultValue={property.zipCode ?? ""}
                className={inputClass}
              />
            </Field>

            <Field
              label="Localização resumida"
              className="md:col-span-2 xl:col-span-4"
            >
              <input
                name="location"
                defaultValue={property.location ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            04. Mapa e geolocalização
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <Field label="Latitude">
              <input
                name="latitude"
                defaultValue={property.latitude ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Longitude">
              <input
                name="longitude"
                defaultValue={property.longitude ?? ""}
                className={inputClass}
              />
            </Field>

            <Field
              label="Link Google Maps"
              className="md:col-span-2"
            >
              <input
                name="googleMapsUrl"
                type="url"
                defaultValue={property.googleMapsUrl ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            05. Valores
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {purpose !== "Locação" ? (
              <Field label="Valor de venda">
                <input
                  name="price"
                  defaultValue={property.price ?? ""}
                  className={inputClass}
                />
              </Field>
            ) : null}

            {purpose !== "Venda" ? (
              <Field label="Valor de locação">
                <input
                  name="rentalPrice"
                  defaultValue={property.rentalPrice ?? ""}
                  className={inputClass}
                />
              </Field>
            ) : null}

            <Field label="Condomínio">
              <input
                name="condominium"
                defaultValue={property.condominium ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="IPTU">
              <input
                name="iptu"
                defaultValue={property.iptu ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            06. Áreas e ambientes
          </p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Field label="Área construída / privativa">
              <input
                name="area"
                defaultValue={property.area ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Área do terreno">
              <input
                name="landArea"
                defaultValue={property.landArea ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Dormitórios">
              <input
                name="bedrooms"
                type="number"
                min="0"
                defaultValue={property.bedrooms}
                className={inputClass}
              />
            </Field>

            <Field label="Suítes">
              <input
                name="suites"
                type="number"
                min="0"
                defaultValue={property.suites}
                className={inputClass}
              />
            </Field>

            <Field label="Banheiros">
              <input
                name="bathrooms"
                type="number"
                min="0"
                defaultValue={property.bathrooms}
                className={inputClass}
              />
            </Field>

            <Field label="Vagas">
              <input
                name="parking"
                type="number"
                min="0"
                defaultValue={property.parking}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            07. Apresentação do imóvel
          </p>

          <div className="mt-7 space-y-6">
            <Field label="Descrição comercial">
              <textarea
                name="description"
                rows={10}
                defaultValue={property.description ?? ""}
                className={textareaClass}
              />
            </Field>

            <Field label="Características e diferenciais">
              <textarea
                name="features"
                rows={8}
                defaultValue={property.features.join("\n")}
                className={textareaClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            08. Vídeo e materiais
          </p>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            <Field label="Vídeo">
              <input
                name="video"
                type="url"
                defaultValue={property.video ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Tour virtual">
              <input
                name="virtualTour"
                type="url"
                defaultValue={property.virtualTour ?? ""}
                className={inputClass}
              />
            </Field>

            <Field
              label="Apresentação / Brochura"
              className="md:col-span-2"
            >
              <input
                name="brochure"
                type="url"
                defaultValue={property.brochure ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            09. SEO e compartilhamento
          </p>

          <div className="mt-7 space-y-5">
            <Field label="Título SEO">
              <input
                name="seoTitle"
                type="text"
                maxLength={200}
                defaultValue={property.seoTitle ?? ""}
                className={inputClass}
              />
            </Field>

            <Field label="Descrição SEO">
              <textarea
                name="seoDescription"
                rows={4}
                maxLength={300}
                defaultValue={property.seoDescription ?? ""}
                className={textareaClass}
              />
            </Field>

            <Field label="Imagem de compartilhamento">
              <input
                name="seoImage"
                type="text"
                defaultValue={property.seoImage ?? ""}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        <section className={sectionClass}>
          <p className={sectionTitleClass}>
            10. Publicação
          </p>

          <div className="mt-6 border border-amber-500/20 bg-amber-500/5 px-5 py-4">
            <p className="text-sm leading-7 text-amber-200">
              Status atual:{" "}
              <strong>
                {property.published
                  ? "Publicado"
                  : "Não publicado"}
              </strong>
              .
            </p>

            <p className="mt-2 text-sm leading-7 text-zinc-500">
              Salvar este formulário
              não publica o imóvel
              automaticamente.
            </p>
          </div>
        </section>

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
              : "Salvar alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}