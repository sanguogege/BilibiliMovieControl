import { Component } from 'solid-js';
import type { HistoryItem } from '../assets/types';

interface HistoryItemProps {
    item: HistoryItem;
    onClick: (item: HistoryItem) => void;
    isPinned?: boolean;
}

// CSS 类样式（通过 <style> 注入）
const styles = `
  .history-item {
    padding: 6px 8px;
    font-size: 11px;
    background: #f6f7f8;
    cursor: pointer;
    border-radius: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    border: 1px solid #eee;
    color: #61666d;
    margin-bottom: 4px;
    transition: all 0.2s ease;
  }
  .history-item:hover {
    background: #e8e9ec;
    color: #333;
  }
  .history-item.pinned {
    background: #fff0f3;
    border: 1px solid #ffdce2;
  }
  .history-item.pinned:hover {
    background: #ffe0e6;
    color: #d14c6e;
  }
`;

export const HistoryItemComp: Component<HistoryItemProps> = (props) => {
    const prefix = () => (props.isPinned ? '📌 ' : '🕒 ');
    const classNames = () => `history-item ${props.isPinned ? 'pinned' : ''}`;

    return (
        <>
            <style>{styles}</style>
            <div class={classNames()} onClick={() => props.onClick(props.item)}>
                {prefix()}{props.item.title}
            </div>
        </>
    );
};