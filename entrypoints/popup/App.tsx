// entrypoints/popup/App.tsx
import {  Show, For, createSignal, Switch, Match, onSettled } from "solid-js";
import { TimeInput } from "@/components/TimeInput";
import { HistoryList } from "@/components/HistoryList";
import { TimeRangeManager } from "@/components/TimeRangeList";
import { browser } from "wxt/browser";
// import { Settings, Clock, Save, RotateCcw } from "lucide-solid";

import { getSoftName, LATEST_HISTORY_LENGTH, PINNED_HISTORY_LENGTH } from "@/utils/bilibili";
import type { HistoryConfig } from "@/types/types";
import { useStorageConfig } from "@/hooks/useStorageConfig";


export default function App() {
    const {
        config,
        updateConfig,
        initFromStorage,
    } = useStorageConfig();

    const [showTimeManager, setShowTimeManager] = createSignal(false);
    const [latestHistory, setLatestHistory] = createSignal<HistoryConfig[]>([]);
    const [pinnedHistory, setPinnedHistory] = createSignal<HistoryConfig[]>([]);

    /**
     * 保存模式切换
     */

    const saveMode = async (newMode: "frame" | "manual") => {
        updateConfig({ mode: newMode });
    };

    /**
     * 应用配置：将当前所有状态写入 Storage 并广播给 Content Script
     */
    const applyConfig = async () => {
        const zero = { h: 0, m: 0, s: 0 };
        if (config.mode === "frame") {
            updateConfig({ frameConfig : zero});
        } else {
            updateConfig({ jumpConfig: zero });
        }
    };

    /**
     * 存档逻辑：将当前配置存入历史记录
     */
    const handleArchive = async () => {
        const activeTab = await getActiveTab();
      
        // 2. 校验逻辑依然保持，但代码更整洁
        if (!activeTab?.id) return;

        // 3. 发送存档请求
        const response = await browser.runtime.sendMessage({
            type: "DO_ARCHIVE",
            data: {
                // 这里利用 getActiveTab 返回的对象
                tab: {
                    id: activeTab.id,
                    title: activeTab.title,
                    url: activeTab.url,
                },
                config: {
                    mode: config.mode,
                    opRanges: config.opRanges,
                    frameConfig: config.frameConfig,
                    jumpConfig: config.jumpConfig,
                },
            },
        });

        if (response?.pinnedHistory) {
            setPinnedHistory(response.pinnedHistory);
        }
    };

    /**
     * 打开配置页
     */
    const openOptions = () => {
        browser.tabs.create({ url: browser.runtime.getURL("/options.html") });
    };

    onSettled(()=> {



        (async () => {
            await initFromStorage();
            const res = await browser.storage.local.get([
                "latestHistory",
                "pinnedHistory",
            ]);
            if (Array.isArray(res.latestHistory))
                setLatestHistory(res.latestHistory.slice(0, 2) as HistoryConfig[]);
            if (Array.isArray(res.pinnedHistory))
                setPinnedHistory(res.pinnedHistory.slice(0, 3) as HistoryConfig[]);
        })()
    });

    return (
        <div class="card bg-base-100 shadow-xl rounded-box p-4 w-72 gap-3">
            <Show when={!showTimeManager()}>
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1 font-bold">
                        <h1 class="flex flex-1 text-lg align-center">
                            {getSoftName()}
                        </h1>
                        <span
                            class={`badge badge-xs mr-6 ${
                                config.isPageReady ? "badge-success" : "badge-ghost"
                            }`}
                        >
                            {config.isPageReady ? "已就绪" : "未启动"}
                        </span>
                    </div>

                    <button
                        class=" btn btn-outline btn-primary btn-xs"
                        onClick={openOptions}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                        </svg>
                        查看
                    </button>
                </div>

                <div class="divider m-0">设置多OP跳转</div>
                <button
                    class="btn btn-dash btn-warning btn-sm btn-block"
                    onClick={[setShowTimeManager, true]}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0" />
                    </svg>
                    管理多个跳过时间段
                </button>

                <div class="divider m-0">设置视频集合跳转</div>

                <div class="flex gap-3 justify-center">
                    <For each={["frame", "manual"] as const}>
                        {(m) => (
                            <label
                                class={`flex items-center gap-1 cursor-pointer ${
                                    config.mode === m ? "text-secondary" : ""
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="mode"
                                    class="radio radio-xs radio-secondary"
                                    checked={config.mode === m}
                                    onChange={() => saveMode(m)}
                                />
                                {m === "frame" ? "帧分析" : "手动切集"}
                            </label>
                        )}
                    </For>
                </div>
                <div class="flex flex-col gap-2.5">
                    <Switch>
                        <Match when={config.mode === "frame"}>
                            <TimeInput
                                label="帧"
                                hour={config.frameConfig.h}
                                minute={config.frameConfig.m}
                                second={config.frameConfig.s}
                                // 必须通过展开运算符更新特定字段
                                onHourChange={(val) =>
                                    updateConfig({
                                        frameConfig: {
                                            ...config.frameConfig,  // 保留旧的 m 和 s
                                            h: val                  // 覆盖 h
                                        }
                                    })
                                    
                                }
                                onMinuteChange={(val) =>
                                    updateConfig({
                                        frameConfig: {
                                            ...config.frameConfig,  // 保留旧的 m 和 s
                                            m: val                  // 覆盖 h
                                        }
                                    })
                                }
                                onSecondChange={(val) =>
                                    updateConfig({
                                        frameConfig: {
                                            ...config.frameConfig,  // 保留旧的 m 和 s
                                            s: val                  // 覆盖 h
                                        }
                                    })
                                }
                            />
                        </Match>
                        <Match when={config.mode === "manual"}>
                            <TimeInput
                                label="切"
                                hour={config.jumpConfig.h}
                                minute={config.jumpConfig.m}
                                second={config.jumpConfig.s}
                                onHourChange={(val) =>
                                    updateConfig({
                                        jumpConfig: {
                                            ...config.jumpConfig,  // 保留旧的 m 和 s
                                            h: val                  // 覆盖 h
                                        }
                                    })
                                }
                                onMinuteChange={(val) =>
                                updateConfig({
                                    jumpConfig: {
                                        ...config.jumpConfig,  // 保留旧的 m 和 s
                                        m: val                  // 覆盖 h
                                    }
                                })
                                }
                                onSecondChange={(val) =>
                                updateConfig({
                                    jumpConfig: {
                                        ...config.jumpConfig,  // 保留旧的 m 和 s
                                        s: val                  // 覆盖 h
                                    }
                                })
                                }
                            />
                        </Match>
                    </Switch>
                </div>

                <button
                    class="btn btn-warning btn-sm w-full"
                    onClick={applyConfig}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
 重置
                </button>
                    
                <HistoryList
                    items={latestHistory()}
                    maxLength={LATEST_HISTORY_LENGTH}
                    isPinned={false}
                />
                <button
                    class="btn btn-primary btn-sm w-full"
                    onClick={handleArchive}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.3 2.3 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162q0-.338-.1-.661l-2.41-7.839a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                    </svg>

                     手动存档
                </button>
                <HistoryList
                    items={pinnedHistory()}
                    maxLength={PINNED_HISTORY_LENGTH}
                    isPinned={true}
                />

            </Show>
            
            <Show when={showTimeManager()}>
                <TimeRangeManager
                    ranges={config.opRanges}
                    onUpdate={updateConfig}
                    onClose={() => setShowTimeManager(false)}
                />
            </Show>
        </div>
    );
}
