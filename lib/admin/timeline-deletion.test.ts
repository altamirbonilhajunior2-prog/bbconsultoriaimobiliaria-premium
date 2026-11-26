import assert from "node:assert/strict";
import test from "node:test";
import { executeTimelineDeletion, planTimelineDeletion, TimelineDeletionError, visitMatchesEvent } from "./timeline-deletion";

const date=new Date("2026-11-26T15:54:09Z");
function fixture(type="VISITA_REALIZADA") {
  const event={id:23,clientId:3,leadId:null,type,eventAt:new Date("2026-11-27T16:00:00Z"),createdAt:date,updatedAt:date,description:"Etapa de teste",properties:[{propertyId:46,property:{id:46,code:"BBA023",status:"DISPONIVEL"}}]};
  const visits=[{id:8,status:"REALIZADA",visitDate:new Date("2026-11-27T15:00:00Z"),visitTime:"13:00",updatedAt:date,visitorSignature:null as string|null,responsibleSignature:null,property:{code:"BBA023"}}];
  const proposals=[{id:9,status:"ACEITA",createdAt:date,updatedAt:date,proposerSignature:null as string|null,ownerSignature:null,property:{code:"BBA023"}}];
  const history=[{id:23,type,createdAt:date,leadId:null,description:"Etapa de teste"}];
  const writes:unknown[]=[];
  const db={commercialEvent:{findFirst:async(args:{where:{clientId:number;id:number}})=>args.where.clientId===3&&args.where.id===23?event:null,findMany:async()=>history,delete:async(args:unknown)=>writes.push(args)},propertyVisit:{findMany:async()=>visits,update:async(args:unknown)=>writes.push(args)},propertyProposal:{findMany:async()=>proposals,update:async(args:unknown)=>writes.push(args)},propertyRentalProposal:{findMany:async()=>[],update:async(args:unknown)=>writes.push(args)}};
  return {event,visits,proposals,history,writes,db:db as unknown as Parameters<typeof planTimelineDeletion>[0]};
}

test("visita respeita data e horário de Brasília, sem confundir agendamento e realização",()=>{
  const f=fixture();assert.equal(visitMatchesEvent(f.visits[0],f.event),true);
  assert.equal(visitMatchesEvent({...f.visits[0],visitTime:"14:00"},f.event),false);
  f.event.type="VISITA_AGENDADA";f.event.description="Data: 27/11/2026 às 13:00.";
  assert.equal(visitMatchesEvent(f.visits[0],f.event),true);
});

test("realização indevida volta para agendada; ficha assinada e pós-visita impedem reversão",async()=>{
  const f=fixture();let p=await planTimelineDeletion(f.db,3,23);
  assert.deepEqual(p.choices[0].change,{kind:"visit",id:8,status:"AGENDADA"});
  f.visits[0].visitorSignature="assinatura";p=await planTimelineDeletion(f.db,3,23);assert.match(p.choices[0].blocked!,/assinatura/);
  f.visits[0].visitorSignature=null;f.history.push({id:24,type:"POS_VISITA",createdAt:date,leadId:null,description:"Retorno"});
  p=await planTimelineDeletion(f.db,3,23);assert.match(p.choices[0].blocked!,/pós-visita/);
});

test("agendamento pode ser cancelado, mas não antes de desfazer uma realização",async()=>{
  const f=fixture("VISITA_AGENDADA");f.event.description="Data: 27/11/2026 às 13:00.";
  assert.ok((await planTimelineDeletion(f.db,3,23)).choices[0].blocked);
  f.visits[0].status="AGENDADA";
  assert.equal((await planTimelineDeletion(f.db,3,23)).choices[0].change?.status,"CANCELADA");
});

test("proposta aceita pode voltar para análise; etapas posteriores preservam status atual",async()=>{
  const f=fixture("PROPOSTA_ACEITA");
  assert.equal((await planTimelineDeletion(f.db,3,23)).choices[0].change?.status,"EM_ANALISE");
  f.history.push({id:24,type:"DOCUMENTACAO",createdAt:new Date(date.getTime()+1000),leadId:null,description:"Documentação"});
  assert.equal((await planTimelineDeletion(f.db,3,23)).choices[0].change,undefined);
});

test("negócio finalizado e proposta assinada não são desfeitos por exclusão de etapa",async()=>{
  const f=fixture("NEGOCIO_CONCLUIDO");f.event.properties[0].property.status="VENDIDO";
  assert.ok((await planTimelineDeletion(f.db,3,23)).choices[0].blocked);
  f.event.properties[0].property.status="DISPONIVEL";f.event.type="PROPOSTA_ACEITA";f.history[0].type="PROPOSTA_ACEITA";f.proposals[0].proposerSignature="assinada";
  assert.ok((await planTimelineDeletion(f.db,3,23)).choices[0].blocked);
});

test("dados alterados, cliente errado e escolha adulterada são recusados sem exclusão",async()=>{
  const f=fixture();const p=await planTimelineDeletion(f.db,3,23);
  await assert.rejects(planTimelineDeletion(f.db,4,23),TimelineDeletionError);
  const tx=f.db as Parameters<typeof executeTimelineDeletion>[0];
  await assert.rejects(executeTimelineDeletion(tx,3,23,p.token,"visit:999"),TimelineDeletionError);
  f.visits[0].status="CANCELADA";
  await assert.rejects(executeTimelineDeletion(tx,3,23,p.token,"visit:8"),/dados mudaram/);
  assert.deepEqual(f.writes,[]);
});

test("etapa simples exclui somente o evento; realização altera apenas status da visita escolhida",async()=>{
  for(const type of ["IMOVEIS_APRESENTADOS","VISITA_REALIZADA"]){
    const f=fixture(type);const p=await planTimelineDeletion(f.db,3,23);
    await executeTimelineDeletion(f.db as Parameters<typeof executeTimelineDeletion>[0],3,23,p.token,p.choices[0].key);
    assert.deepEqual(f.writes,type==="IMOVEIS_APRESENTADOS"?[{where:{id:23}}]:[{where:{id:8},data:{status:"AGENDADA"}},{where:{id:23}}]);
  }
});
