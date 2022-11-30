import type { AxiosResponse } from "axios";

export interface AxiosRespBase {
  success: boolean;
  message: string;
}

export type AxiosResp<T> = AxiosRespBase & AxiosResponse<T>;
