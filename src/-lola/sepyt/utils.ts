import { type Expected } from "./lola";

export function ensureExpectedType<T>(value: T): Expected<T> {
    return value as Expected<T>;
}