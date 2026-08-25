import { createSignal, For } from "solid-js";
import { TimeInput } from "@/components/TimeInput";
// import { Trash2, Clock, Save, TimerReset, CopyX } from "lucide-solid";
import type { TimeRange, TimeRangeManagerProps } from "@/types/types";
import { formatTime } from "@/utils/bilibili"


export const TimeRangeManager = (props: TimeRangeManagerProps) => {
    // 当前正在编辑的时间状态（仅用于新增时段，不直接修改外部列表）
    const defaultTime = () => ({ h: 0, m: 0, s: 0 });
    const [currentId, setCurrentId] = createSignal<string | null>(null);
    const [currentStart, setCurrentStart] = createSignal(defaultTime());
    const [currentEnd, setCurrentEnd] = createSignal(defaultTime());


    // 添加到列表（调用 onUpdate）
    const handleConfirm = () => {
        const newRange: TimeRange = {
            id: currentId() || crypto.randomUUID(),
            start: { ...currentStart() },
            end: { ...currentEnd() },
        };
        let updatedRanges;
        if (currentId()) {
            updatedRanges = props.ranges.map(r => r.id === currentId() ? newRange : r);
        } else {
            updatedRanges = [...props.ranges, newRange];
        }
        props.onUpdate({ opRanges : updatedRanges });
        handleResetInput();
        setCurrentId(null);
    };

    // 删除时间段
    const handleRemove = (id: string) => {
        props.onUpdate({ opRanges: props.ranges.filter((r) => r.id !== id) });
    };

    // 点击列表项：回填数据到编辑框（方便快速修改）
    const handleSelect = (range: TimeRange) => {
        setCurrentId(range.id);
        setCurrentStart({ ...range.start });
        setCurrentEnd({ ...range.end });
    };

    // 重置编辑框
    const handleResetInput = () => {
        setCurrentStart(defaultTime());
        setCurrentEnd(defaultTime());
        setCurrentId(null);
    };

    return (
        <div
            class="card bg-base-100 rounded-box flex flex-col w-full h-full"
        >
            {/* 1. 顶部列表 */}
            <div class="text-center text-lg font-bold text-primary leading-9">
                设置OP跳转时间段
            </div>
            <div class="bg-base-200 p-2 mt-5 flex flex-col gap-1 rounded-box">
                <div class="text-xs font-bold text-base-content/60 mb-1 pl-1">
                    已保存的时段 ({props.ranges.length})
                </div>
                <div class="overflow-y-auto h-48">
                    <For
                        each={props.ranges}
                        fallback={
                            <div class="m-auto text-base-content/30 text-xs">
                                暂无跳过时段
                            </div>
                        }
                    >
                        {(range) => (
                            <div
                                onClick={() => handleSelect(range)}
                                class={`flex justify-between items-center px-2.5 py-1 bg-base-100 border ${range.id == currentId() ? "border-primary " :"border-base-300"} rounded-md cursor-pointer transition-all duration-200 hover:border-primary`}
                            >
                                <span class="text-sm text-base-content/70 font-mono">
                                    {formatTime(range.start)} -{" "}
                                    {formatTime(range.end)}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(range.id);
                                    }}
                                    class="btn btn-ghost btn-xs text-base-content/50"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                        <path d="M0 0h24v24H0z" fill="none" />
                                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21q.512.078 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48 48 0 0 0-3.478-.397m-12 .562q.51-.088 1.022-.165m0 0a48 48 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a52 52 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a49 49 0 0 0-7.5 0" />
                                    </svg>

                                </button>
                            </div>
                        )}
                    </For>
                </div>
            </div>

            {/* 2. 中间编辑区 */}
            <div class="p-3 mt-4 bg-primary/5 flex flex-col gap-2.5 rounded-box">
                <div class="text-xs font-bold text-primary flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0a9 9 0 0 1 18 0" />
                    </svg>
                    设定新时段
                </div>

                <TimeInput
                    label="从"
                    hour={currentStart().h}
                    minute={currentStart().m}
                    second={currentStart().s}
                    onHourChange={(v) =>
                        setCurrentStart({ ...currentStart(), h: v })
                    }
                    onMinuteChange={(v) =>
                        setCurrentStart({ ...currentStart(), m: v })
                    }
                    onSecondChange={(v) =>
                        setCurrentStart({ ...currentStart(), s: v })
                    }
                />

                <TimeInput
                    label="至"
                    hour={currentEnd().h}
                    minute={currentEnd().m}
                    second={currentEnd().s}
                    onHourChange={(v) =>
                        setCurrentEnd({ ...currentEnd(), h: v })
                    }
                    onMinuteChange={(v) =>
                        setCurrentEnd({ ...currentEnd(), m: v })
                    }
                    onSecondChange={(v) =>
                        setCurrentEnd({ ...currentEnd(), s: v })
                    }
                />
            </div>

            {/* 3. 底部操作栏 */}
            <div class="flex justify-around gap-2 mt-8 pb-8">
                <button class="btn btn-soft btn-secondary btn-sm" onClick={handleConfirm}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.3 2.3 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162q0-.338-.1-.661l-2.41-7.839a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
                    </svg>
                     保存
                </button>
                <button class="btn btn-soft btn-accent btn-sm" onClick={handleResetInput}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    重置
                </button>
                <button class="btn btn-soft btn-warning btn-sm" onClick={() => props.onClose()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                        <path d="M0 0h24v24H0z" fill="none" />
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0a9 9 0 0 1 18 0" />
                    </svg>

                    关闭
                </button>
            </div>
        </div>
    );
};
