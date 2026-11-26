import assert from "node:assert/strict";
import test from "node:test";
import { parseOtherResources } from "./proposal-resources";

test("outros recursos exige descrição apenas quando selecionado", () => {
  const form = new FormData();
  assert.equal(parseOtherResources(form), null);
  form.set("otherResources", "Texto anterior");
  assert.equal(parseOtherResources(form), null);
  form.set("usesOtherResources", "on");
  form.set("otherResources", "   ");
  assert.throws(() => parseOtherResources(form), /Especifique/);
  form.set("otherResources", "  Carta de crédito de consórcio e permuta  ");
  assert.equal(parseOtherResources(form), "Carta de crédito de consórcio e permuta");
  form.set("otherResources", "x".repeat(1001));
  assert.throws(() => parseOtherResources(form), /1.000/);
  form.delete("usesOtherResources");
  assert.equal(parseOtherResources(form), null);
});
