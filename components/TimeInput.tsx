import { Component } from 'solid-js';

interface TimeInputProps {
    label: string;
    hour: number;
    minute: number;
    second: number;
    onHourChange: (val: number) => void;
    onMinuteChange: (val: number) => void;
    onSecondChange: (val: number) => void;
}

const inputStyle = {
    'width': '45px',
    'padding': '4px',
    'border': '1px solid #ddd',
    'border-radius': '4px',
    'text-align': 'center' as const,
};

const labelStyle = {
    'font-size': '11px',
    'color': '#9499a0',
    'margin-bottom': '4px',
    'display': 'block',
};

export const TimeInput: Component<TimeInputProps> = (props) => {
    return (
        <div style={{ display: 'flex', gap: '8px', 'align-items': 'center' }}>
            <span style={labelStyle}>{props.label}</span>
            <div style={{ display: 'flex', gap: '4px', 'align-items': 'center' }}>
                <input
                    type="number"
                    value={props.hour}
                    onInput={e => props.onHourChange(+e.currentTarget.value)}
                    style={inputStyle}
                    min="0"
                />:
                <input
                    type="number"
                    value={props.minute}
                    onInput={e => props.onMinuteChange(+e.currentTarget.value)}
                    style={inputStyle}
                    min="0"
                    max="59"
                />:
                <input
                    type="number"
                    value={props.second}
                    onInput={e => props.onSecondChange(+e.currentTarget.value)}
                    style={inputStyle}
                    min="0"
                    max="59"
                />
            </div>
        </div>
    );
};