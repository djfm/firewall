import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from 'express';

export type Request<K extends string | number | symbol, V> = {
	features: {
		[key in K]: V;
	};

	add: (feature: K, value: V) => Request<keyof K, V>;
};

export type Middleware = (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void;

export const createDefaultMiddleware = (): Middleware => {
	return (req, res, next) => {
		console.log('Default middleware here!');
		next();
	};
}
