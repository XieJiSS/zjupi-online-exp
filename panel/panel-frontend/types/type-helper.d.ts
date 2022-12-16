/** @format */

import type { AxiosResponse } from "axios";

export interface AxiosRespBase {
  success: boolean;
  message: string;
}

export type AxiosResp<T> = AxiosRespBase & AxiosResponse<JSONLayer<T>>;

export type JSONFields = string | number | boolean | null | undefined;
export type MakeJSONSafe<T> = Exclude<T, Date> extends JSONFields
  ? Date extends T
    ? T extends Date // T == Date
      ? string // Date --> string
      : Exclude<T, Date> | string // X | Date --> X | string
    : Exclude<T, Date> // probably T itself is JSONFields
  : never;
export type JSONLayer<T> = T extends Record<string | number | symbol, any> | JSONFields | Date
  ? T extends JSONFields | Date
    ? MakeJSONSafe<T>
    : [keyof Exclude<T, JSONFields | Date>] extends [never] // T contains Record<..., any>
    ? {} | Exclude<T, Exclude<T, JSONFields | Date>>
    : { [P in keyof T]: JSONLayer<T[P]> } | Exclude<T, Exclude<T, JSONFields | Date>>
  : never; // T is not a valid argument for JSONLayer
