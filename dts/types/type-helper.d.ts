/** @format */
import type { AxiosResponse } from "axios";
import type { Model, ModelStatic } from "sequelize";
export interface AxiosRespBase {
    success: boolean;
    message: string;
}
export type AxiosResp<T> = AxiosRespBase & AxiosResponse<JSONTransform<T>>;
export type TPromisify<F> = F extends (...args: infer A) => infer R ? (...args: A) => Promise<R> : never;
export type TParialPick<O, KeyUnion> = KeyUnion extends keyof O ? Partial<Pick<O, KeyUnion>> : never;
export type TMarkPartialAttrs<T, A> = TParialPick<T, A> & TOmit<T, A>;
export type TPick<O, KeyUnion> = KeyUnion extends keyof O ? Pick<O, KeyUnion> : never;
export type TOmit<O, KeyUnion> = KeyUnion extends keyof O ? Omit<O, KeyUnion> : never;
export type TPickAttrs<O, KeyUnion extends string | number | symbol> = {
    [P in KeyUnion]: P extends keyof O ? O[P] : never;
};
export type TArrayToUnion<A> = A extends [infer F, ...infer R] ? F | TArrayToUnion<R> : never;
export type UnionToFunction<U> = U extends any ? (k: U) => void : never;
export type UnionToIntersection<U> = UnionToFunction<U> extends (k: infer I) => void ? I : never;
export type LastInUnion<U> = UnionToIntersection<UnionToFunction<U>> extends (k: infer I) => void ? I : never;
export type UnionToArray<U, I = LastInUnion<U>> = [I] extends [never] ? [] : [...UnionToArray<Exclude<U, I>>, I];
export type TArrayInnerTypeConstraintHelper<A, T, O> = A extends [infer I, ...infer R] ? I extends T ? TArrayInnerTypeConstraintHelper<R, T, O> : never : A extends [] ? O : never;
export type TArrayInnerTypeConstraint<A, T> = TArrayInnerTypeConstraintHelper<A, T, A>;
export type TExtractModelFromCtor<T extends ModelStatic<any>> = T extends ModelStatic<infer I> ? I : never;
export type TExtractInterfaceFromModel<T extends Model<any>> = T extends Model<infer I, infer _> ? I : never;
export type TExtractAttrsFromModel<T extends Model<any>> = keyof TExtractInterfaceFromModel<T>;
export type TPartialModel<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = TPickAttrs<T, U> & Omit<T, TExtractAttrsFromModel<T>>;
export type TPartialModelArr<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = TPartialModel<T, U>[];
export type AsyncPartialModelPicker<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = (attributes: U[]) => Promise<TPartialModel<T, U>>;
export type AsyncPartialModelArrPicker<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = (attributes: U[]) => Promise<TPartialModel<T, U>[]>;
export type JSONFields = string | number | boolean | null | undefined;
export type ToSafeJSONField<T> = Exclude<T, Date> extends JSONFields ? Date extends T ? T extends Date ? string : Exclude<T, Date> | string : Exclude<T, Date> : never;
export type JSONTransform<T> = T extends Record<string | number | symbol, any> | JSONFields | Date ? T extends JSONFields | Date ? ToSafeJSONField<T> : [keyof Exclude<T, JSONFields | Date>] extends [never] ? {} | Exclude<T, Exclude<T, JSONFields | Date>> : {
    [P in keyof T]: JSONTransform<T[P]>;
} | Exclude<T, Exclude<T, JSONFields | Date>> : never;
