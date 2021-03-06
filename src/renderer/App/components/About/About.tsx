/* eslint-disable import/prefer-default-export */
import { useTranslation } from 'react-i18next';

import './style.scss';

export const About: React.FC = () => {
  const { t } = useTranslation();
  const appVersion = localStorage.getItem('appVersion');
  return (
    <>
      <div className="About__property-line">
        <span className="About__property">{t('App version')}:</span>{' '}
        {appVersion}
      </div>
      <div className="About__property-line">
        <span className="About__property">{t('Author')}:</span> Daniel Febrero
      </div>
      <div className="About__property-line">
        <span className="About__property">{t('Team')}:</span> Daniel Febrero,
        Anthony Cettour, Braian Eric Dickson, 0xCUBE, Nuklusone, Howard Huang,
        Faouzi Benali
      </div>
      <div className="About__property-line">
        <span className="About__property">{t('Past collaborators')}:</span>{' '}
        Aitor
      </div>
    </>
  );
};
