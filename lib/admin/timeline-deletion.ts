import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "../../generated/prisma/client";

type Db = Pick<PrismaClient, "client" | "commercialEvent" | "propertyVisit" | "propertyProposal" | "propertyRentalProposal" | "portalLead">;
type Change = { kind: "visit" | "purchase" | "rental" | "lead"; id: number; status: string };
export type DeletionChoice = { key: string; label: string; effect: string; change?: Change; blocked?: string };
export type TimelineDeletionPlan = { token: string; choices: DeletionChoice[]; propertyCodes: string[] };
export class TimelineDeletionError extends Error {}

const proposalStages = ["PROPOSTA_APRESENTADA", "CONTRAPROPOSTA", "NEGOCIACAO", "PROPOSTA_ACEITA", "DOCUMENTACAO", "NEGOCIO_CONCLUIDO", "PERDIDO_ENCERRADO"];
const leadStages: Record<string, string> = { NOVO_CONTATO: "NOVO", CONTATO_REALIZADO: "CONTATADO", CLIENTE_QUALIFICADO: "QUALIFICADO", NEGOCIO_CONCLUIDO: "CONVERTIDO", PERDIDO_ENCERRADO: "ENCERRADO" };
const proposalStatuses: Record<string, string> = {PROPOSTA_APRESENTADA:"EM_ANALISE",CONTRAPROPOSTA:"CONTRAPROPOSTA",PROPOSTA_ACEITA:"ACEITA",PERDIDO_ENCERRADO:"RECUSADA"};

export function visitMatchesEvent(visit: { visitDate: Date; visitTime: string | null }, event: { type: string; eventAt: Date; description: string | null }) {
  if (event.type === "VISITA_AGENDADA") {
    const match = event.description?.match(/Data: (\d{2})\/(\d{2})\/(\d{4})(?: às (\d{2}:\d{2}))?/);
    return Boolean(match && visit.visitDate.toISOString().slice(0, 10) === `${match[3]}-${match[2]}-${match[1]}` && (!match[4] || visit.visitTime === match[4]));
  }
  const parts = new Intl.DateTimeFormat("sv-SE", {timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hourCycle:"h23"}).format(event.eventAt);
  return visit.visitDate.toISOString().slice(0,10) === parts.slice(0,10) && (!visit.visitTime || visit.visitTime === parts.slice(11,16));
}

