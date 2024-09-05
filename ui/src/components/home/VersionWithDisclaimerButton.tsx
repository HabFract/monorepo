import React, { FC } from 'react';
import { Button } from 'habit-fract-design-system';
import { AlertOutlined } from '@ant-design/icons';
import { NODE_ENV } from '../../constants';
import { isSmallScreen } from '../vis/helpers';

interface VersionDisclaimerProps {
  currentVersion: string | undefined;
  open: () => void;
  isFrontPage?: boolean;
}

const VersionDisclaimer: FC<VersionDisclaimerProps> = ({ currentVersion, open, isFrontPage }) => {
  return (
    <div className={isFrontPage ? "app-version-disclaimer z-50 flex gap-2 fixed right-1 top-1" : "app-version-disclaimer z-60 flex gap-2 fixed right-1 bottom-1"}>
      {NODE_ENV !== 'dev' && <div className='version-number'>v{currentVersion}</div>}
      <Button type={"secondary"} onClick={open}>{isSmallScreen() ? <AlertOutlined className="text-bg" /> : "Disclaimer"}</Button>
    </div>
  );
};

export default VersionDisclaimer;