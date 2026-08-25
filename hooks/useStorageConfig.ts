import { createStore } from "solid-js";
import { browser } from "wxt/browser";

import type { BiliVideoConfig } from "@/types/types";


const INITIAL_CONFIG: BiliVideoConfig = {
    opRanges: [],
    frameConfig: { h: 0, m: 0, s: 0 },
    jumpConfig: { h: 0, m: 0, s: 0 },
    mode: "manual" as const,
    isAutoHandle: true,
    isPageReady: false,
};

export const STORAGE_KEYS = Object.keys(
    INITIAL_CONFIG,
) as (keyof BiliVideoConfig)[];

export const useStorageConfig = () => {

    const [config, setConfig] = createStore<BiliVideoConfig>(INITIAL_CONFIG);

     const initFromStorage = async () => {
         const res = await browser.storage.local.get(STORAGE_KEYS);
        setConfig((prev) => ({ ...prev, ...(res as Partial<BiliVideoConfig>) } as BiliVideoConfig));
     };
 
      const updateConfig = async (data: Partial<BiliVideoConfig>) => {
          // 合并更新
          setConfig((prev) => ({ ...prev, ...(data as Partial<BiliVideoConfig>) } as BiliVideoConfig));
          await browser.storage.local.set(data);
      };

     return {
         config,
         setConfig,
         initFromStorage,
         updateConfig,
     };
};
