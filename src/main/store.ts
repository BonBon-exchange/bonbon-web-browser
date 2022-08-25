/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/prefer-default-export */
import Store from 'electron-store';

const store = new Store();

export const getStore = () => store;

if (store.get('browsing.defaultWebpage') === undefined)
  store.set('browsing.defaultWebpage', 'https://www.google.com');

if (store.get('browsing.searchEngine') === undefined)
  store.set('browsing.searchEngine', 'DuckDuckGo');

if (store.get('browsing.customSearchEngine') === undefined)
  store.set(
    'browsing.customSearchEngine',
    'https://duckduckgo.com/?q=${search}'
  );

if (store.get('browsing.width') === undefined) store.set('browsing.width', 600);

if (store.get('browsing.height') === undefined)
  store.set('browsing.height', 800);

if (
  store.get('browsing.size') === undefined ||
  store.get('browsing.size') === 'fit' // fix related with issue #341 https://github.com/BonBon-exchange/bonbon-web-browser/issues/341
)
  store.set('browsing.size', 'lastResized');

if (store.get('browsing.topEdge') === undefined)
  store.set('browsing.topEdge', 'fit');

// migrate searchEngine
const searchEngineValue = store.get('browsing.searchEngine') as string;
const searchEngineMigrationObject: Record<string, string> = {
  google: 'Google',
  presearch: 'Presearch',
  qwant: 'Qwant',
  duckduckgo: 'DuckDuckGo',
  yandex: 'Yandex',
  swisscows: 'Swisscows',
  ecosia: 'Ecosia',
  startpage: 'Startpage',
};
const newSearchEngineValue =
  searchEngineMigrationObject[searchEngineValue] || searchEngineValue;
store.set('browsing.searchEngine', newSearchEngineValue);
