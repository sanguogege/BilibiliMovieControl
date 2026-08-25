import { onSettled, type ParentProps } from 'solid-js';
import { useLocation, useNavigate } from '@solidjs/router';
import { OptionsFooter } from '@/components/OptionsFooter';


import { getSoftName } from '@/utils/bilibili';

const NAV_LINKS = [
  {
    to: "/", label: "功能讲解", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
        <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87q.11.06.22.127c.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a8 8 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a7 7 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a7 7 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a7 7 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124q.108-.066.22-.128c.332-.183.582-.495.644-.869z" />
        <path d="M15 12a3 3 0 1 1-6 0a3 3 0 0 1 6 0" />
      </g>
    </svg>
},
  {
    to: "/status", label: "状态设置", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.857 17.082a24 24 0 0 0 5.454-1.31A8.97 8.97 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.97 8.97 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.3 24.3 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.97 8.97 0 0 1 5.292 3m13.416 0a8.97 8.97 0 0 1 2.168 4.5" />
    </svg>
},
  {
    to: "/history", label: "自动存档", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25zm0 9.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18zM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25zm0 9.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18z" />
    </svg>
},
  {
    to: "/manual", label: "手动存档", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5m0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25m9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25" />
    </svg>
},
  {
    to: "/about", label: "插件说明", icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v3.75m0-10.036A11.96 11.96 0 0 1 3.598 6A12 12 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622c5.176-1.332 9-6.03 9-11.622c0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286m0 13.036h.008v.008H12z" />
    </svg>

 },
];

export default function Layout(props: ParentProps) {
  const navigate = useNavigate();
  const loc = useLocation();

  // 支持从扩展其他地方打开指定页：options.html?target=status
  // 只处理一次，避免 onSettled 在每次导航后重复跳转
  let handledTarget = false;
  onSettled(() => {
    if (handledTarget) return;
    const urlParams = new URLSearchParams(window.location.search);
    const target = urlParams.get('target');
    if (target) {
      handledTarget = true;
      navigate(`/${target}`, { replace: true });
    }
  });

  return (
    <div class="flex h-screen overflow-hidden bg-base-200">
      {/* 侧边栏 */}
      <nav class="w-60 h-full bg-base-100 border-r border-base-300 p-5 flex flex-col gap-2.5 shrink-0">
        <div>
          <h2 class="text-primary text-lg mb-5 font-bold">{getSoftName()}设置</h2>

          {NAV_LINKS.map((link) => (
            <a
              href={link.to}
              onClick={(e) => {
                e.preventDefault();
                navigate(link.to);
              }}
              class={`flex items-center gap-2.5 px-3 py-3 no-underline text-base-content/70 rounded-lg transition-all duration-200 hover:bg-primary/5${loc.pathname === link.to ? " active-link" : ""}`}
            >
              {link.icon}
              {link.label}
            </a>
          ))}
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
