
'use server';

import fs from 'fs/promises';
import path from 'path';

const manifestPath = path.join(process.cwd(), 'docs', 'admin-system-manifest.md');

/**
 * 读取白皮书内容
 */
export async function getManifest() {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('Read manifest error:', error);
    return { success: false, content: '', error: '未找到白皮书文件或读取失败。' };
  }
}

/**
 * 保存白皮书内容
 */
export async function saveManifest(content: string) {
  try {
    // 确保目录存在
    const dir = path.dirname(manifestPath);
    await fs.mkdir(dir, { recursive: true });
    
    await fs.writeFile(manifestPath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Save manifest error:', error);
    return { success: false, error: '保存失败，请检查文件系统权限。' };
  }
}
