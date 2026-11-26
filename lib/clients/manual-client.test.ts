import assert from "node:assert/strict";
import test from "node:test";
import { parseManualClient } from "./manual-client";
import { parsePersonalDetails } from "./personal-details";

function form(extra: Record<string, string> = {}) {
  const result = new FormData();
  for (const [key, value] of Object.entries({ name: "Cliente de teste", phone: "(12) 99999-9999", ...extra })) result.set(key, value);
  return result;
}

test("normaliza telefone com e sem código do país e deduplica imóveis", () => {
  const input = parseManualClient(form({ propertyCodes: "bba002; BBC033 bba002", email: " teste@example.com " }));
  assert.equal(input.phone, "5512999999999");
  assert.deepEqual(input.propertyCodes, ["BBA002", "BBC033"]);
  assert.equal(input.email, "teste@example.com");
  assert.equal(parseManualClient(form({ phone: "+55 (12) 99999-9999" })).phone, input.phone);
  assert.equal(parseManualClient(form({ phone: "(55) 3333-4444" })).phone, "555533334444");
});

test("permite cadastro sem e-mail, observações ou imóveis", () => {
  const input = parseManualClient(form());
  assert.equal(input.email, "");
  assert.equal(input.notes, "");
  assert.deepEqual(input.propertyCodes, []);
});

test("rejeita dados inválidos no servidor", () => {
  const invalid: Record<string, string>[] = [{name:" "}, {name:"a".repeat(181)}, {phone:"9999"}, {phone:"abc12999999999"}, {email:"a@"}, {notes:"a".repeat(5001)}, {propertyCodes:Array.from({length:51},(_,i)=>`BBC${i}`).join(",")}];
  for (const input of invalid) {
    assert.throws(() => parseManualClient(form(input)));
  }
});

test("valida os dados complementares e preserva centavos", () => {
  const personal = parsePersonalDetails(form({cpf:"529.982.247-25", rg:"12.345.678-X", maritalStatus:"Casado(a)", profession:"Arquiteto", monthlyIncome:"5.123,45", birthDate:"1990-02-28", address:"Endereço de teste"}));
  assert.equal(personal.cpf,"52998224725");
  assert.equal(personal.monthlyIncome,"5123.45");
  assert.equal(personal.rg,"12.345.678-X");
  assert.equal(personal.birthDate?.toISOString().slice(0,10),"1990-02-28");
  for(const income of ["0","5000.50","5.000","5.000,50"]) assert.ok(parsePersonalDetails(form({monthlyIncome:income})).monthlyIncome !== null);
  const invalid: Record<string,string>[] = [{cpf:"11111111111"},{cpf:"52998224724"},{maritalStatus:"INVALIDO"},{monthlyIncome:"-10"},{monthlyIncome:"NaN"},{monthlyIncome:"1,222"},{birthDate:"2025-02-30"},{birthDate:"2999-01-01"}];
  for(const value of invalid) assert.throws(()=>parsePersonalDetails(form(value)));
  assert.equal(parsePersonalDetails(form()).monthlyIncome,null);
});
