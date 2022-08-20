// @ts-check

/**
 * @template T
 * @template U
 * @param {T} a
 * @param {U} b
 */
function unionTypeValue(a, b) {
  return [a, b][Date.now() % 2];
}

module.exports = {
  unionTypeValue,
};
