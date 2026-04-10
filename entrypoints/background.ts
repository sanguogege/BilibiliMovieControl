// entrypoints/background.ts
import { browser } from 'wxt/browser';
import { getBiliCollection } from '@/utils/bili';

// 内存缓存，用于短时间内去重
const processedLogs = new Map<string, number>();
const DEBOUNCE_TIME = 2000; // 2秒内相同URL不重复触发

/**
 * 清洗 B 站 URL，去除 spm_id_from 等追踪参数
 * 转化前: https://www.bilibili.com/video/BV123/?spm_id_from=333.999.0.0
 * 转化后: https://www.bilibili.com/video/BV123/
 */
function cleanBiliUrl(url: string): string {
  try {
    const u = new URL(url);
    // 只保留 origin (域名) 和 pathname (路径)
    // 如果需要保留分 P 信息，可以额外判断 u.searchParams.get('p')
    return `${u.origin}${u.pathname}`;
  } catch (e) {
    return url;
  }
}

export default defineBackground(() => {

  // 核心：处理手动存档逻辑
  const handleArchiveLogic = async (tab: any, config: any) => {
    const res: any = await browser.storage.local.get({ pinnedHistory: [] });
    const colTitle = await getBiliCollection(tab.id);
    const cleanedUrl = cleanBiliUrl(tab.url || '');

    if (colTitle) {
      const newItem = {
        title: colTitle,
        url: cleanedUrl,
        time: Date.now(),
        config: config
      };

      // 根据清洗后的 URL 去重
      const newPinned = [
        newItem,
        ...res.pinnedHistory.filter((h: any) => cleanBiliUrl(h.url) !== cleanedUrl)
      ].slice(0, 50);

      await browser.storage.local.set({ pinnedHistory: newPinned });
      return newPinned;
    }
    return res.pinnedHistory;
  };

  // 1. 自动记录历史
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    const rawUrl = tab.url || '';

    // 准入条件：状态完成、是视频页、且不是刚刚处理过的
    if (changeInfo.status === 'complete' && rawUrl.includes('bilibili.com/video')) {
      const cleanedUrl = cleanBiliUrl(rawUrl);
      const now = Date.now();
      const lastTime = processedLogs.get(cleanedUrl) || 0;

      if (now - lastTime < DEBOUNCE_TIME) return; // 判定为重复触发，跳过

      processedLogs.set(cleanedUrl, now);
      // 清理 Map 防止内存溢出
      if (processedLogs.size > 20) {
        const firstKey = processedLogs.keys().next().value;
        if (typeof firstKey === 'string') {
          processedLogs.delete(firstKey);
        }
      }

      const colTitle = await getBiliCollection(tabId);
      if (colTitle) {
        const res: any = await browser.storage.local.get({
          latestHistory: [],
          sH: 0, sM: 0, sS: 0, mH: 0, mM: 0, mS: 0, eH: 0, eM: 0, eS: 0
        });

        const newItem = {
          title: colTitle,
          url: cleanedUrl,
          time: now,
          config: {
            sH: res.sH, sM: res.sM, sS: res.sS,
            mH: res.mH, mM: res.mM, mS: res.mS,
            eH: res.eH, eM: res.eM, eS: res.eS,
          },
        };

        // 存储前再次根据清洗后的 URL 过滤旧记录
        const newLatest = [
          newItem,
          ...res.latestHistory.filter((h: any) => cleanBiliUrl(h.url) !== cleanedUrl)
        ].slice(0, 50);

        await browser.storage.local.set({ latestHistory: newLatest });

        // 通知 UI 刷新
        browser.runtime.sendMessage({
          type: 'REFRESH_HISTORY',
          data: { latestHistory: newLatest }
        }).catch(() => { });
      }
    }
  });

  // 2. 消息监听器
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'DO_ARCHIVE') {
      handleArchiveLogic(message.data.tab, message.data.config).then(newPinned => {
        sendResponse({ pinnedHistory: newPinned });
      });
      return true; // 保持异步通道
    }
  });
});