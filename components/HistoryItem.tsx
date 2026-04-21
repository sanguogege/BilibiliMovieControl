import { Component } from 'solid-js';
import type { HistoryItem } from '../assets/types';

interface HistoryItemProps {
    item: HistoryItem;
    onClick: (item: HistoryItem) => void;
    isPinned?: boolean;
}

import s from "../assets/HistoryItem.module.css";


export const HistoryItemComp: Component<HistoryItemProps> = (props) => {
  const prefix = () => (props.isPinned ? '📌 ' : '🕒 ');

  return (
    <div
      class={`${s.item} ${props.isPinned ? s.pinned : ''}`}
      onClick={() => props.onClick(props.item)}
    >
      {prefix()}{props.item.title}
    </div>
  );
};