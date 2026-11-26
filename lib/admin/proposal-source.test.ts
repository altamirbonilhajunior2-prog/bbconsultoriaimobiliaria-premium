import assert from "node:assert/strict";
import test from "node:test";
import { InvalidProposalSource, proposalClientId, resolveProposalSource } from "./proposal-source";

type Database = Parameters<typeof resolveProposalSource>[0];
const admin = { isAdmin: true, agentId: null };
const client = { id: 7, name: "Cliente atualizado", cpf: "529.982.247-25", document: "RG 12345", phone: "5512999990000", email: "cliente@example.invalid" };

test("rejeita origens inválidas ou conflitantes antes de consultar dados", async () => {
  const db = {} as Database;
  for (const input of [{clientId:"0"},{clientId:"1x"},{visitId:"1.5"},{visitId:["1","2"]},{clientId:"1",visitId:"2"},{clientId:"9007199254740992"}]) {
    await assert.rejects(resolveProposalSource(db, 3, admin, input), InvalidProposalSource);
  }
  assert.equal(await resolveProposalSource(db, 3, admin, {}), null);
});

test("origem explícita mantém o cliente mesmo com telefone editado", async () => {
  const db = { client: { findFirst: async () => client } } as unknown as Database;
  const source = await resolveProposalSource(db, 3, admin, {clientId:"7"});
  assert.equal(source?.name, client.name);
  assert.equal(source?.document, client.cpf);
  assert.equal(await proposalClientId(db, 3, admin, {clientId:"7"}, "5511888880000"), 7);
});

test("visita verifica imóvel e carteira e prefere dados atuais do cadastro", async () => {
  const access = {isAdmin:false,agentId:8};
  const db = {
    propertyVisit: { findFirst: async (args: {where:unknown}) => {
      assert.deepEqual(args.where,{id:9,propertyId:3,OR:[{agentId:8},{client:{agentId:8}}]});
      return {id:9,clientId:7,visitorName:"Nome antigo",visitorPhone:null,visitorEmail:null,visitorDocument:null};
    } },
    client: { findFirst: async (args: {where:unknown}) => {
      assert.deepEqual(args.where,{id:7,agentId:8});return client;
    } },
  } as unknown as Database;
  const source = await resolveProposalSource(db,3,access,{visitId:"9"});
  assert.equal(source?.name, client.name);assert.equal(source?.visitId,9);
});

test("visita sem cadastro preenche contato e não confunde RG com CPF", async () => {
  const db = { propertyVisit: {findFirst:async()=>({id:9,clientId:null,visitorName:"Visitante",visitorPhone:"5512999990000",visitorEmail:null,visitorDocument:"RG 12345678"})} } as unknown as Database;
  const source = await resolveProposalSource(db,3,admin,{visitId:"9"});
  assert.equal(source?.name,"Visitante");assert.equal(source?.document,"");
  assert.equal(await proposalClientId(db,3,admin,{visitId:"9"},client.phone),null);
});

test("origem ausente ou sem acesso é recusada; telefone ambíguo não vincula", async () => {
  const db = {client:{findFirst:async()=>null,findMany:async(args:{where:unknown})=>{
    assert.deepEqual(args.where,{phone:client.phone,agentId:-1});return [{id:7},{id:8}];
  }},propertyVisit:{findFirst:async()=>null}} as unknown as Database;
  await assert.rejects(resolveProposalSource(db,3,admin,{clientId:"7"}),InvalidProposalSource);
  await assert.rejects(resolveProposalSource(db,3,admin,{visitId:"9"}),InvalidProposalSource);
  assert.equal(await proposalClientId(db,3,{isAdmin:false,agentId:null},{},client.phone),null);
});

test("locação preserva CNPJ legado sem colocá-lo no campo CPF da compra", async () => {
  const db = {client:{findFirst:async()=>({...client,cpf:null,document:"12.345.678/0001-90"})}} as unknown as Database;
  const source = await resolveProposalSource(db,3,admin,{clientId:"7"});
  assert.equal(source?.document,"");
  assert.equal(source?.rentalDocument,"12.345.678/0001-90");
});
