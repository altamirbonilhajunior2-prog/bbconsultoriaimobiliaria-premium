import assert from "node:assert/strict";
import test from "node:test";
import { matchesAdminPropertySearch as matches } from "./property-search";

const property = {code:"BBA023",title:"Apartamento com varanda",development:"Condomínio Pátio São José"};
test("referência aceita espaços e caixa, sem incluir referências mais longas",()=>{
  for(const query of ["BBA023","BBA 023"," bba   023 ","BBA\u00a0023"]) assert.equal(matches(property,query),true);
  assert.equal(matches({...property,code:"BBA0230"},"BBA 023"),false);
  assert.equal(matches(property,"BBC023"),false);
});
test("título e condomínio aceitam palavras sem acentos e em qualquer ordem",()=>{
  for(const query of ["apartamento","VARANDA apartamento","patio","sao jose","Condomínio Pátio"]) assert.equal(matches(property,query),true);
  assert.equal(matches(property,"condomínio inexistente"),false);
  assert.equal(matches({...property,development:null},"varanda"),true);
});
test("busca vazia mantém a lista e caracteres especiais são tratados como texto",()=>{
  for(const query of ["","  ","bba","023"]) assert.equal(matches(property,query),true);
  for(const query of ["%",".*","' OR 1=1","<script>"]) assert.equal(matches(property,query),false);
});
