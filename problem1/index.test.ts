import { test } from "node:test";
import assert from "node:assert/strict";
import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

const happyTestCases = [
  { input: 0, expected: 0 },
  { input: 1, expected: 1 },
  { input: 2, expected: 3 },
  { input: 3, expected: 6 },
  { input: 4, expected: 10 },
  { input: 5, expected: 15 },
  { input: -1, expected: -1 },
  { input: -2, expected: -3 },
  { input: -3, expected: -6 },
  { input: -4, expected: -10 },
  { input: -5, expected: -15 },
];

const edgeTestCases = [
  { input: 134217727, expected: 9007199187632128 },
  { input: -134217727, expected: -9007199187632128 },
];

const invalidTestCases = [
  { input: NaN },
  { input: Infinity },
  { input: -Infinity },
  { input: "string" },
  { input: null },
  { input: undefined },
  { input: 1.5 },
];
test("sum_to_n_a", () => {
  happyTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_a(input), expected);
  });
});
test("sum_to_n_a edge cases", () => {
  edgeTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_a(input), expected);
  });
});
test("sum_to_n_a invalid cases", () => {
  invalidTestCases.forEach(({ input }) => {
    assert.throws(() => sum_to_n_a(input as any), TypeError);
  });
});

test("sum_to_n_b", () => {
  happyTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_b(input), expected);
  });
});
test("sum_to_n_b edge cases", () => {
  edgeTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_b(input), expected);
  });
});
test("sum_to_n_b invalid cases", () => {
  invalidTestCases.forEach(({ input }) => {
    assert.throws(() => sum_to_n_b(input as any), TypeError);
  });
});

test("sum_to_n_c", () => {
  happyTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_c(input), expected);
  });
});
test("sum_to_n_c edge cases", () => {
  edgeTestCases.forEach(({ input, expected }) => {
    assert.equal(sum_to_n_c(input), expected);
  });
});
test("sum_to_n_c invalid cases", () => {
  invalidTestCases.forEach(({ input }) => {
    assert.throws(() => sum_to_n_c(input as any), TypeError);
  });
});
