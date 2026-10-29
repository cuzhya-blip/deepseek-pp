import { describe, expect, it } from 'vitest';
import type { Memory } from '../core/types';
import {
  formatMemoriesGrouped,
  selectAllMemories,
  selectMemories,
} from '../core/memory/selector';

function memory(
  partial: Partial<Memory> & Pick<Memory, 'type' | 'name' | 'content'>,
): Memory {
  const base: Omit<Memory, 'type' | 'name' | 'content'> = {
    id: 1,
    syncId: 'sync-1',
    scope: 'global',
    description: '',
    tags: [],
    pinned: false,
    createdAt: 1,
    updatedAt: 1,
    accessCount: 0,
    lastAccessedAt: 1,
  };
  return { ...base, ...partial } as Memory;
}

describe('全量注入模式（fork 默认）', () => {
  it('不按关键词筛选：与当前输入无关的记忆也全部保留', () => {
    const all = [
      memory({ id: 1, name: '用户职业', content: '前端工程师', type: 'user' }),
      memory({ id: 2, name: '小说进度', content: '写到第三章', type: 'topic' }),
      memory({ id: 3, name: '部署命令', content: 'docker compose up', type: 'reference' }),
    ];
    const filtered = selectMemories('今天天气怎么样', all, { budget: 1500 });
    const full = selectAllMemories(all);
    expect(full.map((m) => m.id).sort()).toEqual([1, 2, 3]);
    expect(full.length).toBeGreaterThanOrEqual(filtered.length);
  });

  it('排序：置顶 > 项目 > 类型顺序 > 最近更新', () => {
    const all = [
      memory({ id: 1, name: 'a', content: 'global-user', type: 'user', scope: 'global', updatedAt: 100 }),
      memory({ id: 2, name: 'b', content: 'project-ref', type: 'reference', scope: 'project', projectId: 'p1', updatedAt: 200 }),
      memory({ id: 3, name: 'c', content: 'pinned-global', type: 'topic', scope: 'global', pinned: true, updatedAt: 1 }),
      memory({ id: 4, name: 'd', content: 'project-user', type: 'user', scope: 'project', projectId: 'p1', updatedAt: 50 }),
    ];
    expect(selectAllMemories(all).map((m) => m.id)).toEqual([3, 4, 2, 1]);
  });

  it('硬上限：超预算时截断而不是无限膨胀', () => {
    const all = Array.from({ length: 40 }, (_, i) => memory({
      id: i + 1,
      name: `记忆${i}`,
      content: 'x'.repeat(200),
      type: 'reference',
    }));
    const out = selectAllMemories(all, { budget: 500 });
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThan(40);
  });

  it('分组输出：项目在前、按类型分小节、空组省略', () => {
    const text = formatMemoriesGrouped([
      memory({ id: 1, name: '职业', content: '前端', type: 'user', scope: 'project', projectId: 'p1' }),
      memory({ id: 2, name: '偏好', content: '中文', type: 'feedback', scope: 'project', projectId: 'p1' }),
      memory({ id: 3, name: '资料', content: '文档链接', type: 'reference' }),
    ], 'zh-CN');
    expect(text.startsWith('## 项目记忆')).toBe(true);
    expect(text).toContain('### 身份');
    expect(text).toContain('### 反馈');
    expect(text).toContain('## 全局记忆');
    expect(text.indexOf('## 项目记忆')).toBeLessThan(text.indexOf('## 全局记忆'));
  });

  it('分组输出：无记忆时回退为空提示', () => {
    expect(formatMemoriesGrouped([], 'zh-CN')).toBe('(暂无记忆)');
  });
});
