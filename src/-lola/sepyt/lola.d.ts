export type Expected<T = any> = T extends (...args: any[]) => any
    ? (...args: Expected<Parameters<T>>) => Expected<ReturnType<T>>
    : T extends any[]
    ? Expected<T[number]>[]
    : T extends object
    ? { [K in keyof T]: Expected<T[K]> }
    : T;