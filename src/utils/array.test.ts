import { expect, test } from 'vitest';
import * as Array from './array';
import * as IntervalUtils from "./interval";

test("first", () => {
  const arr = new Array.SortedArray([3,6,5,2], (a, b) => a-b);
  const t = arr.getArray();
  arr.add(4);
  expect(arr.search(4)).toBe(2);
  arr.add(20);
  const b = arr.getArray();
  expect(b).toStrictEqual([2,3,4,5,6,20]);
  arr.remove(1);
  const c = arr.getArray();
  console.log(c);
  expect(c).toStrictEqual([2,4,5,6,20]);
});

test("intervals", () => {
  const t1 = IntervalUtils.nextOrSameFractionInterval(1, 0.5);
  expect(t1).toBe(1);
  const t2 = IntervalUtils.nextOrSameFractionInterval(1.1, 0.5);
  expect(t2).toBe(1.5);
  const t3 = IntervalUtils.nextOrSameFractionInterval(1.1, 0.25);
  expect(t3).toBe(1.25);
  const t4 = IntervalUtils.nextOrSameFractionInterval(1.8, 0.25);
  expect(t4).toBe(2);

  const t5 = IntervalUtils.prevOrSameFractionInterval(1.8, 0.25);
  expect(t5).toBe(1.75);
  const t6 = IntervalUtils.prevOrSameFractionInterval(1.1, 0.25);
  expect(t6).toBe(1);
  const t8 = IntervalUtils.prevOrSameFractionInterval(1.25, 0.25);
  expect(t8).toBe(1.25);
  const t7 = IntervalUtils.prevOrSameFractionInterval(2, 1);
  expect(t7).toBe(2);
});