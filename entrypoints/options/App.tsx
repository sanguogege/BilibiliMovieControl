import type { ParentProps } from 'solid-js';
import { useNavigate } from '@solidjs/router';
// import { Settings, History, Info, HandGrab } from 'lucide-solid';
import { OptionsFooter } from '@/components/OptionsFooter';


import { getSoftName } from '@/utils/bilibili';

export default function Layout(props: ParentProps) {
  const navigate = useNavigate();

  onMount(() => {
    const urlParams = new URLSearchParams(location.search);
    const target = urlParams.get('target');
    if (target) {
      navigate(`/${target}`, { replace: true });
    }
  })

  return (
    <div class="flex h-screen overflow-hidden bg-base-200">
      {/* 侧边栏 */}
      <nav class="w-60 h-full bg-base-100 border-r border-base-300 p-5 flex flex-col gap-2.5 shrink-0">
        <div>
          <h2 class="text-primary text-lg mb-5 font-bold">{getSoftName()}设置</h2>

          <a href="/"   class="flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5">
             功能讲解
          </a>
          <a href="/status"  class="flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5">
            状态设置
          </a>
          <a href="/history"  class="flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5">
             自动存档
          </a>
          <a href="/manual"  class="flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5">
             手动存档
          </a>
          <a href="/about"  class="flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5">
             插件说明
          </a>
        </div>
      </nav>

      {/* 页面内容主体：允许独立滚动 */}
      <main class="flex-1 p-10 overflow-y-auto h-full">
        {props.children}
        <OptionsFooter />
      </main>

      <style>{`
                .active-link { background: #ffeef3 !important; color: #fb7299 !important; font-weight: bold; }
            `}</style>
    </div>
  );
}
