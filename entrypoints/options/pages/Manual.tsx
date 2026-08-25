// entrypoints/options/pages/History.tsx
import { createSignal, For, onSettled, Show } from "solid-js";
import { browser } from "wxt/browser";

import { MAX_HISTORY_LENGTH ,PINNED_HISTORY_LENGTH} from "@/utils/bilibili";

// 定义和 Background/Popup 一致的接口
import type { HistoryConfig } from "@/types/types";

export default function HistoryPage() {
    const [pinnedHistory, setPinnedHistory] = createSignal<HistoryConfig[]>([]);

    // 初始化加载
    onSettled(() => {
        (async () => {
            const res = await browser.storage.local.get({ pinnedHistory: [] });
            setPinnedHistory(res.pinnedHistory as HistoryConfig[]);
        })()
    });

    // 删除单条
    const deleteItem = async (url: string) => {
        const updated = pinnedHistory().filter((item) => item.url !== url);
        setPinnedHistory(updated);
        await browser.storage.local.set({ pinnedHistory: updated });
    };

    // 清空所有
    const clearAll = async () => {
        if (confirm("确定要清空所有手动历史记录吗？")) {
            setPinnedHistory([]);
            await browser.storage.local.set({ pinnedHistory: [] });
        }
    };

    return (
        <div class="max-w-4xl mx-auto">
            <header class="flex justify-between items-center mb-10">
                <div>
                    <h1 class="text-3xl  mb-3 text-primary flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5m0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25m9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25" />
                        </svg>
                        手动存档管理
                    </h1>
                    <p class="text-base-content/70 text-base leading-relaxed">
                        用户手动存档的视频，凡是存档的视频都是符合状态设置的。
                    </p>
                </div>
                <Show when={pinnedHistory().length > 0}>
                    <button
                        onClick={clearAll}
                        class="btn btn-outline btn-error btn-sm"
                    >
                        清空记录
                    </button>
                </Show>
            </header>

            {/* 列表容器 */}
            <div class="flex flex-col gap-4">
                <For each={pinnedHistory()}>
                    {(item) => (
                        <div class="bg-base-100 p-5 rounded-xl flex justify-between items-center shadow-sm border border-base-300">
                            <div class="flex-1">
                                <div class="font-bold text-base mb-2 text-base-content">
                                    {item.title}
                                </div>
                                <div class="flex gap-5 text-sm text-base-content/70">
                                    <span>
                                        ⏱️ 跳过: {item.frameConfig.m}分
                                        {item.frameConfig.s}秒 -{" "}
                                        {item.frameConfig.m}分
                                        {item.frameConfig.s}秒
                                    </span>
                                    <span>
                                        📅 记录于:{" "}
                                        {new Date(item.time).toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            <div class="flex gap-3 ml-5">
                                <a
                                    href={item.url}
                                    target="_blank"
                                    class="btn btn-primary btn-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                    </svg>

                                     回看
                                </a>
                                <button
                                    onClick={() => deleteItem(item.url)}
                                    class="btn btn-ghost btn-sm text-base-content/50"
                                    title="删除此条记录"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21q.512.078 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48 48 0 0 0-3.478-.397m-12 .562q.51-.088 1.022-.165m0 0a48 48 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a52 52 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49 49 0 0 0-7.5 0" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </For>

                {/* 空状态 */}
                <Show when={pinnedHistory().length === 0}>
                    <div class="text-center py-20 bg-base-100 rounded-2xl border-2 border-dashed border-base-300">
                        <div class="text-4xl mb-4">📄</div>
                        <p class="text-base-content/50 m-0">
                            暂无手动记录，快去观看合集视频吧
                        </p>
                    </div>
                </Show>
            </div>

            {/* 底部提示 */}
            <div class="mt-8 p-4 bg-info/10 border border-info/20 rounded-xl flex gap-2.5 items-start">
                <p class="m-0 text-xs text-base-content/70 leading-relaxed">
                    <b>关于手动存档：</b>
                    用户可以在视频播放过程中点击插件图标，选择“手动存档”来保存当前的跳过配置和视频信息，以便下次直接使用。
                    Options 页面会保留最近的 {MAX_HISTORY_LENGTH} 条记录。
                    但popup页面只会显示最新的 {PINNED_HISTORY_LENGTH} 条记录
                </p>
            </div>
        </div>
    );
}
