import type { RequestHandler as ExpressRequestHandler } from 'express';
export type Request<K extends string | number | symbol, V> = {
    features: {
        [key in K]: V;
    };
    add: (feature: K, value: V) => Request<keyof K, V>;
};
export interface BaseValue {
    type: Value['type'];
}
export interface StringValue extends BaseValue {
    type: 'string';
    value: string;
}
export interface NumberValue extends BaseValue {
    type: 'number';
    value: number;
}
export interface FieldValue extends BaseValue {
    type: 'field';
    key: string;
    value: Value;
}
export interface ArrayValue extends BaseValue {
    type: 'array';
    value: Value[];
}
export interface RowValue extends BaseValue {
    type: 'row';
    value: FieldValue[];
}
export type Value = StringValue | NumberValue | FieldValue | ArrayValue | RowValue;
export type PathLike = string;
export type Middleware = ExpressRequestHandler;
export declare const createDefaultMiddleware: () => ExpressRequestHandler;
export default createDefaultMiddleware;
//# sourceMappingURL=index.d.ts.map