import { describe, expect, it } from 'vitest';
import {
  DPP_MESSAGE_TAG_ATTR,
  tagDeepSeekMessageItems,
  untagDeepSeekMessageItems,
} from '../entrypoints/content/adapters/deepseek-message-tagging';

function createVirtualList(count: number): HTMLElement {
  const list = document.createElement('div');
  list.className = 'ds-virtual-list-visible-items';
  for (let i = 0; i < count; i += 1) {
    const item = document.createElement('div');
    item.className = `item-${i}`;
    item.textContent = `message ${i}`;
    list.appendChild(item);
  }
  document.body.appendChild(list);
  return list;
}

describe('DeepSeek 新版虚拟列表消息标记', () => {
  it('给可见消息项补上 .ds-message，旧逻辑即可命中', () => {
    document.body.innerHTML = '';
    const list = createVirtualList(3);
    const tagged = tagDeepSeekMessageItems();
    expect(tagged).toBe(3);
    expect(list.querySelectorAll('.ds-message').length).toBe(3);
    expect(document.querySelectorAll('.ds-message').length).toBe(3);
  });

  it('重复调用不会重复计数（幂等）', () => {
    document.body.innerHTML = '';
    createVirtualList(2);
    expect(tagDeepSeekMessageItems()).toBe(2);
    expect(tagDeepSeekMessageItems()).toBe(0);
    expect(document.querySelectorAll('.ds-message').length).toBe(2);
  });

  it('旧版已有 .ds-message 的节点不会被重复标记', () => {
    document.body.innerHTML = '';
    const list = createVirtualList(1);
    list.children[0].classList.add('ds-message');
    expect(tagDeepSeekMessageItems()).toBe(0);
    expect(list.children[0].hasAttribute(DPP_MESSAGE_TAG_ATTR)).toBe(false);
  });

  it('停用时只清掉自己加的标记，不动 DeepSeek 原生 class', () => {
    document.body.innerHTML = '';
    const list = createVirtualList(2);
    tagDeepSeekMessageItems();
    untagDeepSeekMessageItems();
    expect(list.querySelectorAll('.ds-message').length).toBe(0);

    const native = document.createElement('div');
    native.className = 'ds-message native';
    document.body.appendChild(native);
    untagDeepSeekMessageItems();
    expect(native.classList.contains('ds-message')).toBe(true);
  });

  it('没有虚拟列表时安全返回 0', () => {
    document.body.innerHTML = '<div class="something-else"></div>';
    expect(tagDeepSeekMessageItems()).toBe(0);
  });
});
