import { APIURL } from './api';
import { Mapping } from '../interface/global';
import { ValueFormatterParams } from "ag-grid-community";

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
export const decimalFormatter = (params: ValueFormatterParams): any => (params.value === 0 || params.value) ?  parseFloat(params.value).toFixed(2) : ''

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