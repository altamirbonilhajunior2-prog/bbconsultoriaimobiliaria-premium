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
  moveSelectedImagesToStartAction,
  registerUploadedImagesAction,
  removeAllImagesAction,
  removeImageAction,
  removeSelectedImagesAction,
  setAiImageFlagAction,
  setCoverImageAction,
} from "./image-actions";

type PropertyImage = {
  id: number;
  url: string;
  alt: string | null;
  position: number;
  isCover: boolean;
  isAiGenerated: boolean;
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
    selectedImageIds,
    setSelectedImageIds,
  ] = useState<number[]>([]);

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
    markUploadedAsAi,
    setMarkUploadedAsAi,
  ] = useState(false);

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
    aiState,
    aiAction,
    aiPending,
  ] = useActionState(
    setAiImageFlagAction,
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
    moveSelectedState,
    moveSelectedAction,
    moveSelectedPending,
  ] = useActionState(
    moveSelectedImagesToStartAction,
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

  const [
    removeSelectedState,
    removeSelectedAction,
    removeSelectedPending,
  ] = useActionState(
    removeSelectedImagesAction,
    initialState,
  );

  const [
    removeAllState,
    removeAllAction,
    removeAllPending,
  ] = useActionState(
    removeAllImagesAction,
    initialState,
  );

  const currentState =
    aiState.message
      ? aiState
      : removeAllState.message
        ? removeAllState
        : moveSelectedState.message
          ? moveSelectedState
          : removeSelectedState.message
            ? removeSelectedState
            : removeState.message
              ? removeState
              : moveState.message
                ? moveState
                : coverState;

  useEffect(() => {
    if (
      aiState.success ||
      coverState.success ||
      moveState.success ||
      moveSelectedState.success ||
      removeState.success ||
      removeSelectedState.success ||
      removeAllState.success
    ) {
      router.refresh();
    }
    }, [
    aiState,
    coverState,
    moveState,
    moveSelectedState,
    removeState,
    removeSelectedState,
    removeAllState,
    router,
  ]);
    const isPending =
    uploading ||
    aiPending ||
    coverPending ||
    movePending ||
    moveSelectedPending ||
    removePending ||
    removeSelectedPending ||
    removeAllPending;

  const allSelected =
    images.length > 0 &&
    selectedImageIds.length ===
      images.length;

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

  function toggleImageSelection(
    imageId: number,
  ) {
    setSelectedImageIds(
      (current) =>
        current.includes(imageId)
          ? current.filter(
              (id) =>
                id !== imageId,
            )
          : [
              ...current,
              imageId,
            ],
    );
  }

  function selectAllImages() {
    setSelectedImageIds(
      images.map(
        (image) => image.id,
      ),
    );
  }

  function clearSelection() {
    setSelectedImageIds([]);
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
        isAiGenerated: boolean;
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
          isAiGenerated:
            markUploadedAsAi,
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
        setMarkUploadedAsAi(false);

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

        <div className="flex flex-col gap-3 sm:items-end">
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

          {images.length > 0 ? (
            <form
              action={removeAllAction}
              onSubmit={(event) => {
                const confirmed =
                  window.confirm(
                    `Remover todas as ${images.length} fotos do cadastro do imóvel ${code}? Esta ação não pode ser desfeita.`,
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

              <button
                type="submit"
                disabled={isPending}
                className="inline-flex min-h-10 items-center justify-center border border-red-500/30 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {removeAllPending
                  ? "Removendo fotos..."
                  : "Remover todas as fotos"}
              </button>
            </form>
          ) : null}
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

        <label className="mt-4 flex cursor-pointer items-start gap-3 border border-white/10 bg-black/30 px-4 py-3">
          <input
            type="checkbox"
            checked={markUploadedAsAi}
            disabled={isPending}
            onChange={(event) =>
              setMarkUploadedAsAi(
                event.target.checked,
              )
            }
            className="mt-0.5 h-4 w-4 accent-amber-500"
          />

          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
              Imagens ambientadas por IA
            </span>

            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              Marque quando todas as imagens deste envio forem ambientações digitais.
            </span>
          </span>
        </label>

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

      {images.length > 0 ? (
        <div className="mt-7 border border-white/10 bg-[#111111] p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
                Seleção de fotografias
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {selectedImageIds.length ===
                0
                  ? "Nenhuma fotografia selecionada."
                  : selectedImageIds.length ===
                      1
                    ? "1 fotografia selecionada."
                    : `${selectedImageIds.length} fotografias selecionadas.`}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={
                  allSelected
                    ? clearSelection
                    : selectAllImages
                }
                disabled={isPending}
                className={buttonClass}
              >
                {allSelected
                  ? "Desmarcar todas"
                  : "Selecionar todas"}
              </button>

              {selectedImageIds.length >
              0 ? (
                <button
                  type="button"
                  onClick={
                    clearSelection
                  }
                  disabled={isPending}
                  className={buttonClass}
                >
                  Limpar seleção
                </button>
              ) : null}

              <form
                action={
                  moveSelectedAction
                }
              >
                <input
                  type="hidden"
                  name="code"
                  value={code}
                />

                {selectedImageIds.map(
                  (imageId) => (
                    <input
                      key={imageId}
                      type="hidden"
                      name="imageIds"
                      value={imageId}
                    />
                  ),
                )}

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    selectedImageIds.length ===
                      0
                  }
                  className="inline-flex min-h-10 items-center justify-center border border-amber-500/40 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300 transition hover:border-amber-400 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {moveSelectedPending
                    ? "Movendo..."
                    : "Mover selecionadas para o início"}
                </button>
              </form>

              <form
                action={
                  removeSelectedAction
                }
                onSubmit={(event) => {
                  if (
                    selectedImageIds.length ===
                    0
                  ) {
                    event.preventDefault();
                    return;
                  }

                  const confirmed =
                    window.confirm(
                      `Remover ${
                        selectedImageIds.length
                      } ${
                        selectedImageIds.length ===
                        1
                          ? "foto selecionada"
                          : "fotos selecionadas"
                      } do imóvel ${code}? Esta ação não pode ser desfeita.`,
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

                {selectedImageIds.map(
                  (imageId) => (
                    <input
                      key={imageId}
                      type="hidden"
                      name="imageIds"
                      value={imageId}
                    />
                  ),
                )}

                <button
                  type="submit"
                  disabled={
                    isPending ||
                    selectedImageIds.length ===
                      0
                  }
                  className="inline-flex min-h-10 items-center justify-center border border-red-500/30 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {removeSelectedPending
                    ? "Excluindo..."
                    : "Excluir selecionadas"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}

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
            (image, index) => {
              const selected =
                selectedImageIds.includes(
                  image.id,
                );

              return (
                <article
                  key={image.id}
                  className={`overflow-hidden border bg-[#111111] transition ${
                    selected
                      ? "border-amber-500"
                      : "border-white/10"
                  }`}
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

                      {image.isAiGenerated ? (
                        <span className="border border-amber-500/70 bg-black/85 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                          IA
                        </span>
                      ) : null}
                    </div>

                    <label className="absolute right-3 top-3 flex cursor-pointer items-center gap-2 bg-black/80 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={
                          selected
                        }
                        disabled={
                          isPending
                        }
                        onChange={() =>
                          toggleImageSelection(
                            image.id,
                          )
                        }
                        className="h-4 w-4 accent-amber-500"
                      />

                      <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-white">
                        Selecionar
                      </span>
                    </label>
                  </div>

                  <div className="p-4">
                    <p className="truncate text-xs text-zinc-400">
                      {image.url}
                    </p>

                    <form
                      action={aiAction}
                      className="mt-4 border border-white/10 bg-black/30 p-3"
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

                      <input
                        type="hidden"
                        name="isAiGenerated"
                        value={
                          image.isAiGenerated
                            ? "false"
                            : "true"
                        }
                      />

                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-300">
                            Imagem ambientada por IA
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {image.isAiGenerated
                              ? "O aviso de IA será exibido no portal."
                              : "Tratada atualmente como fotografia real."}
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={isPending}
                          className={`inline-flex min-h-9 shrink-0 items-center justify-center border px-3 text-[9px] font-bold uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-40 ${
                            image.isAiGenerated
                              ? "border-amber-500 bg-amber-500/10 text-amber-300"
                              : "border-white/15 text-zinc-400 hover:border-amber-500/60 hover:text-amber-300"
                          }`}
                        >
                          {image.isAiGenerated
                            ? "Marcar como foto real"
                            : "Marcar como IA"}
                        </button>
                      </div>
                    </form>

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
              );
            },
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
