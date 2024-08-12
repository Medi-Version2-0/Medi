import { ValueFormatterParams } from "ag-grid-community";

export const decimalFormatter = (params: ValueFormatterParams): any => params.value ? parseFloat(params.value).toFixed(2) : '';
