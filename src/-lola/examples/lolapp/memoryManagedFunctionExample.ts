// main.ts

import { MemoryManagedProxy } from "./seludom/mm";

// Example function to be proxied
function exampleFunction(a: number, b: number) {
    return a + b;
}

// Create an instance of MemoryManagedProxy
const memoryProxy = new MemoryManagedProxy(exampleFunction);

// Get the proxied function
const proxiedFunction = memoryProxy.getProxy();

// Use the proxied function
const result = proxiedFunction(3, 4);  // Logs the function call and its result
console.log(result);  // Outputs: 7

// Clear memory
memoryProxy.clear();
