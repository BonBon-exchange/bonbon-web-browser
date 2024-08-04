let elementCache = new WeakMap();

function cacheElement(el) {
    elementCache.set(el, { cachedData: 'some data' });
}

function getElementData(el) {
    return elementCache.get(el);
}

let el = document.createElement('div');
cacheElement(el);

console.log(getElementData(el)); // { cachedData: 'some data' }
// When 'el' is dereferenced, it's removed from the cache automatically
el = null;
