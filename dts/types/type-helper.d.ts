/** @format */
/// <reference types="node" />
import type { AxiosResponse } from "axios";
import type { Model, ModelStatic } from "sequelize";
interface AxiosRespBase {
    success: boolean;
    message: string;
}
export type AxiosResp<T> = AxiosRespBase & AxiosResponse<JSON.From<T>>;
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
export type TPartialModelPrimitive<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = TPickAttrs<T, U>;
export type TPartialModelPrimitiveArr<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = TPartialModelPrimitive<T, U>[];
export type AsyncPartialModelPicker<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = (attributes: U[]) => Promise<TPartialModel<T, U>>;
export type AsyncPartialModelArrPicker<T extends Model<any>, U extends TExtractAttrsFromModel<T>> = (attributes: U[]) => Promise<TPartialModel<T, U>[]>;
export declare namespace JSON {
    type Fields = string | number | boolean | null | undefined | void;
    type ToSafeField<T> = Exclude<T, Date | Buffer> extends Fields ? Exclude<T, Date> extends Fields ? Date extends T ? T extends Date ? string : Exclude<T, Date> | string : Exclude<T, Date> : Exclude<T, Buffer> extends Fields ? Buffer extends T ? T extends Buffer ? {
        type: "Buffer";
        data: Uint8Array;
    } : Exclude<T, Buffer> | {
        type: "Buffer";
        data: Uint8Array;
    } : Exclude<T, Buffer> : ToSafeField<Exclude<T, Buffer>> | ToSafeField<Exclude<T, Date>> : never;
    type From<T> = T extends Record<string | number | symbol, any> | Fields | Date | Buffer ? T extends Fields | Date | Buffer ? ToSafeField<T> : [keyof Exclude<T, Fields | Date | Buffer>] extends [never] ? {} | Exclude<T, Exclude<T, Fields | Date | Buffer>> : {
        [P in keyof T]: From<T[P]>;
    } | Exclude<T, Exclude<T, Fields | Date | Buffer>> : never;
}
export {};
