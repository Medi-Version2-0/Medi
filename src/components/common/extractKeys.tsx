export type Mapping = { [key: number]: string };

export const createMap = ( data: { [key: string]: any }[], keyExtractor: (item: any) => number, valueExtractor: (item: any) => string): Mapping => {
  const mapp: Mapping = {};
  data.forEach((d) => {
    mapp[keyExtractor(d)] = valueExtractor(d);
  });
  return mapp;
};

export const extractKeys = (mappings: Mapping): number[] => {
  return Object.keys(mappings).map((key) => Number(key));
};

export const lookupValue = (mappings: Mapping, key: number): string | undefined => {
  return mappings[key];
};
