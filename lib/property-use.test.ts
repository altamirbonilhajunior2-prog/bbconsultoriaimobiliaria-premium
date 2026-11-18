import assert from "node:assert/strict";
import test from "node:test";
import { isPropertyUse, matchesPropertyUseFilter, parsePropertyUse } from "./property-use";

test("form use accepts the three choices and distinguishes omission from clearing", () => {
  for (const value of ["RESIDENCIAL", "COMERCIAL", "MISTO"]) {
    assert.equal(parsePropertyUse(value), value);
  }
  assert.equal(parsePropertyUse(null), undefined);
  assert.equal(parsePropertyUse(""), null);
  for (const value of ["CASA", "Misto", "constructor", "toString", "__proto__", "MISTO "]) {
    assert.equal(isPropertyUse(value), false);
    assert.throws(() => parsePropertyUse(value));
  }
  assert.throws(() => parsePropertyUse(new File(["MISTO"], "use.txt")));
});

test("use filters are exact and never infer classifications for existing properties", () => {
  for (const stored of ["RESIDENCIAL", "COMERCIAL", "MISTO", null] as const) {
    assert.equal(matchesPropertyUseFilter(stored, ""), true);
    assert.equal(matchesPropertyUseFilter(stored, null), true);
    for (const selected of ["RESIDENCIAL", "COMERCIAL", "MISTO"]) {
      assert.equal(matchesPropertyUseFilter(stored, selected), stored === selected);
    }
    assert.equal(matchesPropertyUseFilter(stored, "unknown"), false);
  }
});
