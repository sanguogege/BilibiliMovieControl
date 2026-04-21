import { Save, CircleCheck, CircleAlert, Settings, Info } from 'lucide-solid';


export default function Home() {
  

    return (
        <div style={{ "max-width": "900px", margin: "0 auto" }}>
            <header style={{ "margin-bottom": "40px" }}>
                <div>
                    <h1 style={{ "font-size": "32px", margin: "0 0 12px 0", color: "#fb7299", "display": "flex", "align-items": "center", gap: "12px" }}>
                        <Settings size={36} /> 全局配置 
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
                暂无设置
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