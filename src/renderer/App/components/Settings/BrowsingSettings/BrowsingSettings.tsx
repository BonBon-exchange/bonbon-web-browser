/* eslint-disable promise/always-return */
/* eslint-disable promise/catch-or-return */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/prefer-default-export */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import './style.scss';

export const BrowsingSettings = () => {
  const { t } = useTranslation();
  const [browsingSettingDefaultWebpage, setBrowsingSettingDefaultWebpage] =
    useState<string | undefined>('');

  const [
    browsingSettingDefaultSearchEngine,
    setBrowsingSettingDefaultSearchEngine,
  ] = useState<string | undefined>('');

  const [browsingSettingDefaultWidth, setBrowsingSettingDefaultWidth] =
    useState<number | undefined>(0);

  const [browsingSettingDefaultHeight, setBrowsingSettingDefaultHeight] =
    useState<number | undefined>(0);

  const [browsingSettingDefaultSize, setBrowsingSettingDefaultSize] = useState<
    string | undefined
  >();

  const [browsingSettingDontSaveHistory, setBrowsingSettingDontSaveHistory] =
    useState<boolean | undefined>(false);

  const [browsingSettingTopEdge, setBrowsingSettingTopEdge] = useState<
    string | undefined
  >();

  const searchEngines = [
    'Google',
    'Presearch',
    'Qwant',
    'DuckDuckGo',
    'Yandex',
    'Swisscows',
    'Ecosia',
    'StartPage',
  ];

  const updateBrowsingSettingWebpage = (value: string) => {
    setBrowsingSettingDefaultWebpage(value);
    window.app.config.set({
      key: 'browsing.defaultWebpage',
      value,
    });
  };

  const updateBrowsingSettingSearchEngine = (value: string) => {
    setBrowsingSettingDefaultSearchEngine(value);
    window.app.config.set({
      key: 'browsing.searchEngine',
      value,
    });
  };

  const updateBrowsingSettingWidth = (value: number) => {
    setBrowsingSettingDefaultWidth(value);
    window.app.config.set({
      key: 'browsing.width',
      value,
    });
  };

  const updateBrowsingSettingHeight = (value: number) => {
    setBrowsingSettingDefaultHeight(value);
    window.app.config.set({
      key: 'browsing.height',
      value,
    });
  };

  const updateBrowsingSettingSize = (value: string) => {
    setBrowsingSettingDefaultSize(value);
    window.app.config.set({
      key: 'browsing.size',
      value,
    });
  };

  const updateBrowsingSettingDontSaveHistory = (value: boolean) => {
    setBrowsingSettingDontSaveHistory(value);
    window.app.config.set({
      key: 'browsing.dontSaveHistory',
      value,
    });
  };

  const updateBrowsingSettingTopEdge = (value: string) => {
    setBrowsingSettingTopEdge(value);
    window.app.config.set({
      key: 'browsing.topEdge',
      value,
    });
  };

  useEffect(() => {
    window.app.config.get('browsing.defaultWebpage').then((val: unknown) => {
      const typedVal = val as string | undefined;
      setBrowsingSettingDefaultWebpage(typedVal);
    });

    window.app.config.get('browsing.searchEngine').then((val: unknown) => {
      const typedVal = val as string | undefined;
      setBrowsingSettingDefaultSearchEngine(typedVal);
    });

    window.app.config.get('browsing.width').then((val: unknown) => {
      const typedVal = val as number | undefined;
      setBrowsingSettingDefaultWidth(typedVal);
    });

    window.app.config.get('browsing.height').then((val: unknown) => {
      const typedVal = val as number | undefined;
      setBrowsingSettingDefaultHeight(typedVal);
    });

    window.app.config.get('browsing.size').then((val: unknown) => {
      const typedVal = val as string | undefined;
      setBrowsingSettingDefaultSize(typedVal);
    });

    window.app.config.get('browsing.dontSaveHistory').then((val: unknown) => {
      const typedVal = val as boolean | undefined;
      setBrowsingSettingDontSaveHistory(typedVal);
    });

    window.app.config.get('browsing.topEdge').then((val: unknown) => {
      const typedVal = val as string | undefined;
      setBrowsingSettingTopEdge(typedVal);
    });

    window.app.analytics.page('/settings/browsing');
  }, []);

  return (
    <>
      <h2>{t('Browsing')}</h2>
      <div className="Settings__item" data-testid="settings-browsing-page">
        <label htmlFor="browsing-settings-default-webpage">
          {t('New windows default webpage')}:
        </label>
        <input
          type="text"
          id="browsing-settings-default-webpage"
          value={browsingSettingDefaultWebpage}
          onChange={(e) => updateBrowsingSettingWebpage(e.target.value)}
        />
        <div className="Settings__item-description">
          {t('The url that will open first when opening a new window.')}
        </div>
      </div>
      <div className="Settings__item">
        <label htmlFor="browsing-settings-default-search-engine">
          {t('Default search engine')}:
        </label>
        <select
          id="browsing-settings-default-search-engine"
          onChange={(e) => updateBrowsingSettingSearchEngine(e.target.value)}
          value={browsingSettingDefaultSearchEngine}
        >
          {searchEngines.map((se) => {
            return (
              <option
                value={se.toLocaleLowerCase()}
                key={se.toLocaleLowerCase()}
              >
                {se}
              </option>
            );
          })}
        </select>
        <div className="Settings__item-description">
          {t(
            'The search engine that will be used when entering text in the url input and pressing enter.'
          )}
        </div>
      </div>
      <div className="Settings__item">
        <div className="Settings__item-title">
          {t('New webpages default size')}
        </div>
        <input
          type="radio"
          value="defined"
          checked={browsingSettingDefaultSize === 'defined'}
          name="browsing-settings-default-size"
          onChange={(e) => updateBrowsingSettingSize(e.target.value)}
          id="browsing-settings-default-size-defined"
        />
        <label htmlFor="browsing-settings-default-size-defined">
          {t('As defined here')}:
        </label>
        <input
          type="number"
          id="browsing-settings-default-width"
          value={browsingSettingDefaultWidth}
          onChange={(e) => updateBrowsingSettingWidth(Number(e.target.value))}
        />
        x
        <input
          type="number"
          id="browsing-settings-default-height"
          value={browsingSettingDefaultHeight}
          onChange={(e) => updateBrowsingSettingHeight(Number(e.target.value))}
        />
        <br />
        <input
          type="radio"
          value="lastClosed"
          checked={browsingSettingDefaultSize === 'lastClosed'}
          onChange={(e) => updateBrowsingSettingSize(e.target.value)}
          name="browsing-settings-default-size"
          id="browsing-settings-default-size-last-closed"
        />
        <label htmlFor="browsing-settings-default-size-last-closed">
          {t('Use the size of the last closed webpage')}
        </label>
        <br />
        <input
          type="radio"
          value="lastResized"
          checked={browsingSettingDefaultSize === 'lastResized'}
          onChange={(e) => updateBrowsingSettingSize(e.target.value)}
          name="browsing-settings-default-size"
          id="browsing-settings-default-size-last-resized"
        />
        <label htmlFor="browsing-settings-default-size-last-resized">
          {t('Use the size of the last resized window')}
        </label>
        <div className="Settings__item-description">
          {t('The size of opening new windows when they are not maximized.')}
        </div>
      </div>
      <div className="Settings__item">
        <input
          type="checkbox"
          id="browsing-settings-dont-save-history"
          checked={browsingSettingDontSaveHistory}
          onChange={(e) =>
            updateBrowsingSettingDontSaveHistory(e.target.checked)
          }
        />
        <label htmlFor="browsing-settings-dont-save-history">
          {t('Do not save browsing history')}
        </label>
        <div className="Settings__item-description">
          {t(
            'If checked, BonBon will not save your browsing history. It will also disable URL suggestions.'
          )}
        </div>
      </div>
      <div className="Settings__item">
        <div className="Settings__item-title">
          {t('When dragging a window to the top edge')}:
        </div>
        <input
          type="radio"
          value="maximize"
          checked={browsingSettingTopEdge === 'maximize'}
          name="browsing-settings-top-edge"
          onChange={(e) => updateBrowsingSettingTopEdge(e.target.value)}
          id="browsing-settings-top-edge-maximize"
        />
        <label htmlFor="browsing-settings-top-edge-maximize">
          {t('Maximize')}
        </label>
        <br />
        <input
          type="radio"
          value="fit"
          checked={browsingSettingTopEdge === 'fit'}
          onChange={(e) => updateBrowsingSettingTopEdge(e.target.value)}
          name="browsing-settings-top-edge"
          id="browsing-settings-top-edge-fit"
        />
        <label htmlFor="browsing-settings-top-edge-fit">
          {t('Fit the screen')}
        </label>
        <div className="Settings__item-description">
          {t(
            'Maximize the window or enlarge the window when dragging it to the top edge.'
          )}
        </div>
      </div>
    </>
  );
};
