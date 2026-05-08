
"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { setGlobalStorageBaseUrl } from '@/lib/image-utils';

interface StorageConfig {
  baseUrl: string;
}

const SystemConfigContext = createContext({});

export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  const { data: storageSettings } = useLocalDoc<StorageConfig>('settings', 'storage');

  useEffect(() => {
    if (storageSettings?.baseUrl) {
      console.log("[SystemConfig] Setting Storage Base URL to:", storageSettings.baseUrl);
      setGlobalStorageBaseUrl(storageSettings.baseUrl);
    }
  }, [storageSettings]);

  return (
    <SystemConfigContext.Provider value={{}}>
      {children}
    </SystemConfigContext.Provider>
  );
}
