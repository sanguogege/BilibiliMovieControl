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

  onMount(async () => {
    await initFromStorage();

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

      <div style={{ display: 'flex', 'flex-direction': 'column', gap: '10px' }}>
       
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <span> 跳过区间 (先导+OP)</span>
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
        <div style={{ display: 'flex', 'flex-direction': 'column', gap: '8px' }}>
          <span> 结尾切集点</span>
          <TimeInput
            label="切"
            hour={eH()} minute={eM()} second={eS()}
            onHourChange={setEH}
            onMinuteChange={setEM}
            onSecondChange={setES}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={applyAndArchive} style={{
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