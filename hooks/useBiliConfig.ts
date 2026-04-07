import { createSignal, onMount } from 'solid-js';
import { browser } from 'wxt/browser';
import type { VideoConfig, HistoryItem } from '../assets/types';
import { getBiliCollection, formatTitle } from '../utils/bili';

export function useBiliConfig() {
    // 配置信号
    const [sH, setSH] = createSignal(0);
    const [sM, setSM] = createSignal(0);
    const [sS, setSS] = createSignal(0);
    const [mH, setMH] = createSignal(0);
    const [mM, setMM] = createSignal(0);
    const [mS, setMS] = createSignal(0);
    const [eH, setEH] = createSignal(0);
    const [eM, setEM] = createSignal(0);
    const [eS, setES] = createSignal(0);

    // 历史记录信号
    const [latestHistory, setLatestHistory] = createSignal<HistoryItem[]>([]);
    const [pinnedHistory, setPinnedHistory] = createSignal<HistoryItem[]>([]);

    // 获取当前配置对象
    const getCurrentConfig = (): VideoConfig => ({
        sH: sH(),
        sM: sM(),
        sS: sS(),
        mH: mH(),
        mM: mM(),
        mS: mS(),
        eH: eH(),
        eM: eM(),
        eS: eS(),
    });

    // 保存配置到 storage 并更新信号（可选）
    const saveConfigToStorage = async (config: VideoConfig) => {
        await browser.storage.local.set({
            sH: config.sH, sM: config.sM, sS: config.sS,
            mH: config.mH, mM: config.mM, mS: config.mS,
            eH: config.eH, eM: config.eM, eS: config.eS,
        });
    };

    // 重置所有配置
    const resetConfig = async () => {
        setSH(0); setSM(0); setSS(0);
        setMH(0); setMM(0); setMS(0);
        setEH(0); setEM(0); setES(0);
        await saveConfigToStorage(getCurrentConfig());
        await browser.storage.local.set({ isActive: false });
    };

    // 加载历史记录（应用配置并跳转）
    const loadHistory = async (item: HistoryItem) => {
        // 保存配置到 storage
        await browser.storage.local.set({
            sH: item.config.sH, sM: item.config.sM, sS: item.config.sS,
            mH: item.config.mH, mM: item.config.mM, mS: item.config.mS,
            eH: item.config.eH, eM: item.config.eM, eS: item.config.eS,
            isActive: true,
        });
        // 更新 UI 信号
        setSH(item.config.sH); setSM(item.config.sM); setSS(item.config.sS);
        setMH(item.config.mH); setMM(item.config.mM); setMS(item.config.mS);
        setEH(item.config.eH); setEM(item.config.eM); setES(item.config.eS);
        // 跳转到该 URL
        await browser.tabs.update({ url: item.url });
    };

    // 初始化：从 storage 读取数据
    const initFromStorage = async () => {
        const res = await browser.storage.local.get([
            'sH', 'sM', 'sS', 'mH', 'mM', 'mS', 'eH', 'eM', 'eS',
            'latestHistory', 'pinnedHistory',
        ]);
        setSH(Number(res.sH) || 0);
        setSM(Number(res.sM) || 0);
        setSS(Number(res.sS) || 0);
        setMH(Number(res.mH) || 0);
        setMM(Number(res.mM) || 0);
        setMS(Number(res.mS) || 0);
        setEH(Number(res.eH) || 0);
        setEM(Number(res.eM) || 0);
        setES(Number(res.eS) || 0);
        if (res.latestHistory) setLatestHistory(res.latestHistory as HistoryItem[]);
        if (res.pinnedHistory) setPinnedHistory(res.pinnedHistory as HistoryItem[]);
    };

    // 应用配置并发送到 content script，同时手动存档
    const applyAndArchive = async () => {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        const currentConfig = getCurrentConfig();
        await saveConfigToStorage(currentConfig);
        await browser.storage.local.set({ isActive: true });

        if (activeTab?.id) {
            const colTitle = await getBiliCollection(activeTab.id);
            if (colTitle) {
                const newItem: HistoryItem = {
                    title: formatTitle(colTitle, activeTab.title || ''),
                    url: activeTab.url || '',
                    time: Date.now(),
                    config: currentConfig,
                };
                const newPinned = [newItem, ...pinnedHistory().filter(h => h.url !== newItem.url)].slice(0, 5);
                setPinnedHistory(newPinned);
                await browser.storage.local.set({ pinnedHistory: newPinned });
            }

            await browser.tabs.sendMessage(activeTab.id, {
                type: 'UPDATE_CONFIG',
                skipStart: currentConfig.sH * 3600 + currentConfig.sM * 60 + currentConfig.sS,
                skipEnd: currentConfig.mH * 3600 + currentConfig.mM * 60 + currentConfig.mS,
                jumpEnd: currentConfig.eH * 3600 + currentConfig.eM * 60 + currentConfig.eS,
                isActive: true,
            });
        }
        window.close();
    };

    return {
        // 配置信号
        sH, setSH, sM, setSM, sS, setSS,
        mH, setMH, mM, setMM, mS, setMS,
        eH, setEH, eM, setEM, eS, setES,
        // 历史记录
        latestHistory, setLatestHistory,
        pinnedHistory, setPinnedHistory,
        // 方法
        initFromStorage,
        resetConfig,
        loadHistory,
        applyAndArchive,
        getCurrentConfig,
    };
}