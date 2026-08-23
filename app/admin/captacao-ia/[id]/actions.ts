"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "../../../../auth";
import { prisma } from "../../../../lib/prisma";

function getOpportunityId(
  formData: FormData,
) {
  const rawId = String(
    formData.get("opportunityId") ?? "",
  ).trim();

  const opportunityId =
    Number.parseInt(rawId, 10);

  if (
    !Number.isInteger(opportunityId) ||
    opportunityId <= 0
  ) {
    return null;
  }

  return opportunityId;
}

function getOptionalText(
  formData: FormData,
  field: string,
) {
  const value = String(
    formData.get(field) ?? "",
  ).trim();

  return value || null;
}

function getCheckboxValue(
  formData: FormData,
  field: string,
) {
  return (
    String(
      formData.get(field) ?? "",
    ) === "on"
  );
}

function revalidateOpportunity(
  opportunityId: number,
) {
  revalidatePath(
    "/admin/captacao-ia",
  );

  revalidatePath(
    `/admin/captacao-ia/${opportunityId}`,
  );

  revalidatePath(
    "/admin",
  );
}

export async function registerContactAction(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  const opportunityId =
    getOpportunityId(formData);

  if (!opportunityId) {
    redirect("/admin/captacao-ia");
  }

  const opportunity =
    await prisma.acquisitionOpportunity.findUnique({
      where: {
        id: opportunityId,
      },

      select: {
        id: true,
        status: true,
      },
    });

  if (!opportunity) {
    redirect("/admin/captacao-ia");
  }

  const canRegisterContact =
    opportunity.status === "ENCONTRADO" ||
    opportunity.status === "SELECIONADO";

  if (canRegisterContact) {
    await prisma.acquisitionOpportunity.update({
      where: {
        id: opportunity.id,
      },

      data: {
        status: "CONTATADO",
        contactedAt: new Date(),
      },
    });
  }

  revalidateOpportunity(
    opportunity.id,
  );

  redirect(
    `/admin/captacao-ia/${opportunity.id}`,
  );
}

export async function requestAuthorizationAction(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  const opportunityId =
    getOpportunityId(formData);

  if (!opportunityId) {
    redirect("/admin/captacao-ia");
  }

  const opportunity =
    await prisma.acquisitionOpportunity.findUnique({
      where: {
        id: opportunityId,
      },

      select: {
        id: true,
        status: true,
        contactedAt: true,
        authorizationStatus: true,
      },
    });

  if (!opportunity) {
    redirect("/admin/captacao-ia");
  }

  const canRequestAuthorization =
    opportunity.status === "CONTATADO" &&
    opportunity.contactedAt !== null &&
    opportunity.authorizationStatus ===
      "NAO_SOLICITADA";

  if (canRequestAuthorization) {
    await prisma.acquisitionOpportunity.update({
      where: {
        id: opportunity.id,
      },

      data: {
        status:
          "AGUARDANDO_AUTORIZACAO",

        authorizationStatus:
          "PENDENTE",

        authorizationRequestedAt:
          new Date(),

        authorizedToAdvertise:
          false,

        authorizedToUseImages:
          false,

        authorizedToEditImages:
          false,
      },
    });
  }

  revalidateOpportunity(
    opportunity.id,
  );

  redirect(
    `/admin/captacao-ia/${opportunity.id}`,
  );
}

export async function registerAuthorizationResponseAction(
  formData: FormData,
) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login-admin");
  }

  const opportunityId =
    getOpportunityId(formData);

  if (!opportunityId) {
    redirect("/admin/captacao-ia");
  }

  const opportunity =
    await prisma.acquisitionOpportunity.findUnique({
      where: {
        id: opportunityId,
      },

      select: {
        id: true,
        status: true,
        authorizationStatus: true,
      },
    });

  if (!opportunity) {
    redirect("/admin/captacao-ia");
  }

  const canRegisterResponse =
    opportunity.status ===
      "AGUARDANDO_AUTORIZACAO" &&
    opportunity.authorizationStatus ===
      "PENDENTE";

  if (!canRegisterResponse) {
    revalidateOpportunity(
      opportunity.id,
    );

    redirect(
      `/admin/captacao-ia/${opportunity.id}`,
    );
  }

  const decision = String(
    formData.get("decision") ?? "",
  );

  const authorizationNotes =
    getOptionalText(
      formData,
      "authorizationNotes",
    );

  if (decision === "AUTHORIZED") {
    await prisma.acquisitionOpportunity.update({
      where: {
        id: opportunity.id,
      },

      data: {
        status: "AUTORIZADO",

        authorizationStatus:
          "AUTORIZADA",

        authorizationAt:
          new Date(),

        authorizationNotes,

        authorizedToAdvertise:
          getCheckboxValue(
            formData,
            "authorizedToAdvertise",
          ),

        authorizedToUseImages:
          getCheckboxValue(
            formData,
            "authorizedToUseImages",
          ),

        authorizedToEditImages:
          getCheckboxValue(
            formData,
            "authorizedToEditImages",
          ),
      },
    });
  }

  if (decision === "DENIED") {
    await prisma.acquisitionOpportunity.update({
      where: {
        id: opportunity.id,
      },

      data: {
        status: "ARQUIVADO",

        authorizationStatus:
          "NEGADA",

        authorizationAt: null,

        authorizationNotes,

        authorizedToAdvertise:
          false,

        authorizedToUseImages:
          false,

        authorizedToEditImages:
          false,
      },
    });
  }

  revalidateOpportunity(
    opportunity.id,
  );

  redirect(
    `/admin/captacao-ia/${opportunity.id}`,
  );
}