export async function planTimelineDeletion(db: Db, clientId: number, eventId: number): Promise<TimelineDeletionPlan> {
  if (!Number.isSafeInteger(clientId) || clientId <= 0 || !Number.isSafeInteger(eventId) || eventId <= 0) throw new TimelineDeletionError("Etapa inválida.");
  const event = await db.commercialEvent.findFirst({
    where: {id:eventId,clientId},
    include: {properties:{include:{property:{select:{id:true,code:true,status:true}}}}},
  });
  if (!event) throw new TimelineDeletionError("Esta etapa já foi excluída ou não pertence a este cliente. Atualize a página.");
  const ids = event.properties.map(p=>p.propertyId);
  const properties = event.properties.map(p=>p.property);
  const history = await db.commercialEvent.findMany({
    where:{clientId, ...(event.leadId ? {leadId:event.leadId} : {properties:{some:{propertyId:{in:ids}}}})},
    orderBy:[{createdAt:"desc"},{id:"desc"}],
    select:{id:true,type:true,createdAt:true,leadId:true,description:true},
  });
  const choices: DeletionChoice[] = [];
  const snapshots: unknown[] = [event,history];
  const plain = (effect="Somente este lançamento será removido da linha do tempo. Os dados das fichas serão preservados.") => choices.push({key:"event",label:"Excluir esta etapa",effect});

  if (event.type === "NEGOCIO_CONCLUIDO" && properties.some(p=>p.status === "VENDIDO" || p.status === "ALUGADO")) {
    choices.push({key:"blocked",label:"Negócio finalizado",effect:"",blocked:"Este negócio já foi finalizado no imóvel. Corrija a finalização na ficha do imóvel antes de excluir esta etapa."});
  } else if (event.leadId) {
    const lead = await db.portalLead.findFirst({where:{id:event.leadId,clientId},select:{id:true,status:true,updatedAt:true}});
    snapshots.push(lead);
    const stageHistory = history.filter(e=>leadStages[e.type]);
    if (lead && stageHistory[0]?.id === event.id && leadStages[event.type] === lead.status && event.type !== "NOVO_CONTATO") {
      const status = leadStages[stageHistory[1]?.type] ?? "NOVO";
      choices.push({key:`lead:${lead.id}`,label:`Atendimento #${lead.id}`,effect:`A etapa será excluída e o atendimento voltará para ${status === "NOVO" ? "Novo" : status === "CONTATADO" ? "Contatado" : status === "QUALIFICADO" ? "Qualificado" : status}.`,change:{kind:"lead",id:lead.id,status}});
    } else plain();
  } else if (event.type === "VISITA_REALIZADA" || event.type === "VISITA_AGENDADA") {
    const visits = await db.propertyVisit.findMany({where:{clientId,propertyId:{in:ids}},orderBy:{id:"desc"},select:{id:true,status:true,visitDate:true,visitTime:true,updatedAt:true,visitorSignature:true,responsibleSignature:true,property:{select:{code:true}}}});
    snapshots.push(visits);
    const matching = visits.filter(v=>visitMatchesEvent(v,event));
    if (!visits.length) plain("A etapa será excluída. Não há ficha de visita vinculada a este cliente e imóvel para alterar.");
    else if (!matching.length) choices.push({key:"blocked",label:"Visita não identificada",effect:"",blocked:"Não foi possível identificar a visita pela data e pelo imóvel. Confira a ficha da visita antes de excluir esta etapa."});
    else for (const visit of matching) {
      const base = {key:`visit:${visit.id}`,label:`Visita #${visit.id} — ${visit.property.code} — ${visit.visitDate.toLocaleDateString("pt-BR",{timeZone:"UTC"})} ${visit.visitTime ?? ""}`};
      if (event.type === "VISITA_AGENDADA" && visit.status === "REALIZADA") {
        choices.push({...base,effect:"",blocked:"Esta visita está realizada. Exclua primeiro a etapa “Visita realizada” para corrigir o agendamento."});
      } else if (event.type === "VISITA_REALIZADA" && visit.status === "REALIZADA") {
        const dependent = history.some(e=>e.type === "POS_VISITA" && Math.abs(e.createdAt.getTime()-event.createdAt.getTime()) < 10000);
        const duplicate = history.some(e=>e.type === "VISITA_REALIZADA" && e.id !== event.id && e.createdAt > event.createdAt);
        if (visit.visitorSignature || visit.responsibleSignature) choices.push({...base,effect:"",blocked:"A ficha contém assinatura. Revise a visita assinada antes de desfazer sua realização."});
        else if (dependent || duplicate) choices.push({...base,effect:"",blocked:"Há um pós-visita ou uma realização posterior. Exclua primeiro o lançamento dependente para não deixar o histórico contraditório."});
        else choices.push({...base,effect:"A etapa será excluída e esta visita voltará para Agendada, mantendo data, horário e demais dados.",change:{kind:"visit",id:visit.id,status:"AGENDADA"}});
      } else if (event.type === "VISITA_AGENDADA" && visit.status === "AGENDADA") {
        choices.push({...base,effect:"A etapa será excluída e este agendamento será marcado como Cancelado. A ficha da visita será preservada.",change:{kind:"visit",id:visit.id,status:"CANCELADA"}});
      } else choices.push({...base,effect:"Somente a etapa será excluída; esta visita já não está no status registrado por ela."});
    }
  } else if (["PROPOSTA_APRESENTADA","CONTRAPROPOSTA","PROPOSTA_ACEITA","PERDIDO_ENCERRADO"].includes(event.type)) {
    const rental = /locação/i.test(event.description ?? "");
    const purchases = rental ? [] : await db.propertyProposal.findMany({where:{clientId,propertyId:{in:ids}},select:{id:true,status:true,createdAt:true,updatedAt:true,proposerSignature:true,ownerSignature:true,property:{select:{code:true}}}});
    const rentals = rental ? await db.propertyRentalProposal.findMany({where:{clientId,propertyId:{in:ids}},select:{id:true,status:true,createdAt:true,updatedAt:true,tenantSignature:true,ownerSignature:true,property:{select:{code:true}}}}) : [];
    snapshots.push(purchases,rentals);
    const proposals = [...purchases.map(p=>({...p,kind:"purchase" as const,signed:Boolean(p.proposerSignature||p.ownerSignature)})),...rentals.map(p=>({...p,kind:"rental" as const,signed:Boolean(p.tenantSignature||p.ownerSignature)}))];
    const later = history.some(e=>e.id!==event.id && (e.createdAt > event.createdAt || (e.createdAt.getTime()===event.createdAt.getTime() && e.id>event.id)) && proposalStages.includes(e.type) && /locação/i.test(e.description ?? "")===rental);
    if (!proposals.length || later) plain(later ? "Somente este lançamento será removido. Há etapas posteriores; o status atual da proposta será preservado." : undefined);
    else for (const proposal of proposals) {
      const expected = proposalStatuses[event.type];
      const status = event.type === "PROPOSTA_APRESENTADA" ? "CANCELADA" : "EM_ANALISE";
      const base={key:`${proposal.kind}:${proposal.id}`,label:`Proposta ${rental ? "de locação" : "de compra"} #${proposal.id} — ${proposal.property.code}`};
      if (proposal.status !== expected) choices.push({...base,effect:"Somente a etapa será excluída; o status atual desta proposta já é diferente e será preservado."});
      else if (proposal.signed || properties.some(p=>p.status==="VENDIDO"||p.status==="ALUGADO")) choices.push({...base,effect:"",blocked:"Esta proposta tem assinatura ou o imóvel já foi vendido/alugado. Revise a ficha antes de desfazer a etapa."});
      else choices.push({...base,effect:`A etapa será excluída e esta proposta ficará ${status === "CANCELADA" ? "Cancelada" : "Em análise"}. Valores, documentos e demais dados serão preservados.`,change:{kind:proposal.kind,id:proposal.id,status}});
    }
  } else plain();
  return {token:createHash("sha256").update(JSON.stringify(snapshots)).digest("hex"),choices,propertyCodes:properties.map(p=>p.code)};
}

