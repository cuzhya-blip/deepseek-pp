import { describe, expect, it } from 'vitest';
import { prompt as zh } from '../core/i18n/resources/zh-CN/prompt';
import { prompt as en } from '../core/i18n/resources/en/prompt';

describe('记忆遗忘规则', () => {
  it('中文 chat / thinking 提示词都要求调用 memory_delete', () => {
    expect(zh.systemChat).toContain('记忆删除规则');
    expect(zh.systemChat).toContain('memory_delete');
    expect(zh.systemThinking).toContain('memory_delete');
  });

  it('英文 chat / thinking 提示词同样覆盖', () => {
    expect(en.systemChat).toContain('Memory Deletion Rules');
    expect(en.systemChat).toContain('memory_delete');
    expect(en.systemThinking).toContain('memory_delete');
  });

  it('找不到匹配时明确要求不要假装删除', () => {
    expect(zh.systemChat).toContain('不要假装删除');
    expect(en.systemChat).toContain('instead of pretending');
  });
});
