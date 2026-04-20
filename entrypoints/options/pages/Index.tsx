import { createSignal, onMount, Switch, Match } from 'solid-js';
import { Save, CircleCheck, CircleAlert, Settings, Info } from 'lucide-solid';
import { browser } from 'wxt/browser';
import { TimeInput } from '@/components/TimeInput'; // 假设文件在同级目录

export default function Home() {
    // 基础状态
    const [useManualTime, setUseManualTime] = createSignal(false);
    const [frameThreshold, setFrameThreshold] = createSignal(85);
    const [saveStatus, setSaveStatus] = createSignal<'idle' | 'success'>('idle');

    // 时、分、秒独立状态（用于配合 TimeInput 组件）
    const [hour, setHour] = createSignal(0);
    const [minute, setMinute] = createSignal(0);
    const [second, setSecond] = createSignal(0);

    // 初始化加载
    onMount(async () => {
        const res = await browser.storage.local.get({
            frameThreshold: 85,
            manualSeconds: 0,
            useManualTime: false
        });

        setFrameThreshold(res.frameThreshold as number);
        setUseManualTime(res.useManualTime as boolean);

        // 解析存储的总秒数为 时:分:秒
        const total = res.manualSeconds as number;
        setHour(Math.floor(total / 3600));
        setMinute(Math.floor((total % 3600) / 60));
        setSecond(total % 60);
    });

    // 保存逻辑
    const saveSettings = async () => {
        // 合成总秒数
        const totalSeconds = (hour() * 3600) + (minute() * 60) + second();

        const config = {
            frameThreshold: frameThreshold(),
            manualSeconds: totalSeconds,
            useManualTime: useManualTime()
        };

        await browser.storage.local.set(config);

        // 消息广播给 B 站标签页
        const tabs = await browser.tabs.query({ url: '*://*.bilibili.com/*' });
        tabs.forEach(tab => {
            if (tab.id) {
                browser.tabs.sendMessage(tab.id, {
                    type: 'UPDATE_CONFIG',
                    ...config
                }).catch(() => { });
            }
        });

        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };

    return (
        <div style={{ "max-width": "900px", margin: "0 auto" }}>
            <header style={{ "margin-bottom": "40px" }}>
                <div>
                    <h1 style={{ "font-size": "32px", margin: "0 0 12px 0", color: "#fb7299", "display": "flex", "align-items": "center", gap: "12px" }}>
                        <Settings size={36} /> 全局配置 暂停
                    </h1>
                    <p style={{ color: "#61666d", "font-size": "16px", "line-height": "1.6" }}>
                        调整插件的自动化运行参数，优化性能与准确度
                    </p>
                </div>
            </header>

            <div style={{
                background: '#fff',
                padding: '32px',
                'border-radius': '16px',
                'box-shadow': '0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid #e3e5e7'
            }}>

                {/* 模式切换：保持现有极简风格 */}
                <div style={{ display: 'flex', gap: '24px', 'margin-bottom': '24px', 'border-bottom': '1px solid #f1f2f3', 'padding-bottom': '16px' }}>
                    <label style={{ display: 'flex', 'align-items': 'center', gap: '8px', cursor: 'pointer', "font-size": "14px", color: !useManualTime() ? "#fb7299" : "#61666d", "font-weight": !useManualTime() ? "600" : "400" }}>
                        <input type="radio" checked={!useManualTime()} onChange={() => setUseManualTime(false)} style={{ "accent-color": "#fb7299" }} />
                        智能比例模式 (%)
                    </label>
                    <label style={{ display: 'flex', 'align-items': 'center', gap: '8px', cursor: 'pointer', "font-size": "14px", color: useManualTime() ? "#fb7299" : "#61666d", "font-weight": useManualTime() ? "600" : "400" }}>
                        <input type="radio" checked={useManualTime()} onChange={() => setUseManualTime(true)} style={{ "accent-color": "#fb7299" }} />
                        精确时间打点 (时:分:秒)
                    </label>
                </div>

                <div style={{ 'margin-bottom': '32px' }}>
                    <Switch>
                        {/* 模式 1: 滑块 */}
                        <Match when={!useManualTime()}>
                            <div style={{ display: 'flex', 'justify-content': 'space-between', 'align-items': 'center', 'margin-bottom': '16px' }}>
                                <span style={{ 'font-weight': '600', 'font-size': '16px' }}>视频读帧起始进度</span>
                                <span style={{ color: '#fb7299', 'font-weight': 'bold', 'font-size': '20px' }}>{frameThreshold()}%</span>
                            </div>
                            <input
                                type="range" min="50" max="98" step="1"
                                value={frameThreshold()}
                                onInput={(e) => setFrameThreshold(parseInt(e.currentTarget.value))}
                                style={{ width: '100%', cursor: 'pointer', "accent-color": '#fb7299', height: '6px', outline: 'none' }}
                            />
                        </Match>

                        {/* 模式 2: 引入你的 TimeInput 组件 */}
                        <Match when={useManualTime()}>
                            <div style={{ padding: '10px 0' }}>
                                <TimeInput
                                    label="设置开始分析的时间点"
                                    hour={hour()}
                                    minute={minute()}
                                    second={second()}
                                    onHourChange={setHour}
                                    onMinuteChange={setMinute}
                                    onSecondChange={setSecond}
                                />
                                <div style={{ "margin-top": "16px", "padding-left": "4px", "font-size": "13px", "color": "#9499a0" }}>
                                    当前设定：视频播放至 <b>{(hour() * 3600) + (minute() * 60) + second()}</b> 秒处触发分析
                                </div>
                            </div>
                        </Match>
                    </Switch>
                </div>

                {/* 提示卡片 */}
                <div style={{ padding: '16px', background: '#f6f7f9', 'border-radius': '10px', display: 'flex', gap: '12px', 'margin-bottom': '32px', border: '1px solid #eee' }}>
                    <CircleAlert size={20} color="#9499a0" style={{ 'flex-shrink': 0 }} />
                    <p style={{ margin: '0', 'font-size': '14px', color: '#61666d', 'line-height': '1.5' }}>
                        {useManualTime()
                            ? "精确模式：适合长视频中已知内容起始点的情况。插件将在设定的时间准时开始“像素级分析”。"
                            : "比例模式：起始进度决定了插件何时开始运行。设置越高（如 90%）对 CPU 压力越小。"}
                    </p>
                </div>

                {/* 保存按钮 */}
                <button
                    onClick={saveSettings}
                    disabled={saveStatus() === 'success'}
                    style={{
                        display: 'flex', 'align-items': 'center', gap: '8px',
                        background: saveStatus() === 'success' ? '#4caf50' : '#fb7299',
                        color: '#fff', border: 'none', padding: '12px 28px', 'border-radius': '8px',
                        cursor: saveStatus() === 'success' ? 'default' : 'pointer',
                        'font-weight': 'bold', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        'box-shadow': '0 2px 4px rgba(251, 114, 153, 0.2)'
                    }}
                >
                    <Switch>
                        <Match when={saveStatus() === 'idle'}>
                            <Save size={18} /><span>保存当前配置</span>
                        </Match>
                        <Match when={saveStatus() === 'success'}>
                            <CircleCheck size={18} /><span>设置已生效</span>
                        </Match>
                    </Switch>
                </button>
            </div>

            <div style={{ "margin-top": "30px", padding: "15px", background: "#eef3f7", "border-radius": "8px", display: "flex", gap: "10px" }}>
                <Info size={18} color="#00aeec" style={{ "flex-shrink": 0 }} />
                <p style={{ margin: "0", "font-size": "12px", color: "#61666d", "line-height": "1.5" }}>
                    <b>关于设置：</b> 您可以选择通用的“比例模式”或针对特定视频的“精确模式”。更改将即时同步。
                </p>
            </div>
        </div>
    );
}