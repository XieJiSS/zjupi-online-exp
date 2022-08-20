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

/**
 * @template T
 * @template U
 * @param {T extends {} ? T : never} a
 * @param {U extends {} ? U : never} b
 * @returns {T & U}
 */
function combineObject(a, b) {
  return { ...a, ...b };
}

module.exports = {
  unionTypeValue,
  combineObject,
};
