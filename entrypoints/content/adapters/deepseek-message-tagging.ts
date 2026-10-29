/**
 * DeepSeek 2026-10 版把消息区换成了虚拟列表：
 *   div.ds-virtual-list > div.ds-virtual-list-items > div.ds-virtual-list-visible-items > (消息项 div，无稳定 class)
 * 旧版的 .ds-message 已经不存在，但项目大量逻辑（工具块、消息锚点、恢复渲染）都依赖它。
 *
 * 这里在运行时给可见消息项补上 .ds-message 标记，旧逻辑无需改动即可继续工作。
 * 虚拟列表只渲染视口附近的消息，因此标记也只覆盖当前可见项——这正是这些 DOM 能力需要的范围。
 */
export const DEEPSEEK_VIRTUAL_MESSAGE_LIST_SELECTOR = '.ds-virtual-list-visible-items';
export const DPP_MESSAGE_TAG_ATTR = 'data-dpp-message-tagged';

export function tagDeepSeekMessageItems(root: ParentNode = document): number {
  let tagged = 0;
  for (const list of Array.from(
    root.querySelectorAll<HTMLElement>(DEEPSEEK_VIRTUAL_MESSAGE_LIST_SELECTOR),
  )) {
    for (const item of Array.from(list.children)) {
      if (!(item instanceof HTMLElement)) continue;
      if (item.classList.contains('ds-message')) continue;
      item.classList.add('ds-message');
      item.setAttribute(DPP_MESSAGE_TAG_ATTR, '1');
      tagged += 1;
    }
  }
  return tagged;
}

export function untagDeepSeekMessageItems(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(`[${DPP_MESSAGE_TAG_ATTR}="1"]`).forEach((element) => {
    element.classList.remove('ds-message');
    element.removeAttribute(DPP_MESSAGE_TAG_ATTR);
  });
}
