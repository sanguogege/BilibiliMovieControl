import { createSignal, flush, onSettled } from "solid-js";
// import { Info, LayoutDashboard } from "lucide-solid";
import { browser } from "wxt/browser";

export default function Home() {
    const [status, setStatus] = createSignal<boolean>(true);

    onSettled(() => {
        (async () => {
            const res = await browser.storage.local.get({ isAutoHandle: true });
            setStatus(res.isAutoHandle as boolean);
        })()
    });

    const updateStatus = async () => {
        const newStatus = !status();
        setStatus(newStatus);
        await browser.storage.local.set({ isAutoHandle: newStatus });
    };

    return (
        <div class="max-w-4xl mx-auto">
            {/* ===== 头部 ===== */}
            <header class="flex justify-between items-center mb-10">
                <div>
                    <h1 class="text-3xl mb-3 text-primary flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                            <path d="M0 0h24v24H0z" fill="none" />
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a24 24 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.3 24.3 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.97 8.97 0 0 1 5.292 3m13.416 0a8.97 8.97 0 0 1 2.168 4.5" />
                        </svg>
                        状态设置
                    </h1>
                    <p class="text-base-content/70 text-base leading-relaxed">
                        设置此插件是自动运行，还是关闭。
                    </p>
                </div>
            </header>

            {/* ===== 其他功能：保存记录 ===== */}
            <div class="card bg-base-100 shadow-sm border border-base-300 mb-8">
                <div class="card-body gap-3 p-6">
                    <h2 class="card-title text-base font-bold text-base-content flex items-center gap-2">
                        {/* <LayoutDashboard /> */}
                        <span
                            class={`${status() ? "text-success" : "text-error"
                                }`}
                        >
                            合集处理状态：{status() ? "启动中" : "关闭"}
                        </span>
                    </h2>
                    <div class="flex items-center">
                        <div
                            class={`aura  ${status()
                                    ? "aura-rainbow duration-1000"
                                    : "text-orange-600"
                                }`}
                        >
                            <button
                                onClick={updateStatus}
                                class={`btn btn-soft ${status() ? "btn-success" : "btn-error"
                                    }`}
                            >
                                {status() ? "启动中" : "关闭"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
