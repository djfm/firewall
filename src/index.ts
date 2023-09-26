import type {
	Request as ExpressRequest,
	Response as ExpressResponse,
	NextFunction as ExpressNextFunction,
} from 'express';

const log = console.log;

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

const field = (key: string, value: string | number | Value): FieldValue => {
	if (typeof value === 'string') {
		return {
			type: 'field',
			key,
			value: {
				type: 'string',
				value,
			},
		};
	}

	if (typeof value === 'number') {
		return {
			type: 'field',
			key,
			value: {
				type: 'number',
				value,
			},
		};
	}

	return {
		type: 'field',
		key,
		value,
	};
}

const row = (value: FieldValue[] = []) => {
	const res: RowValue = {
		type: 'row',
		value,
	};

	const get = (key?: string): Value | undefined => {
		if (!key) {
			return res;
		}

		const field = value.find((f) => f.key === key);

		if (!field) {
			return undefined;
		}

		return field.value;
	};

	const set = (key: string, newValue: string | number | Value) => {
		const existingField = value.find((f) => f.key === key);

		if (existingField) {
			return row(value.map((f) => {
					if (f.key === key) {
						return field(key, newValue);
					}

					return f;
				}),
			);
		}

		return row([
				...value,
				field(key, newValue),
			],
		);
	};

	return {
		get,
		set,
	}
};

export type Value = StringValue | NumberValue | FieldValue | ArrayValue | RowValue;

export type Middleware = (req: ExpressRequest, res: ExpressResponse, next: ExpressNextFunction) => void;

const nLimit = 200;
const requests: RowValue[] = [];

const updateStatistics = (newData: RowValue, oldData: RowValue) => {

}

const addRequest = (request: RowValue) => {
	log('addRequest', request);

	requests.push(request);

	if (requests.length > nLimit) {
		const first = requests.shift();

		if (first) {
			updateStatistics(request, first);
		}
	}
}

export const createDefaultMiddleware = (): Middleware => {
	const t = Date.now();

	return (req, res, next) => {
		const reqModel = row()
			.set('method', req.method)
			.set('path', req.path)
			.set('user-agent', req.headers['user-agent'] ?? '')
			.set('ip', req.ip)
			.set('referer', req.headers['referer'] ?? '')

		res.on('close', () => {
			const finalReqModel = reqModel
				.set('status', res.statusCode)
				.set('duration', Date.now() - t)
				.set('status-message', res.statusMessage ?? '')

			addRequest(finalReqModel.get() as RowValue);
		})

		console.log('Default middleware here!');
		next();
	};
}
