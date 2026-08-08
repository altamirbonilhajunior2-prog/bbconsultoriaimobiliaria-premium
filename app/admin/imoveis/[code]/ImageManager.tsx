"use client";

import { uploadPresigned } from "@vercel/blob/client";
import Image from "next/image";
import {
  FormEvent,
  useActionState,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

import {
  type ImageActionState,
  moveImageAction,
  registerUploadedImagesAction,
  removeImageAction,
  setCoverImageAction,
} from "./image-actions";

type PropertyImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  isCover: boolean;
};

type ImageManagerProps = {
  code: string;
  images: PropertyImage[];
};

const initialState: ImageActionState = {
  success: false,
  message: "",
};

const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

const maximumFileSize =
  25 * 1024 * 1024;

const buttonClass =
  "inline-flex min-h-10 items-center justify-center border border-white/10 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300 transition hover:border-amber-500 hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-40";

function sanitizeFileName(
  fileName: string,
) {
  const parts =
    fileName.split(".");

  const extension =
    parts.length > 1
      ? parts.pop()
      : "";

  const baseName =
    parts
      .join(".")
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        "",
      )
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      ) || "foto";

  const cleanExtension =
    String(extension ?? "")
      .toLowerCase()
      .replace(
        /[^a-z0-9]/g,
        "",
      );

  return cleanExtension
    ? `${baseName}.${cleanExtension}`
    : baseName;
}

