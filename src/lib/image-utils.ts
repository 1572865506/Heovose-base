
/**
 * 全局存储基础路径配置
 * 默认为 /storage，通过 Next.js rewrites 代理到本地 MinIO
 */
let globalStorageBaseUrl = '/storage';

/**
 * 允许在应用运行时动态更新存储基础路径
 */
export function setGlobalStorageBaseUrl(url: string) {
  if (url) {
    // 确保不以斜杠结尾，方便后续拼接
    globalStorageBaseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
  }
}

/**
 * 将数据库中存储的图片路径转换为可访问的 URL
 * 兼容旧的绝对路径 (http://192.168.1.190:9000/...) 
 * 并支持动态解析存储前缀
 */
export function getAssetUrl(path: string | null | undefined): string {
  if (!path) return '';

  // 1. 如果是 data: 链接（Base64），直接返回
  if (path.startsWith('data:')) return path;

  // 2. 如果是本地公共资源（/image, /video, /icons, /assets 等），直接返回
  if (path.startsWith('/image/') || path.startsWith('/video/') || path.startsWith('/icons/') || path.startsWith('/assets/') || path.startsWith('/favicon.ico')) {
    return path;
  }

  // 3. 处理绝对路径 (http/https)
  if (path.startsWith('http')) {
    // 智能识别“内部/私有”存储路径的通用启发式规则：
    // a) 包含 :9000 端口 (MinIO 默认端口)
    // b) 包含私有 IP 范围 (10.x, 172.16-31, 192.168) 或本地回环 (localhost/127.0.0.1)
    const privateNetworkPattern = /(?:192\.168\.|10\.|172\.(?:1[6-9]|2[0-9]|3[0-1])\.|localhost|127\.0\.0\.1)/;
    const hasMinioPort = path.includes(':9000');
    const isPrivate = privateNetworkPattern.test(path);

    if (hasMinioPort || isPrivate) {
      let relativePath = '';
      
      if (hasMinioPort) {
        // 如果包含 9000 端口，取其后的所有内容作为相对路径
        const parts = path.split(':9000/');
        if (parts.length > 1) relativePath = parts[1];
      } else {
        // 否则识别主机名后的路径部分
        try {
          const url = new URL(path);
          // 去掉开头的 /
          relativePath = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
          // 如果有查询参数也带上
          if (url.search) relativePath += url.search;
        } catch (e) {
          // Fallback if URL parsing fails
          const parts = path.split('://');
          if (parts.length > 1) {
            const pathMatch = parts[1].match(/^[^\/]+\/(.+)$/);
            if (pathMatch) relativePath = pathMatch[1];
          }
        }
      }

      if (relativePath) {
        const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
        const cleanStoragePrefix = globalStorageBaseUrl.replace(/^\//, '');
        if (cleanStoragePrefix && cleanPath.startsWith(cleanStoragePrefix + '/')) {
          return `/${cleanPath}`;
        }
        return `${globalStorageBaseUrl}/${cleanPath}`;
      }
    }

    // 若不是私有存储路径，则视为外部 CDN/公网资源，直接返回
    return path;
  }

  // 4. 处理已经是相对路径的情况 (如 bucket/file.jpg)
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const cleanStoragePrefix = globalStorageBaseUrl.replace(/^\//, '');
  if (cleanStoragePrefix && cleanPath.startsWith(cleanStoragePrefix + '/')) {
    return `/${cleanPath}`;
  }
  return `${globalStorageBaseUrl}/${cleanPath}`;
}
