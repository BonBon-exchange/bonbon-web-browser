/* eslint-disable import/prefer-default-export */

import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useAppDispatch } from 'renderer/App/store/hooks';
import { updateBrowser } from 'renderer/App/store/reducers/Board';
import { PermissionRequestProps } from './Types';

import './style.scss';

export const PermissionRequest: React.FC<PermissionRequestProps> = ({
  url,
  permission,
  browserId,
}: PermissionRequestProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleApprove = () => {
    window.app.browser.permissionResponse({ url, permission, response: true });
    dispatch(
      updateBrowser({ browserId, params: { permissionRequest: undefined } })
    );
  };

  const handleRefuse = () => {
    dispatch(
      updateBrowser({ browserId, params: { permissionRequest: undefined } })
    );
  };

  return (
    <div className="PermissionRequest__container">
      <b>{url}</b> wants permission to access <b>{permission}</b>.
      <div className="PermissionRequest__callback">
        <Button variant="contained" onClick={handleApprove}>
          {t('Approve')}
        </Button>
        <Button color="error" variant="outlined" onClick={handleRefuse}>
          {t('Refuse')}
        </Button>
      </div>
    </div>
  );
};
