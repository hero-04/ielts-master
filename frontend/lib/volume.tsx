"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface VolumeContextValue {
  volume: number;
  setVolume: (v: number) => void;
}

const VolumeContext = createContext<VolumeContextValue>({
  volume: 100,
  setVolume: () => {},
});

export function VolumeProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolumeState] = useState(100);

  useEffect(() => {
    const stored = localStorage.getItem("volume");
    if (stored !== null) setVolumeState(Number(stored));
  }, []);

  const setVolume = (v: number) => {
    setVolumeState(v);
    localStorage.setItem("volume", String(v));
  };

  return (
    <VolumeContext.Provider value={{ volume, setVolume }}>
      {children}
    </VolumeContext.Provider>
  );
}

export const useVolume = () => useContext(VolumeContext);
