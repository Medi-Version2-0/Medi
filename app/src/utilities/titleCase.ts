const titleCase = (str: string) => {
  return str.toLowerCase().replace(/\b\w/g, function (word) {
    return word.toUpperCase();
  });
};

export default titleCase;
