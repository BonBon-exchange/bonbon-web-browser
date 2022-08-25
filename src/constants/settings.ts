/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/prefer-default-export */
export const searchEngines = {
  Google: 'https://www.google.com/search?q=${search}',
  Presearch: 'https://presearch.com/search?q=${search}',
  Qwant: 'https://www.qwant.com/?l=fr&q=${search}&t=web',
  DuckDuckGo: 'https://duckduckgo.com/?q=${search}',
  Yandex: 'https://yandex.com/search/?text=${search}',
  Swisscows: 'https://swisscows.com/web?query=${search}',
  Ecosia: 'https://www.ecosia.org/search?method=index&q=${search}',
  Startpage: 'https://www.startpage.com/do/search?query=${search}',
  Custom: '',
};
