/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable import/prefer-default-export */
import { useState, ReactElement } from 'react';

import { CloseButton } from 'renderer/App/components/CloseButton';
import { ApplicationSettings } from './ApplicationSettings';
import { BrowsingSettings } from './BrowsingSettings';

import './style.scss';
import { SettingsProps } from './Types';

export const Settings: React.FC<SettingsProps> = ({
  handleClose,
}: SettingsProps) => {
  const [selectedView, setSelectedView] = useState<ReactElement>(
    <ApplicationSettings />
  );

  return (
    <div id="Settings__container">
      <CloseButton handleClose={handleClose} />
      <div id="Settings__left-panel">
        <h2>Settings</h2>
        <ul>
          <li onClick={() => setSelectedView(<ApplicationSettings />)}>
            Application
          </li>
          <li onClick={() => setSelectedView(<BrowsingSettings />)}>
            Browsing
          </li>
        </ul>
      </div>
      <div id="Settings__right-panel">{selectedView}</div>
    </div>
  );
};