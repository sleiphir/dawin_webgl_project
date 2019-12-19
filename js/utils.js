/**
 * Returns a pseudorandom number between min and max
 * @param {number} min minimum value
 * @param {number} max maximum value
 */
export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min
}
