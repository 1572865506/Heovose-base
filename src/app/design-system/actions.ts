'use server';

import fs from 'fs/promises';
import path from 'path';

/**
 * 读取前台系统视觉白皮书内容
 */
export async function getFrontendManifest() {
  const manifestPath = path.join(process.cwd(), 'docs', 'frontend-design-manifest.md');
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Read manifest error:', error);
    return { success: false, content: '', error: '未找到前台规范文件或读取失败。' };
  }
}
