import { createSignal, onMount, Show } from 'solid-js';
import { useBiliConfig } from '../../hooks/useBiliConfig';
import { TimeInput } from '../../components/TimeInput';
import { HistoryList } from '../../components/HistoryList';
import { getBiliCollection, formatTitle } from '../../utils/bili';
import { browser } from 'wxt/browser';

export default function App() {
  const {
    sH, setSH, sM, setSM, sS, setSS,
    mH, setMH, mM, setMM, mS, setMS,
    eH, setEH, eM, setEM, eS, setES,
    latestHistory, setLatestHistory,
    pinnedHistory,
    initFromStorage,
    resetConfig,
    loadHistory,
    applyAndArchive,
  } = useBiliConfig();

  const [isPageReady, setIsPageReady] = createSignal(false);
  // 模式：'auto' 或 'manual'，默认自动
  const [mode, setMode] = createSignal<'auto' | 'manual'>('auto');
  // 控制是否显示手动时间输入框
  const showManualTime = () => mode() === 'manual';

  // 加载保存的模式
  const loadMode = async () => {
    const res = await browser.storage.local.get('mode');
    if (res.mode === 'manual' || res.mode === 'auto') {
      setMode(res.mode);
    }
  };

  // 保存模式并通知 content script
  const saveMode = async (newMode: 'auto' | 'manual') => {
    setMode(newMode);
    await browser.storage.local.set({ mode: newMode });
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, { type: 'SET_MODE', mode: newMode });
    }
  };

  onMount(async () => {
    await initFromStorage();
    await loadMode();

    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab?.id && activeTab.url?.includes('bilibili.com/video')) {
      const colTitle = await getBiliCollection(activeTab.id);
      if (colTitle) {
        setIsPageReady(true);
        const currentConfig = {
          sH: sH(), sM: sM(), sS: sS(),
          mH: mH(), mM: mM(), mS: mS(),
          eH: eH(), eM: eM(), eS: eS(),
        };
        const newItem = {
          title: formatTitle(colTitle, activeTab.title || ''),
          url: activeTab.url || '',
          time: Date.now(),
          config: currentConfig,
        };
        const newLatest = [newItem, ...latestHistory().filter(h => h.url !== newItem.url)].slice(0, 2);
        setLatestHistory(newLatest);
        await browser.storage.local.set({ latestHistory: newLatest });
      }
    }
  });

  // 覆盖 applyAndArchive，额外发送模式信息
  const handleApply = async () => {
    await saveMode(mode()); // 确保模式已保存
    await applyAndArchive(); // 原有逻辑会发送 UPDATE_CONFIG，但还需要发送模式
    // 补充发送模式消息
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      await browser.tabs.sendMessage(tabs[0].id, { type: 'SET_MODE', mode: mode() });
    }
  };

  return (
    <div style={{
      width: '280px', padding: '15px', display: 'flex',
      'flex-direction': 'column', gap: '12px', 'font-family': 'sans-serif', background: '#fff'
    }}>
      <h3 style={{ margin: '0', 'font-size': '16px', color: '#fb7299', 'text-align': 'center' }}>
        B站连播助手
        <span style={{
          'font-size': '10px', 'margin-left': '6px', padding: '2px 4px',
          background: isPageReady() ? '#4caf50' : '#9e9e9e',
          color: 'white', 'border-radius': '3px', 'vertical-align': 'middle'
        }}>
          {isPageReady() ? '已就绪' : '待命中'}
        </span>
      </h3>

      {/* 模式切换 */}
      <div style={{ display: 'flex', gap: '12px', 'justify-content': 'center', 'margin-bottom': '4px' }}>
        <label style={{ display: 'flex', 'align-items': 'center', gap: '4px', 'font-size': '12px' }}>
          <input
            type="radio"
            name="mode"
            value="auto"
            checked={mode() === 'auto'}
            onChange={(e) => e.currentTarget.checked && saveMode('auto')}
          />
          自动（智能检测片尾）
        </label>
        <label style={{ display: 'flex', 'align-items': 'center', gap: '4px', 'font-size': '12px' }}>
          <input
            type="radio"
            name="mode"
            value="manual"
            checked={mode() === 'manual'}
            onChange={(e) => e.currentTarget.checked && saveMode('manual')}
          />
          手动（指定切集点）
        </label>
      </div>

      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <span>跳过区间 (先导+OP)</span>
          <TimeInput
            label="从"
            hour={sH()} minute={sM()} second={sS()}
            onHourChange={setSH}
            onMinuteChange={setSM}
            onSecondChange={setSS}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
          <TimeInput
            label="至"
            hour={mH()} minute={mM()} second={mS()}
            onHourChange={setMH}
            onMinuteChange={setMM}
            onSecondChange={setMS}
          />
        </div>

        {/* 手动模式才显示结尾切集点 */}
        <Show when={showManualTime()}>
          <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
            <span>结尾切集点</span>
            <TimeInput
              label="切"
              hour={eH()} minute={eM()} second={eS()}
              onHourChange={setEH}
              onMinuteChange={setEM}
              onSecondChange={setES}
            />
          </div>
        </Show>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleApply} style={{
          flex: 1.5, background: '#fb7299', color: 'white', border: 'none',
          padding: '8px', 'border-radius': '6px', cursor: 'pointer',
          'font-weight': 'bold', 'font-size': '12px'
        }}>
          应用并存档
        </button>
        <button onClick={resetConfig} style={{
          flex: 1, background: '#e3e5e7', color: '#61666d', border: 'none',
          padding: '8px', 'border-radius': '6px', cursor: 'pointer', 'font-size': '12px'
        }}>
          重置
        </button>
      </div>

      <HistoryList
        latest={latestHistory()}
        pinned={pinnedHistory()}
        onLoadHistory={loadHistory}
      />
    </div>
  );
}