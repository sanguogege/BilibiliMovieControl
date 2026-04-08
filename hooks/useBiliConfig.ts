// hooks/useBiliConfig.ts
import { createSignal } from 'solid-js';
import { browser } from 'wxt/browser';
import type { VideoConfig, HistoryItem } from '../assets/types';

export function useBiliConfig() {
    // --- 1. 基础配置信号 (UI 绑定用) ---
    const [sH, setSH] = createSignal(0);
    const [sM, setSM] = createSignal(0);
    const [sS, setSS] = createSignal(0);

    const [mH, setMH] = createSignal(0);
    const [mM, setMM] = createSignal(0);
    const [mS, setMS] = createSignal(0);

    const [eH, setEH] = createSignal(0);
    const [eM, setEM] = createSignal(0);
    const [eS, setES] = createSignal(0);

    // --- 2. 列表信号 ---
    const [latestHistory, setLatestHistory] = createSignal<HistoryItem[]>([]);
    const [pinnedHistory, setPinnedHistory] = createSignal<HistoryItem[]>([]);

    // --- 3. 辅助方法：获取当前 UI 状态对应的配置对象 ---
    const getCurrentConfig = (): VideoConfig => ({
        sH: sH(), sM: sM(), sS: sS(),
        mH: mH(), mM: mM(), mS: mS(),
        eH: eH(), eM: eM(), eS: eS(),
    });

    // --- 4. 初始化：从存储中恢复数据 ---
    const initFromStorage = async () => {
        const res = await browser.storage.local.get([
            'sH', 'sM', 'sS', 'mH', 'mM', 'mS', 'eH', 'eM', 'eS',
            'latestHistory', 'pinnedHistory',
        ]);

        // 填充时间输入框
        setSH(Number(res.sH) || 0); setSM(Number(res.sM) || 0); setSS(Number(res.sS) || 0);
        setMH(Number(res.mH) || 0); setMM(Number(res.mM) || 0); setMS(Number(res.mS) || 0);
        setEH(Number(res.eH) || 0); setEM(Number(res.eM) || 0); setES(Number(res.eS) || 0);

        // 填充历史记录列表
        if (res.latestHistory) setLatestHistory(res.latestHistory as HistoryItem[]);
        if (res.pinnedHistory) setPinnedHistory(res.pinnedHistory as HistoryItem[]);
    };

    // --- 5. 重置配置 ---
    const resetConfig = async () => {
        const zeroConfig = { sH: 0, sM: 0, sS: 0, mH: 0, mM: 0, mS: 0, eH: 0, eM: 0, eS: 0 };
        // 重置信号
        setSH(0); setSM(0); setSS(0);
        setMH(0); setMM(0); setMS(0);
        setEH(0); setEM(0); setES(0);
        // 同步到存储
        await browser.storage.local.set({ ...zeroConfig});
    };

    // --- 6. 加载记录（从历史/存档恢复设置并跳转） ---
    const loadHistory = async (item: HistoryItem) => {
        const cfg = item.config;
        // 1. 同步到 Storage
        await browser.storage.local.set({
            sH: cfg.sH, sM: cfg.sM, sS: cfg.sS,
            mH: cfg.mH, mM: cfg.mM, mS: cfg.mS,
            eH: cfg.eH, eM: cfg.eM, eS: cfg.eS,
        });
        // 2. 更新 UI 信号
        setSH(cfg.sH); setSM(cfg.sM); setSS(cfg.sS);
        setMH(cfg.mH); setMM(cfg.mM); setMS(cfg.mS);
        setEH(cfg.eH); setEM(cfg.eM); setES(cfg.eS);
        // 3. 执行跳转
        await browser.tabs.update({ url: item.url });
    };

    // --- 7. 应用并存档 (核心：调用后台逻辑) ---
    const applyAndArchive = async () => {
        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        const currentConfig = getCurrentConfig();

        // A. 先保存基础配置（供 Content Script 读取）
        await browser.storage.local.set({ ...currentConfig });

        if (activeTab?.id) {
            // B. 发送消息给 Background 执行“抓取标题+存档”的重活
            const response = await browser.runtime.sendMessage({
                type: 'DO_ARCHIVE',
                data: { tab: activeTab, config: currentConfig }
            });

            // C. 如果后台返回了更新后的存档列表，更新 UI
            if (response?.pinnedHistory) {
                setPinnedHistory(response.pinnedHistory);
            }

            // D. 通知 Content Script 立即更新当前播放器的跳过参数
            await browser.tabs.sendMessage(activeTab.id, {
                type: 'UPDATE_CONFIG',
                skipStart: currentConfig.sH * 3600 + currentConfig.sM * 60 + currentConfig.sS,
                skipEnd: currentConfig.mH * 3600 + currentConfig.mM * 60 + currentConfig.mS,
                jumpEnd: currentConfig.eH * 3600 + currentConfig.eM * 60 + currentConfig.eS,
            });
        }

        // 操作完成，关闭 Popup
        window.close();
    };

    return {
        // 配置信号
        sH, setSH, sM, setSM, sS, setSS,
        mH, setMH, mM, setMM, mS, setMS,
        eH, setEH, eM, setEM, eS, setES,
        // 列表信号
        latestHistory, setLatestHistory,
        pinnedHistory, setPinnedHistory,
        // 操作方法
        initFromStorage,
        resetConfig,
        loadHistory,
        applyAndArchive,
        getCurrentConfig,
    };
}