export default function ImageManager({
  code,
  images,
}: ImageManagerProps) {
  const router = useRouter();

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState<File[]>([]);

  const [
    inputKey,
    setInputKey,
  ] = useState(0);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    uploadProgress,
    setUploadProgress,
  ] = useState(0);

  const [
    uploadState,
    setUploadState,
  ] = useState<ImageActionState>(
    initialState,
  );

  const [
    coverState,
    coverAction,
    coverPending,
  ] = useActionState(
    setCoverImageAction,
    initialState,
  );

  const [
    moveState,
    moveAction,
    movePending,
  ] = useActionState(
    moveImageAction,
    initialState,
  );

  const [
    removeState,
    removeAction,
    removePending,
  ] = useActionState(
    removeImageAction,
    initialState,
  );

  const currentState =
    removeState.message
      ? removeState
      : moveState.message
        ? moveState
        : coverState;

  useEffect(() => {
    if (
      coverState.success ||
      moveState.success ||
      removeState.success
    ) {
      router.refresh();
    }
  }, [
    coverState,
    moveState,
    removeState,
    router,
  ]);

  const isPending =
    uploading ||
    coverPending ||
    movePending ||
    removePending;

  function handleFileSelection(
    files: FileList | null,
  ) {
    setUploadState(
      initialState,
    );

    if (!files) {
      setSelectedFiles([]);
      return;
    }

    const selected =
      Array.from(files);

    const invalidType =
      selected.find(
        (file) =>
          !allowedTypes.includes(
            file.type,
          ),
      );

    if (invalidType) {
      setSelectedFiles([]);

      setUploadState({
        success: false,
        message:
          `O arquivo "${invalidType.name}" não é JPG, PNG, WEBP ou AVIF.`,
      });

      return;
    }

    const oversized =
      selected.find(
        (file) =>
          file.size >
          maximumFileSize,
      );

    if (oversized) {
      setSelectedFiles([]);

      setUploadState({
        success: false,
        message:
          `O arquivo "${oversized.name}" ultrapassa o limite de 25 MB.`,
      });

      return;
    }

    setSelectedFiles(
      selected,
    );
  }

  async function handleUpload(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      selectedFiles.length ===
      0
    ) {
      setUploadState({
        success: false,
        message:
          "Selecione pelo menos uma fotografia.",
      });

      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadState(
      initialState,
    );

    try {
      const uploadedImages: {
        url: string;
        alt: string;
      }[] = [];

      for (
        let index = 0;
        index <
        selectedFiles.length;
        index += 1
      ) {
        const file =
          selectedFiles[index];

        const safeName =
          sanitizeFileName(
            file.name,
          );

        const pathname =
          `imoveis/${code.toLowerCase()}/${safeName}`;

        const blob =
          await uploadPresigned(
            pathname,
            file,
            {
              access: "public",

              handleUploadUrl:
                "/api/imoveis/upload",

              clientPayload:
                JSON.stringify({
                  code,
                }),

              multipart: true,

              onUploadProgress:
                (progress) => {
                  const overallProgress =
                    ((index +
                      progress.percentage /
                        100) /
                      selectedFiles.length) *
                    100;

                  setUploadProgress(
                    Math.round(
                      overallProgress,
                    ),
                  );
                },
            },
          );

        uploadedImages.push({
          url: blob.url,
          alt:
            `${code} - ${file.name}`,
        });
      }

      setUploadProgress(100);

      const result =
        await registerUploadedImagesAction(
          code,
          uploadedImages,
        );

      setUploadState(
        result,
      );

      if (result.success) {
        setSelectedFiles([]);

        setInputKey(
          (current) =>
            current + 1,
        );

        router.refresh();
      }
    } catch (error) {
      console.error(
        "Erro durante o upload:",
        error,
      );

      setUploadState({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar as fotografias.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="border border-white/10 bg-[#0b0b0b] p-7">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-400">
            Gestão das fotografias
          </p>

          <h2 className="mt-3 font-serif text-3xl font-normal text-white">
            Galeria do imóvel
          </h2>

          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-500">
            Adicione novas fotografias, organize a sequência, escolha a imagem
            principal e remova fotos do cadastro.
          </p>
        </div>

        <div className="border border-white/10 bg-[#111111] px-5 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
            Total
          </p>

          <p className="mt-1 text-xl text-white">
            {images.length}{" "}
            {images.length === 1
              ? "imagem"
              : "imagens"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleUpload}
        className="mt-7 border border-amber-500/20 bg-amber-500/5 p-6"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400">
          Adicionar fotografias
        </p>

        <h3 className="mt-2 font-serif text-2xl text-white">
          Enviar novas imagens
        </h3>

        <p className="mt-3 text-sm leading-7 text-zinc-400">
          Você pode selecionar várias fotos de uma vez. Formatos aceitos: JPG,
          PNG, WEBP e AVIF. Limite de 25 MB por arquivo.
        </p>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center">
          <input
            key={inputKey}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            disabled={isPending}
            onChange={(event) =>
              handleFileSelection(
                event.target.files,
              )
            }
            className="block w-full border border-white/10 bg-black px-4 py-4 text-sm text-zinc-300 file:mr-4 file:border-0 file:bg-amber-500 file:px-4 file:py-2 file:text-[10px] file:font-bold file:uppercase file:tracking-[0.12em] file:text-black"
          />

          <button
            type="submit"
            disabled={
              isPending ||
              selectedFiles.length ===
                0
            }
            className="inline-flex min-h-14 shrink-0 items-center justify-center bg-amber-500 px-7 text-[10px] font-bold uppercase tracking-[0.16em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {uploading
              ? `Enviando ${uploadProgress}%`
              : "Enviar fotografias"}
          </button>
        </div>

        {selectedFiles.length >
        0 ? (
          <p className="mt-4 text-sm text-zinc-300">
            {selectedFiles.length ===
            1
              ? `1 arquivo selecionado: ${selectedFiles[0].name}`
              : `${selectedFiles.length} arquivos selecionados`}
          </p>
        ) : null}

        {uploading ? (
          <div className="mt-5">
            <div className="h-2 overflow-hidden bg-black">
              <div
                className="h-full bg-amber-500 transition-all"
                style={{
                  width:
                    `${uploadProgress}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-zinc-400">
              Upload em andamento:{" "}
              {uploadProgress}%
            </p>
          </div>
        ) : null}

        {uploadState.message ? (
          <div
            className={`mt-5 border px-5 py-4 ${
              uploadState.success
                ? "border-emerald-500/30 bg-emerald-500/10"
                : "border-red-500/30 bg-red-500/10"
            }`}
          >
            <p
              className={`text-sm ${
                uploadState.success
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {uploadState.message}
            </p>
          </div>
        ) : null}
      </form>

      {currentState.message ? (
        <div
          className={`mt-6 border px-5 py-4 ${
            currentState.success
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-red-500/30 bg-red-500/10"
          }`}
        >
          <p
            className={`text-sm ${
              currentState.success
                ? "text-emerald-300"
                : "text-red-300"
            }`}
          >
            {currentState.message}
          </p>
        </div>
      ) : null}

      {images.length === 0 ? (
        <div className="mt-6 border border-dashed border-white/10 px-6 py-12 text-center">
          <p className="text-sm text-zinc-500">
            Nenhuma imagem cadastrada para este imóvel.
          </p>
        </div>
      ) : (
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {images.map(
            (image, index) => (
              <article
                key={image.id}
                className="overflow-hidden border border-white/10 bg-[#111111]"
              >
                <div className="relative aspect-[4/3] bg-black">
                  <Image
                    src={image.url}
                    alt={
                      image.alt ??
                      `${code} - Foto ${index + 1}`
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover"
                  />

                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className="bg-black/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white">
                      Foto {index + 1}
                    </span>

                    {image.isCover ? (
                      <span className="bg-amber-500 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                        Capa
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-4">
                  <p className="truncate text-xs text-zinc-400">
                    {image.url}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <form action={coverAction}>
                      <input
                        type="hidden"
                        name="code"
                        value={code}
                      />

                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <button
                        type="submit"
                        disabled={
                          isPending ||
                          image.isCover
                        }
                        className={`${buttonClass} w-full`}
                      >
                        {image.isCover
                          ? "Capa atual"
                          : "Definir capa"}
                      </button>
                    </form>

                    <form action={moveAction}>
                      <input
                        type="hidden"
                        name="code"
                        value={code}
                      />

                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <input
                        type="hidden"
                        name="direction"
                        value="up"
                      />

                      <button
                        type="submit"
                        disabled={
                          isPending ||
                          index === 0
                        }
                        className={`${buttonClass} w-full`}
                      >
                        ↑ Subir
                      </button>
                    </form>

                    <form action={moveAction}>
                      <input
                        type="hidden"
                        name="code"
                        value={code}
                      />

                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <input
                        type="hidden"
                        name="direction"
                        value="down"
                      />

                      <button
                        type="submit"
                        disabled={
                          isPending ||
                          index ===
                            images.length - 1
                        }
                        className={`${buttonClass} w-full`}
                      >
                        ↓ Descer
                      </button>
                    </form>

                    <form
                      action={removeAction}
                      onSubmit={(event) => {
                        const confirmed =
                          window.confirm(
                            `Remover a foto ${index + 1} do cadastro do imóvel ${code}?`,
                          );

                        if (!confirmed) {
                          event.preventDefault();
                        }
                      }}
                    >
                      <input
                        type="hidden"
                        name="code"
                        value={code}
                      />

                      <input
                        type="hidden"
                        name="imageId"
                        value={image.id}
                      />

                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex min-h-10 w-full items-center justify-center border border-red-500/20 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remover
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ),
          )}
        </div>
      )}

      <div className="mt-7 border border-white/10 bg-[#111111] px-5 py-4">
        <p className="text-sm leading-7 text-zinc-400">
          As fotografias antigas armazenadas localmente permanecem preservadas.
          Novas fotografias enviadas pelo painel serão armazenadas no Vercel
          Blob e vinculadas ao imóvel no PostgreSQL.
        </p>
      </div>
    </section>
  );
}
