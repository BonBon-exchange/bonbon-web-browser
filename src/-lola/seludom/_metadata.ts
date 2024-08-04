let nodeMetadata = new WeakMap();

function attachMetadata(node, data) {
    nodeMetadata.set(node, data);
}

let node = document.createElement('div');
attachMetadata(node, { key: 'value' });
// When 'node' is removed from DOM and dereferenced, its metadata is collected
node = null;

-----

// seludom/metadata.ts

const metadataStore = new Map<string, any>();

export function getMetadata(key: string): any {
    return metadataStore.get(key);
}

export function setMetadata(key: string, value: any): void {
    metadataStore.set(key, value);
}
