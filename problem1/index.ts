/* 
    Input: n - any integer
    Assuming this input will always produce a result lesser than Number.MAX_SAFE_INTEGER.
    Read README.md for more information.
*/

function validateNumber(n: number): void {
  if (!Number.isInteger(n)) throw new TypeError("Input must be an integer.");
}

/* 
  Time complexity: O(n)
  Space complexity: O(log n)
*/
var sum_to_n_a = function (n: number): number {
  validateNumber(n);
  if (n === 0) return 0;
  const sign = Math.sign(n);
  const num = Math.abs(n);

  function sum_recursive(m: number): number {
    if (m === 0) return 0;
    if (m === 1) return 1;
    const divide = Math.floor(m / 2);
    const remainder = m % 2;
    return (
      sum_recursive(divide) +
      sum_recursive(divide + remainder) +
      divide * (divide + remainder)
    );
  }

  const sum = sum_recursive(num);
  return sign * sum;
};

/* 
  Time complexity: O(n)
  Space complexity: O(1)
*/
var sum_to_n_b = function (n: number): number {
  validateNumber(n);
  if (n === 0) return 0;
  let sum = 0;
  const sign = Math.sign(n);
  const num = Math.abs(n);
  for (let i = 1; i <= num; i++) {
    sum += i;
  }
  return sign * sum;
};

/* 
  Time complexity: O(1)
  Space complexity: O(1)
*/
var sum_to_n_c = function (n: number): number {
  validateNumber(n);
  if (n === 0) return 0;
  const sign = Math.sign(n);
  const num = Math.abs(n);
  return (sign * (num * (num + 1))) / 2;
};

export { sum_to_n_a, sum_to_n_b, sum_to_n_c };
