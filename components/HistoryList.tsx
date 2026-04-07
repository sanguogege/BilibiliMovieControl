import { Component, For } from 'solid-js';
import type { HistoryItem } from '../assets/types';
import { HistoryItemComp } from './HistoryItem';

interface HistoryListProps {
    latest: HistoryItem[];
    pinned: HistoryItem[];
    onLoadHistory: (item: HistoryItem) => void;
}

const labelStyle = {
    'font-size': '11px',
    'color': '#9499a0',
    'margin-bottom': '4px',
    'display': 'block',
};

export const HistoryList: Component<HistoryListProps> = (props) => {
    return (
        <div style={{ 'margin-top': '4px', 'border-top': '1px solid #e3e5e7', 'padding-top': '10px' }}>
            <div style={labelStyle}>最近播放 (合集)</div>
            <For each={props.latest}>
                {item => <HistoryItemComp item={item} onClick={props.onLoadHistory} isPinned={false} />}
            </For>
            <div style={{ ...labelStyle, 'margin-top': '8px' }}>手动存档</div>
            <For each={props.pinned}>
                {item => <HistoryItemComp item={item} onClick={props.onLoadHistory} isPinned={true} />}
            </For>
        </div>
    );
};