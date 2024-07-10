export const numberedStringLowerCase = (str: string) => {
  return str.replace(/[A-Z]/g, (match) => match.toLowerCase());
};
