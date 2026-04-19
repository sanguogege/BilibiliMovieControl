import { createSignal, For } from 'solid-js';
import { TimeInput } from '@/components/TimeInput';
import { Trash2, Clock, Plus } from 'lucide-solid';

// 定义内部数据结构
interface TimePoint { h: number; m: number; s: number; }
interface TimeRange { id: string; start: TimePoint; end: TimePoint; }

export const TimeRangeManager = (props: { onClose: () => void }) => {
  // 1. 伪造初始数据：已添加的时间段列表
  const [ranges, setRanges] = createSignal<TimeRange[]>([
    { id: '1', start: { h: 0, m: 0, s: 0 }, end: { h: 0, m: 1, s: 30 } },
    { id: '2', start: { h: 0, m: 45, s: 0 }, end: { h: 0, m: 46, s: 0 } },
  ]);

  // 2. 当前正在编辑的时间状态
  const defaultTime = () => ({ h: 0, m: 0, s: 0 });
  const [currentStart, setCurrentStart] = createSignal<TimePoint>(defaultTime());
  const [currentEnd, setCurrentEnd] = createSignal<TimePoint>(defaultTime());

  // 辅助函数：格式化显示
  const formatTime = (t: TimePoint) =>
    [t.h, t.m, t.s].map(v => String(v).padStart(2, '0')).join(':');

  // --- 逻辑处理 ---

  // 添加到列表（确定按钮）
  const handleConfirm = () => {
    const newRange: TimeRange = {
      id: crypto.randomUUID(),
      start: { ...currentStart() },
      end: { ...currentEnd() }
    };
    setRanges([...ranges(), newRange]);
    handleResetInput(); // 添加完自动重置输入框
  };

  // 从列表删除
  const handleRemove = (id: string) => {
    setRanges(ranges().filter(r => r.id !== id));
  };

  // 点击列表项：回填数据到编辑框
  const handleSelect = (range: TimeRange) => {
    setCurrentStart({ ...range.start });
    setCurrentEnd({ ...range.end });
  };

  // 重置编辑框
  const handleResetInput = () => {
    setCurrentStart(defaultTime());
    setCurrentEnd(defaultTime());
  };

  return (
    <div style={{
      position: 'absolute',
      width: '100%',
      left: 0, top: 0,
      padding: '8px',
      background: '#fff', 
      'border-radius': '8px',
      display: 'flex',
      'flex-direction': 'column',
      'box-sizing': 'border-box'
    }}>
      {/* 1. 顶部列表 */}
      <div style={{
        flex: 1,
        'overflow-y': 'auto',
        display: 'flex',
        'flex-direction': 'column',
        'min-height': '120px',
        'max-height': '180px',
        padding: '8px',
        background: '#f6f7f9',
      }}>
        <div style={{ 'font-size': '12px', color: '#9499a0', 'margin-bottom': '4px', 'font-weight': 'bold' }}>
          已保存的时段 ({ranges().length})
        </div>
        <For each={ranges()} fallback={
          <div style={{ 'margin': 'auto', color: '#ccc', 'font-size': '12px' }}>暂无跳过时段</div>
        }>
          {(range) => (
            <div
              onClick={() => handleSelect(range)}
              style={{
                display: 'flex', 'justify-content': 'space-between', 'align-items': 'center',
                padding: '4px 10px', background: '#fff', border: '1px solid #e3e5e7',
                'border-radius': '4px', cursor: 'pointer', transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#fb7299'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e3e5e7'}
            >
              <span style={{ 'font-size': '13px', color: '#61666d', 'font-family': 'monospace' }}>
                {formatTime(range.start)} - {formatTime(range.end)}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(range.id); }}
                style={{ background: 'none', border: 'none', color: '#9499a0', cursor: 'pointer', padding: '4px' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </For>
      </div>

      {/* 2. 中间编辑区 */}
      <div style={{
        padding: '12px',
        "margin-top": '6px',
        background: '#fffafb',
        display: 'flex',
        'flex-direction': 'column',
        gap: '10px'
      }}>
        <div style={{ 'font-size': '12px', color: '#fb7299', 'font-weight': 'bold', 'display': 'flex', 'align-items': 'center', gap: '4px' }}>
          <Clock size={14} /> 设定新时段
        </div>

        <TimeInput
          label="从"
          hour={currentStart().h} minute={currentStart().m} second={currentStart().s}
          onHourChange={(v) => setCurrentStart({ ...currentStart(), h: v })}
          onMinuteChange={(v) => setCurrentStart({ ...currentStart(), m: v })}
          onSecondChange={(v) => setCurrentStart({ ...currentStart(), s: v })}
        />

        <TimeInput
          label="至"
          hour={currentEnd().h} minute={currentEnd().m} second={currentEnd().s}
          onHourChange={(v) => setCurrentEnd({ ...currentEnd(), h: v })}
          onMinuteChange={(v) => setCurrentEnd({ ...currentEnd(), m: v })}
          onSecondChange={(v) => setCurrentEnd({ ...currentEnd(), s: v })}
        />
      </div>

      {/* 3. 底部操作栏 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        'margin-top': 'auto',
        'padding-top': '10px',
        'border-top': '1px solid #f1f2f3'
      }}>
        <button
          onClick={handleConfirm}
          style={{
            flex: 1, background: '#fb7299', color: 'white', border: 'none',
            padding: '6px 0', 'border-radius': '6px', 'font-weight': 'bold',
            cursor: 'pointer', display: 'flex', 'align-items': 'center', 'justify-content': 'center', gap: '2px'
          }}
        >
          <Plus size={16} /> 保存
        </button>

        <button
          onClick={handleResetInput}
          style={{
            flex: 1, background: '#f6f7f9', color: '#61666d', border: '1px solid #e3e5e7',
            padding: '6px 0', 'border-radius': '6px', cursor: 'pointer'
          }}
        >
          重置
        </button>

        <button
          onClick={() => props.onClose()}
          style={{
            flex: 1, background: 'none', color: '#9499a0', border: 'none',
            padding: '6px 0', 'border-radius': '6px', cursor: 'pointer'
          }}
        >
          取消
        </button>
      </div>
    </div>
  );
};