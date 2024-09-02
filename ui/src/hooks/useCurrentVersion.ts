import { useState, useEffect } from 'react';
import { getVersion } from '@tauri-apps/api/app';
import { NODE_ENV } from '../constants';

export function useCurrentVersion() {
  const [currentVersion, setCurrentVersion] = useState<string>();

  useEffect(() => {
    if (NODE_ENV === 'dev') return;
    getVersion().then(version => {
      setCurrentVersion(version);
    });
  }, []);

  return currentVersion;
}