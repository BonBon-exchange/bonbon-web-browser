// seludom/ctx.ts

const publicContextSymbol = Symbol('publicContext');
const privateContextsSymbol = Symbol('privateContexts');

export class ContextManager {
    private static [publicContextSymbol] = new Map<string, any>();
    private static [privateContextsSymbol] = new WeakMap<object, Map<string, any>>();

    private static isValidKey(key: string): boolean {
        return /^[a-zA-Z0-9_]+$/.test(key);
    }

    static setPublicContext(key: string, value: any): void {
        if (!this.isValidKey(key)) {
            throw new Error('Invalid key format');
        }
        if (this[publicContextSymbol].has(key)) {
            throw new Error('Cannot modify an immutable context key');
        }
        this[publicContextSymbol].set(key, Object.freeze(value));
    }

    static getPublicContext<T = any>(key: string): T | undefined {
        return this[publicContextSymbol].get(key);
    }

    static setPrivateContext(object: object, key: string, value: any): void {
        if (!this.isValidKey(key)) {
            throw new Error('Invalid key format');
        }
        if (!this[privateContextsSymbol].has(object)) {
            this[privateContextsSymbol].set(object, new Map<string, any>());
        }
        const context = this[privateContextsSymbol].get(object);
        if (context?.has(key)) {
            throw new Error('Cannot modify an immutable context key');
        }
        context?.set(key, Object.freeze(value));
    }

    static getPrivateContext<T = any>(object: object, key: string): T | undefined {
        return this[privateContextsSymbol].get(object)?.get(key);
    }
}