export async function executeTimelineDeletion(tx: Prisma.TransactionClient, clientId: number, eventId: number, token: string, choiceKey: string) {
  const plan = await planTimelineDeletion(tx,clientId,eventId);
  if (token !== plan.token) throw new TimelineDeletionError("Os dados mudaram desde a confirmação. Feche e abra novamente “Excluir etapa”.");
  const choice=plan.choices.find(c=>c.key===choiceKey);
  if (!choice || choice.blocked) throw new TimelineDeletionError(choice?.blocked ?? "Selecione o registro relacionado.");
  const change=choice.change;
  if (change?.kind === "visit") await tx.propertyVisit.update({where:{id:change.id},data:{status:change.status as "AGENDADA" | "CANCELADA"}});
  if (change?.kind === "purchase") await tx.propertyProposal.update({where:{id:change.id},data:{status:change.status as "EM_ANALISE" | "CANCELADA"}});
  if (change?.kind === "rental") await tx.propertyRentalProposal.update({where:{id:change.id},data:{status:change.status as "EM_ANALISE" | "CANCELADA"}});
  if (change?.kind === "lead") await tx.portalLead.update({where:{id:change.id},data:{status:change.status as "NOVO" | "CONTATADO" | "QUALIFICADO" | "CONVERTIDO" | "ENCERRADO",...(change.status === "NOVO" ? {contactedAt:null} : {})}});
  await tx.commercialEvent.delete({where:{id:eventId}});
  return plan.propertyCodes;
}
