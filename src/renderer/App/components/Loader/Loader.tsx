/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable import/prefer-default-export */
import loadingImg from 'renderer/App/svg/loading.svg';

import './style.scss';

export const Loader = () => {
  return (
    <div className="Loader__loading">
      <img src={loadingImg} />
    </div>
  );
};
