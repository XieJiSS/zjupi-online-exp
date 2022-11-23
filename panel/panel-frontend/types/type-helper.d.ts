export type AxiosResp<T> = {
  success: boolean;
  message: string;
  data: T;
};
