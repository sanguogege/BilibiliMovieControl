import { Component, For } from 'solid-js';
import type { HistoryItem } from '../assets/types';
import { HistoryItemComp } from './HistoryItem';

interface HistoryListProps {
    latest: HistoryItem[];
    pinned: HistoryItem[];
    onLoadHistory: (item: HistoryItem) => void;
}

 // 假设有一个 CSS 模块文件来管理样式

const labelStyle = {
    'font-size': '11px',
    'color': '#9499a0',
    'margin-bottom': '4px',
    'display': 'block',
};

const emptyStyle = {
    'color': '#9499a0',
    'font-size': '12px',
    'padding': '8px 0',
    'text-align': 'center'
} as const;

export const HistoryList: Component<HistoryListProps> = (props) => {
    return (
        <div style={{ 'margin-top': '4px', 'border-top': '1px solid #e3e5e7', 'padding-top': '10px' }}>
            {/* 最近播放部分 */}
            <div style={{...labelStyle}}>最近播放 (合集)</div>
            <div style={{ height: "66px", border: "1px solid #e3e5e7", "border-radius": "4px", padding: "4px", }}>
                <For each={props.latest} fallback={<div style={emptyStyle }>暂无记录</div>}>
                    {item => <HistoryItemComp item={item} onClick={props.onLoadHistory} isPinned={false} />}
                </For>
            </div> 

            {/* 手动存档部分 */}
            <div style={{ ...labelStyle, 'margin-top': '8px' }}>手动存档</div>
            <div style={{ height: "99px",border: "1px solid #e3e5e7", "border-radius": "4px", padding: "4px",}}>
                <For each={props.pinned} fallback={<div style={emptyStyle }>暂无存档</div>}>
                    {item => <HistoryItemComp item={item} onClick={props.onLoadHistory} isPinned={true} />}
                </For>
            </div>
        </div>
    );
};