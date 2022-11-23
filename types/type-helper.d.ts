import type { Model, ModelCtor } from "sequelize";

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
// We use `[never]` because `never` is the empty union and conditional type on union is distributive.
// see: https://github.com/microsoft/TypeScript/issues/31751#issuecomment-498526919
export type UnionToArray<U, I = LastInUnion<U>> = [I] extends [never] ? [] : [...UnionToArray<Exclude<U, I>>, I];

export type TArrayInnerTypeConstraintHelper<A, T, O> = A extends [infer I, ...infer R]
  ? I extends T
    ? TArrayInnerTypeConstraintHelper<R, T, O>
    : never
  : A extends []
  ? O
  : never;
export type TArrayInnerTypeConstraint<A, T> = TArrayInnerTypeConstraintHelper<A, T, A>;

export type TExtractModel<T extends ModelCtor<any>> = T extends ModelCtor<infer I> ? I : never;
export type TExtractModelDefs<T extends ModelCtor<any>> = T extends ModelCtor<infer M>
  ? M extends Model<infer I, infer _>
    ? I
    : never
  : never;
export type TExtractModelKeyUnion<T extends ModelCtor<any>> = keyof TExtractModelDefs<T>;

// for limiting accessible attributes

export type TModelAttrsOnly<T extends ModelCtor<any>, U extends TExtractModelKeyUnion<T>> = TPickAttrs<
  TExtractModel<T>,
  U
> &
  Omit<TExtractModel<T>, TExtractModelKeyUnion<T>>;
export type TModelListAttrsOnly<T extends ModelCtor<any>, U extends TExtractModelKeyUnion<T>> = TModelAttrsOnly<T, U>[];
export type TModelAttrsOnlyAsync<T extends ModelCtor<any>, U extends TExtractModelKeyUnion<T>> = (
  attributes: U[]
) => Promise<TModelAttrsOnly<T, U>>;
export type TModelListAttrsOnlyAsync<T extends ModelCtor<any>, U extends TExtractModelKeyUnion<T>> = (
  attributes: U[]
) => Promise<TModelAttrsOnly<T, U>[]>;
