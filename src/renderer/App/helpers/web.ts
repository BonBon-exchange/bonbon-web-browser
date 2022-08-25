/* eslint-disable no-template-curly-in-string */
/* eslint-disable import/prefer-default-export */
import { searchEngines } from 'constants/settings';
import { HistoryItem } from '../components/BrowserInputSuggestions/Types';

export const isValidHttpUrl = (s: string) => {
  let url;

  try {
    url = new URL(s);
  } catch (_) {
    return false;
  }

  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const makeSearchUrl = async (search: string): Promise<string> => {
  const val = await window.app.config.get('browsing.searchEngine');
  const customSearchEngine = await window.app.config.get(
    'browsing.customSearchEngine'
  );

  const typedVal = val as keyof typeof searchEngines | undefined;
  const typedCSE = customSearchEngine as string | undefined;
  const searchUrl = typedVal
    ? searchEngines[typedVal] || searchEngines.Google
    : searchEngines.Google;

  if (typedVal && typedVal === 'Custom' && typedCSE) {
    return typedCSE.replace('${search}', search);
  }

  return searchUrl.replace('${search}', search);
};

export const getDomainsFromHistory = (items: HistoryItem[]) => {
  const objects = items.map((i) => {
    const url = new URL(i.url);
    return {
      ...i,
      url: url.origin,
    };
  });

  return objects.reduce((acc, val) => {
    const exists = acc.find((a) => a.url === val.url);
    return exists ? acc : [val, ...acc];
  }, [] as HistoryItem[]);
};

export const getHostsFromHistory = (items: HistoryItem[]) => {
  const objects = items.map((i) => {
    try {
      const url = new URL(i.url);
      return {
        ...i,
        url: url.host.indexOf('www.') === 0 ? url.host.substring(4) : url.host,
      };
    } catch (e) {
      return i;
    }
  });

  return objects.reduce((acc, val) => {
    const exists = acc.find((a) => a.url === val.url);
    return exists ? acc : [val, ...acc];
  }, [] as HistoryItem[]);
};
