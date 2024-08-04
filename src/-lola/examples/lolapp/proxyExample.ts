// ./lola/lolapp/proxyExample.ts

import { MemoryManagedProxy } from '../../seludom/mm';

export function proxyExample() {
    console.log('--- Proxy Example ---');

    // Define a function to proxy
    function calculateSum(a: number, b: number) {
        return a + b;
    }

    // Create a proxy
    const memoryProxy = new MemoryManagedProxy(calculateSum);
    const proxiedCalculateSum = memoryProxy.getProxy();

    // Use the proxied function
    const result = proxiedCalculateSum(5, 7);
    console.log('Proxied function result:', result);

    // Clear memory
    memoryProxy.clear();
    console.log('Memory cleared after function execution');
}
