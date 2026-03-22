import { expect, test } from 'vitest';
import * as Array from './array';

test("first", () => {
  const arr = new Array.SortedArray([3,6,5,2], (a, b) => a-b);
  const t = arr.getArray();
  arr.add(4);
  expect(arr.search(4)).toBe(2);
  arr.add(20);
  const b = arr.getArray();
  expect(b).toStrictEqual([2,3,4,5,6,20]);
});