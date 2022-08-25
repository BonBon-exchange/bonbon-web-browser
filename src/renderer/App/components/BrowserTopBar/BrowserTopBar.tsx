/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable import/prefer-default-export */
/* eslint-disable no-use-before-define */
import CloseIcon from '@mui/icons-material/Close';
import CropSquareIcon from '@mui/icons-material/CropSquare';
import MinimizeIcon from '@mui/icons-material/Minimize';
import React from 'react';

import { Unmaximize } from 'renderer/App/components/Unmaximize';

import loadingImg from 'renderer/App/images/loading.svg';

import { BrowserTopBarProps } from './Types';

import './style.scss';

export const BrowserTopBar: React.FC<BrowserTopBarProps> = ({
  closeBrowser,
  toggleFullSizeBrowser,
  minimizeBrowser,
  title,
  favicon,
  onClick,
  isLoading,
  isMaximized,
}) => {
  return (
    <div
      className="BrowserTopBar__container"
      onDoubleClick={toggleFullSizeBrowser}
      onClick={onClick}
    >
      {favicon && (
        <img
          src={isLoading ? loadingImg : favicon}
          width="16"
          height="16"
          className="BrowserTopBar__favicon"
        />
      )}
      <div className="BrowserTopBar__title">{title || ''}</div>
      <div className="BrowserTopBar__controls">
        <div
          className="BrowserTopBar__control-button close-button"
          onClick={closeBrowser}
          data-testid="close-browser"
        >
          <CloseIcon />
        </div>
        <div
          className="BrowserTopBar__control-button"
          onClick={toggleFullSizeBrowser}
          data-testid="toggle-enlarge-browser"
        >
          {isMaximized ? <Unmaximize /> : <CropSquareIcon />}
        </div>
        <div
          className="BrowserTopBar__control-button"
          onClick={minimizeBrowser}
          data-testid="minimize-browser"
        >
          <MinimizeIcon />
        </div>
      </div>
    </div>
  );
};
