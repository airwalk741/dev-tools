import type { DataType } from "../constants/data";

export interface FieldConfig {
  prefix?: string;
  startFrom?: number;
  options?: string;
}

export interface Field {
  id: string;
  keyName: string;
  type: DataType;
  config: FieldConfig;
}
