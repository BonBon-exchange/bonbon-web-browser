/* eslint-disable promise/catch-or-return */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/prefer-default-export */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const ExtensionsSettings: React.FC = () => {
  const { t } = useTranslation();
  const [extForceUBlock, setForceUBlock] = useState<boolean>(false);

  const udpateSetForceUBlock = (value: boolean) => {
    setForceUBlock(value);
    window.app.config.set({
      key: 'extensions.forceInstallUBlockOrigin',
      value,
    });
  };

  useEffect(() => {
    window.app.config
      .get('extensions.forceInstallUBlockOrigin')
      .then((val: unknown) => setForceUBlock(Boolean(val)));
  }, []);

  return (
    <>
      <h2>{t('Extensions')}</h2>
      <div className="Settings__item">
        <input
          type="checkbox"
          id="extensions-force-install-u-block"
          checked={extForceUBlock}
          onChange={(e) => udpateSetForceUBlock(e.target.checked)}
        />
        <label htmlFor="extensions-force-install-u-block">
          {t('Force uBlockOrigin installation at startup')}
        </label>
        <div className="Settings__item-description">
          {t(
            'If checked, the app will automatically download uBlockOrigin and install it when starting.'
          )}
        </div>
      </div>
    </>
  );
};
