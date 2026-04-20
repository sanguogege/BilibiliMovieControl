// entrypoints/popup/App.tsx
import { onMount, Show, For, createSignal, Switch } from 'solid-js';
import { useBiliConfig } from '@/hooks/useBiliConfig';
import { TimeInput } from '@/components/TimeInput';
import { HistoryList } from '@/components/HistoryList';
import { TimeRangeManager } from '@/components/TimeRangeItem';
import { browser } from 'wxt/browser';
import { Settings, Clock } from 'lucide-solid';


// TODO 1. 统一按钮样式，添加 hover 效果，写成一个组件
// TODO 2. 添加组件操作反馈（如应用配置时按钮变色并显示“保存中...”）
// TODO 3. 去除设置页的不必要页面。
// TODO 4. 优化存档功能的用户体验（如添加确认提示、存档成功反馈等）


import { getSoftName } from '@/utils/bili';
import StyledButton from '@/components/StyledButton';


export default function App() {
    const {
        opRanges, setOpRanges,
        frameConfig, setFrameConfig,
        jumpConfig, setJumpConfig,
        mode, setMode,
        isPageReady, setIsPageReady,
        latestHistory, setLatestHistory,
        pinnedHistory,

        // 方法
        initFromStorage,
        saveMode,
        applyConfig,
        handleArchive,
        loadHistory,
        openOptions,
    } = useBiliConfig();

    const [showTimeManager, setShowTimeManager] = createSignal(false);
    const [isApplying, setIsApplying] = createSignal(false);
    const [isArchiving, setIsArchiving] = createSignal(false);

    const onApply = async (type: "setting" | "reset") => {
        setIsApplying(true);
        await applyConfig(type);
        setTimeout(() => setIsApplying(false), 800);
    };

    onMount(async () => {
        await initFromStorage();
        const res = await browser.storage.local.get('mode');
        setMode(res.mode === 'manual' ? 'manual' : 'auto');

        const tabs = await browser.tabs.query({ active: true, currentWindow: true });
        const activeTab = tabs[0];
        if (activeTab?.id && activeTab.url?.includes('bilibili.com/video')) {
            try {
                const resp = await browser.tabs.sendMessage(activeTab.id, { type: 'QUERY_READY_STATUS' });
                if (resp) setIsPageReady(resp.isCollection);
            } catch (e) {
                setIsPageReady(false);
            }
        }
        // 监听后台的自动更新广播
        browser.runtime.onMessage.addListener((msg) => {
            if (msg.type === 'SYNC_PAGE_READY') {
                setIsPageReady(msg.isCollection);
            }
            if (msg.type === 'REFRESH_HISTORY') setLatestHistory(msg.data);
        });
    });

    return (
        <div style={{ position: 'relative', width: '280px', padding: '15px', display: 'flex', 'flex-direction': 'column', gap: '12px', background: '#fff' }}>
            <h3 style={{ display: 'flex', "align-items": 'center', "justify-content": 'center', margin: '0', 'font-size': '16px', color: '#fb7299' }}>
                {getSoftName()}
                <span style={{ 'font-size': '10px', 'margin': '0 6px', padding: '2px 4px', background: isPageReady() ? '#4caf50' : '#9e9e9e', color: 'white', 'border-radius': '3px' }}>
                    {isPageReady() ? '已就绪' : '待命中'}
                </span>


                <StyledButton
                    variant="ghost"
                    size='small'
                    loadingText="存档中..."
                    onClick={openOptions}
                    icon={<Settings size={14} />}>设置</StyledButton>
            </h3>

            <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center' }}>
                <For each={['auto', 'manual'] as const}>
                    {(m) => (
                        <label style={{ display: 'flex', 'align-items': 'center', gap: '4px', 'font-size': '12px', cursor: 'pointer' }}>
                            <input type="radio" name="mode" checked={mode() === m} onChange={() => saveMode(m)} />
                            {m === 'auto' ? '自动检测' : '手动切集'}
                        </label>
                    )}
                </For>
            </div>

            <StyledButton
                variant="secondary"
                loadingText="保存中..."
                onClick={[setShowTimeManager, true]}
                fullWidth
                icon={<Clock size={14} />}>管理多个跳过时间段</StyledButton>

            <Show when={showTimeManager()}>
                <TimeRangeManager onClose={() => setShowTimeManager(false)} />
            </Show>

            <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
                <Switch>
                    <Match when={mode() === 'auto'}>
                        <TimeInput label="帧" hour={frameConfig().h} minute={frameConfig().m} second={frameConfig().s} onHourChange={setFrameConfig} onMinuteChange={setFrameConfig} onSecondChange={setFrameConfig} />
                    </Match>
                    <Match when={mode() === 'manual'}>
                        <TimeInput label="切" hour={jumpConfig().h} minute={jumpConfig().m} second={jumpConfig().s} onHourChange={setJumpConfig} onMinuteChange={setJumpConfig} onSecondChange={setJumpConfig} />
                    </Match>
                </Switch>
            </div>


            <div style={{ display: 'flex', gap: '6px' }}>
                <StyledButton
                    variant="primary"
                    loadingText="保存中..."
                    onClick={[onApply, "setting"]}

                    icon={<Settings size={14} />}>应用</StyledButton>

                <StyledButton
                    variant="reset"
                    loadingText="重置中..."
                    // onClick={() => onApply("reset")}
                    onClick={[onApply, "reset"]}
                    icon={<Settings size={14} />}>重置</StyledButton>


                <StyledButton
                    variant="secondary"
                    loadingText="存档中..."
                    onClick={[onApply, "archive"]}
                    icon={<Settings size={14} />}>存档</StyledButton>
            </div>

            <HistoryList latest={latestHistory()} pinned={pinnedHistory()} onLoadHistory={loadHistory} />
        </div>
    );
}