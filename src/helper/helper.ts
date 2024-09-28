import { APIURL } from './api';
import { Mapping } from '../interface/global';
import { ValueFormatterParams, ValueParserParams } from "ag-grid-community";

export const sendEmail = async ({
  email,
  subject,
  attachments,
  message,
}: {
  email: string;
  subject: string;
  message: string;
  attachments: { content: Blob; filename: string }[];
}) => {
  const formData = new FormData();
  formData.append('to', email);
  formData.append('subject', subject);
  formData.append('html', message);
  attachments.forEach((blob) => {
    formData.append(`attachments`, blob.content, blob.filename);
  });

  return fetch(APIURL + '/email', {
    method: 'POST',
    body: formData,
  }).then((res) => res.text());
};

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

export const lookupValue = (mappings: Mapping, key: string | number): string | any => {
  return mappings[key];
};

// value formatter
export const decimalFormatter = (params: ValueFormatterParams): any => (params.value === 0 || params.value) ?  parseFloat(params.value).toFixed(2) : null

//
export const stringValueParser = (params: ValueParserParams): string => {
  const { newValue } = params;
  // Ensure newValue is a string and convert to uppercase
  return typeof newValue === 'string' ? newValue.toUpperCase() : newValue;
}

// cell editing validation
export const validateField = async (schema: any, field: string, value: any) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error: any) {
    return error.message;
  }
};

export const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};

export const isLessThanMonths = (date1Str:string, date2Str:string , months:number) => {
  const date1 = new Date(date1Str.split("/").reverse().join("-"));
  const date2 = new Date(date2Str.split("/").reverse().join("-") + "-01");
  const monthDiff = (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
  return Math.abs(monthDiff) <= (months || 6);
}

export const getTodayDate = (date: Date): string =>  {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function capitalFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function removeNullUndefinedEmptyString(data:any) {
  return Object.fromEntries(           
    Object.entries(data).filter(([key, value]) => value !== '' && value !== undefined && value !== null)
  );
}