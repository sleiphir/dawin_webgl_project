/**
 * Returns a pseudorandom number between min and max
 * @param {number} min minimum value
 * @param {number} max maximum value
 */
export const getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min
}

/**
 * Returns the mean value of the array
 * @param {*} arr array of int
 */
export const getMeanArray = arr => {
  let sum = 0
  arr.forEach(elem => {
    sum += elem
  })
  return sum / arr.length
}
