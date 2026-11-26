import assert from "node:assert/strict";
import { prisma } from "../lib/prisma";
import { insertManualClient, parseManualClient } from "../lib/clients/manual-client";

const rollback = new Error("ROLLBACK_TEST_ONLY");
async function main() {
  const before = await prisma.client.count();
  try {
    await prisma.$transaction(async tx => {
      const properties = await tx.property.findMany({ take: 2, select: { code: true } });
      assert.equal(properties.length, 2);
      const form = new FormData();
      form.set("name", "VALIDACAO TRANSACIONAL NOVO CLIENTE");
      form.set("phone", "(11) 90000-0001");
      form.set("propertyCodes", properties.map(p => p.code).join(","));
      form.set("cpf","52998224725");
      form.set("rg","TESTE-RG");
      form.set("maritalStatus","Solteiro(a)");
      form.set("profession","Profissão de teste");
      form.set("monthlyIncome","5.123,45");
      form.set("birthDate","1990-02-28");
      form.set("address","Endereço de teste");
      const input = parseManualClient(form);
      assert.equal(await tx.client.count({where:{phone:input.phone}}),0,"Test phone must be unused");
      const access = {isAdmin:true,agentId:null};
      const created = await insertManualClient(tx, input, access);
      assert.equal(created.duplicate, false);
      const saved = await tx.client.findUniqueOrThrow({where:{id:created.id},include:{commercialEvents:{include:{properties:true}}}});
      assert.equal(saved.commercialEvents.length,1);
      assert.equal(saved.cpf,"52998224725");
      assert.equal(saved.monthlyIncome?.toFixed(2),"5123.45");
      assert.equal(saved.rg,"TESTE-RG");
      assert.equal(saved.maritalStatus,"Solteiro(a)");
      assert.equal(saved.profession,"Profissão de teste");
      assert.equal(saved.birthDate?.toISOString().slice(0,10),"1990-02-28");
      assert.equal(saved.address,"Endereço de teste");
      await tx.client.update({where:{id:saved.id},data:{...input.personalDetails,monthlyIncome:"6500.25",profession:"Profissão editada"}});
      const edited = await tx.client.findUniqueOrThrow({where:{id:saved.id}});
      assert.equal(edited.monthlyIncome?.toFixed(2),"6500.25");
      assert.equal(edited.profession,"Profissão editada");
      assert.equal(saved.commercialEvents[0].properties.length,2);
      assert.equal(saved.commercialEvents[0].type,"NOVO_CONTATO");
      assert.match(saved.commercialEvents[0].description!,/interesse/);
      const duplicate = await insertManualClient(tx,input,access);
      assert.deepEqual(duplicate,{id:created.id,duplicate:true});
      await tx.client.update({where:{id:created.id},data:{phone:"(11) 90000-0001"}});
      assert.equal((await insertManualClient(tx,input,access)).duplicate,true);
      await assert.rejects(insertManualClient(tx,{...input,phone:"5511900000002",propertyCodes:["NAO_EXISTE_TESTE"]},access));
      assert.equal(await tx.client.count({where:{phone:"5511900000002"}}),0);
      await assert.rejects(insertManualClient(tx,input,{isAdmin:false,agentId:null}),/Acesso/);
      const noProperties = await insertManualClient(tx,{...input,phone:"5511900000002",propertyCodes:[]},access);
      assert.equal(noProperties.duplicate,false);
      const events = await tx.commercialEvent.findMany({where:{clientId:noProperties.id},include:{properties:true}});
      assert.equal(events[0].properties.length,0);
      throw rollback;
    },{timeout:30000});
  } catch(error) { if(error !== rollback) throw error; }
  assert.equal(await prisma.client.count(),before);
  console.log("PASS: cadastro, dois vínculos, duplicidade com telefone formatado, imóvel inválido, autorização, cadastro sem imóveis e rollback integral.");
}
main().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>prisma.$disconnect());
