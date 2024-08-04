// seludom/mm.ts

import { Expected } from "../sepyt/lola";

export default class MemoryManagedProxy<T extends Function> {
    private proxy: T;
    private handler: ProxyHandler<Expected<T>>;

    constructor(private fn: T) {
        this.handler = {
            apply: (target: Expected, thisArg, argumentsList) => this.applyHandler(target, thisArg, argumentsList),
            deleteProperty: (target: Expected, property: Expected) => this.deletePropertyHandler(target, property)
        };
        this.proxy = new Proxy(fn, this.handler as Expected) as T;
    }

    private applyHandler(target: T, thisArg: any, argumentsList: any[]) {
        console.log(`Calling function ${target.name} with args:`, argumentsList);
        const result = Reflect.apply(target, thisArg, argumentsList);
        console.log(`Result:`, result);
        return result;
    }

    private deletePropertyHandler(target: T, property: keyof T) {
        if (property in target) {
            console.log(`Clearing function reference for property ${String(property)}`);
            delete target[property];
            return true;
        }
        return false;
    }

    getProxy(): T {
        return this.proxy;
    }

    clear() {
        console.log('Clearing memory...');
        for (let key in this.proxy) {
            delete (this.proxy as any)[key];
        }
    }
}
