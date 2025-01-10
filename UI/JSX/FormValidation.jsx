//Function to validate if a string contains only alphabetic characters.
export function validateAlphabets(value) {
  const onlyLetters = /^[A-Za-z]+$/;
  return onlyLetters.test(value);
}
//Function to validate if a value represents a valid age within the range of 20 to 70
export function validateAge(value) {
  const parsedAge = parseInt(value);
  return !isNaN(parsedAge) && parsedAge >= 20 && parsedAge <= 70;
}
