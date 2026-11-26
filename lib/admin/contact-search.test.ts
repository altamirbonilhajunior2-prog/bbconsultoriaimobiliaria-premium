import assert from "node:assert/strict";
import test from "node:test";
import {contactSearchTerm} from "./contact-search";
test("telefone pode ser pesquisado com formatação ou por parte do número",()=>{
  assert.deepEqual(contactSearchTerm("(12) 99999-1234"),{phone:true,pattern:"%12999991234%"});
  assert.deepEqual(contactSearchTerm("+55 12 99999-1234"),{phone:true,pattern:"%12999991234%"});
  assert.deepEqual(contactSearchTerm("1234"),{phone:true,pattern:"%1234%"});
});
test("nome ignora acentos/caixa e caracteres de LIKE são literais",()=>{
  assert.deepEqual(contactSearchTerm("  JOSÉ   Silva "),{phone:false,pattern:"%jose silva%"});
  assert.equal(contactSearchTerm("%_").pattern,"%\\%\\_%");
});
