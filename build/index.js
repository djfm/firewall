"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDefaultMiddleware = void 0;
const log = console.log;
const field = (key, value) => {
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
};
const row = (value = []) => {
    const res = {
        type: 'row',
        value,
    };
    const get = (key) => {
        if (!key) {
            return res;
        }
        const field = value.find((f) => f.key === key);
        if (!field) {
            return undefined;
        }
        return field.value;
    };
    const set = (key, newValue) => {
        const existingField = value.find((f) => f.key === key);
        if (existingField) {
            return row(value.map((f) => {
                if (f.key === key) {
                    return field(key, newValue);
                }
                return f;
            }));
        }
        return row([
            ...value,
            field(key, newValue),
        ]);
    };
    return {
        get,
        set,
    };
};
const nLimit = 200;
const requests = [];
const updateStatistics = (newData, oldData) => {
};
const addRequest = (request) => {
    log('addRequest', request);
    requests.push(request);
    if (requests.length > nLimit) {
        const first = requests.shift();
        if (first) {
            updateStatistics(request, first);
        }
    }
};
const createDefaultMiddleware = () => {
    const t = Date.now();
    return (req, res, next) => {
        var _a, _b;
        const reqModel = row()
            .set('method', req.method)
            .set('path', req.path)
            .set('user-agent', (_a = req.headers['user-agent']) !== null && _a !== void 0 ? _a : '')
            .set('ip', req.ip)
            .set('referer', (_b = req.headers['referer']) !== null && _b !== void 0 ? _b : '');
        res.on('close', () => {
            var _a;
            const finalReqModel = reqModel
                .set('status', res.statusCode)
                .set('duration', Date.now() - t)
                .set('status-message', (_a = res.statusMessage) !== null && _a !== void 0 ? _a : '');
            addRequest(finalReqModel.get());
        });
        console.log('Default middleware here!');
        next();
    };
};
exports.createDefaultMiddleware = createDefaultMiddleware;
exports.default = exports.createDefaultMiddleware;
