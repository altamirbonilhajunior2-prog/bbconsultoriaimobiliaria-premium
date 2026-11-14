import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";
import { propertyTypes } from "../app/data/searchOptions";

test("Prédio is residential and commercial buildings retain their category", () => {
  assert.deepEqual(propertyTypes["Prédio"], ["Residencial"]);
  assert.ok(propertyTypes.Comercial.includes("Prédio Comercial"));
});

// Execute the actual mapping/filter declarations without loading server side effects.
function declarations(file: string, names: string[]) {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const selected = source.statements.filter((node) =>
    (ts.isFunctionDeclaration(node) && names.includes(node.name?.text ?? "")) ||
    (ts.isVariableStatement(node) && node.declarationList.declarations.some((d) => names.includes(d.name.getText(source)))),
  );
  const code = ts.transpileModule(selected.map((n) => n.getText(source)).join("\n"), {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  return vm.runInNewContext(`${code}\n({${names.join(",")}})`) as Record<string, (...args: string[]) => string | boolean | null>;
}

test("create and edit retain all types and reject invalid values", () => {
  const expected = { Casa: "CASA", Apartamento: "APARTAMENTO", "Prédio": "PREDIO", Terreno: "TERRENO", Comercial: "COMERCIAL", Rural: "RURAL" };
  for (const file of ["app/admin/imoveis/novo/actions.ts", "app/admin/imoveis/[code]/actions.ts"]) {
    const { mapPropertyType } = declarations(file, ["mapPropertyType"]);
    for (const [label, value] of Object.entries(expected)) assert.equal(mapPropertyType(label), value);
    assert.equal(mapPropertyType("Inválido"), null);
  }
  const { getPropertyCodePrefix } = declarations("app/admin/imoveis/novo/actions.ts", ["getPropertyCodePrefix"]);
  assert.equal(getPropertyCodePrefix("PREDIO"), "BBP");
  assert.equal(getPropertyCodePrefix("COMERCIAL"), "BBM");
});

test("sale and rental filters distinguish Prédio from legacy Prédio Comercial", () => {
  for (const file of ["app/comprar/page.tsx", "app/alugar/page.tsx"]) {
    const { matchesPropertyTypeFilter: matches } = declarations(file, ["propertyTypeLabels", "normalizeText", "matchesPropertyTypeFilter"]);
    assert.equal(matches("PREDIO", "Padrão", "Prédio"), true);
    assert.equal(matches("PREDIO", "Padrão", "predio"), true);
    assert.equal(matches("COMERCIAL", "Prédio Comercial", "Prédio"), false);
    assert.equal(matches("COMERCIAL", "Prédio Comercial", "Comercial"), true);
    assert.equal(matches("PREDIO", "Padrão", "Apartamento"), false);
    assert.equal(matches("RURAL", "Chácara", "Chácara"), true);
  }
});
