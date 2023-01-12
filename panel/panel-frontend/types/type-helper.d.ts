/** @format */

import type { AxiosResponse } from "axios";

export interface AxiosRespBase {
  success: boolean;
  message: string;
}

export type AxiosResp<T> = AxiosRespBase & AxiosResponse<JSONTransform<T>>;

export type JSONFields = string | number | boolean | null | undefined | void;
export type ToSafeJSONField<T> = Exclude<T, Date | Buffer> extends JSONFields
  ? Exclude<T, Date> extends JSONFields
    ? Date extends T //T - Date \in JSONFields, so  T does not contain Buffer
      ? T extends Date // T == Date
        ? string // Date --> string
        : Exclude<T, Date> | string // X | Date --> X | string
      : Exclude<T, Date> // probably T itself is JSONFields
    : Exclude<T, Buffer> extends JSONFields
    ? Buffer extends T // T - Buffer \in JSONFields, so T does not contain Date
      ? T extends Buffer // T == Buffer
        ? { type: "Buffer"; data: Uint8Array } // Buffer --> object
        : Exclude<T, Buffer> | { type: "Buffer"; data: Uint8Array } // X | Buffer --> X | object
      : Exclude<T, Buffer> // probably T itself is JSONFields
    : ToSafeJSONField<Exclude<T, Buffer>> | ToSafeJSONField<Exclude<T, Date>> // X | Buffer | Date --> X | object | string
  : never;

export type JSONTransform<T> = T extends Record<string | number | symbol, any> | JSONFields | Date | Buffer
  ? T extends JSONFields | Date | Buffer
    ? ToSafeJSONField<T>
    : [keyof Exclude<T, JSONFields | Date | Buffer>] extends [never] // T contains Record<..., any>
    ? {} | Exclude<T, Exclude<T, JSONFields | Date | Buffer>>
    : { [P in keyof T]: JSONTransform<T[P]> } | Exclude<T, Exclude<T, JSONFields | Date | Buffer>>
  : never; // T is not a valid argument for JSONTransform
