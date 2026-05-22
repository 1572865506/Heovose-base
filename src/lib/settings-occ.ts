/**
 * 为从数据库中读取的配置值进行 JSON 解析并隐式注入初始的 _version 属性（如果它是对象且没有版本）
 */
export function prepareSettingDataForGet(valueStr: string | null): any {
  if (!valueStr) return {};
  try {
    const parsed = JSON.parse(valueStr);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      if (typeof parsed._version !== 'number') {
        parsed._version = 0;
      }
      return parsed;
    }
    return parsed;
  } catch (error) {
    // 无法解析为 JSON，可能是简单的字符串
    return valueStr;
  }
}

/**
 * 校验客户端上传的数据的版本，并在无冲突时使版本号递增。
 * 返回 { hasConflict: boolean; currentVersion?: number; nextData?: any }
 */
export function verifyAndIncrementVersion(
  currentValueStr: string | null,
  clientData: any
): { hasConflict: boolean; currentVersion?: number; nextData?: any } {
  // 如果客户端提交的不是对象，不适合做 JSON 版本管理，直接通过
  if (!clientData || typeof clientData !== 'object' || Array.isArray(clientData)) {
    return { hasConflict: false, nextData: clientData };
  }

  let currentVersion = 0;
  if (currentValueStr) {
    try {
      const currentParsed = JSON.parse(currentValueStr);
      if (currentParsed && typeof currentParsed === 'object' && !Array.isArray(currentParsed)) {
        currentVersion = typeof currentParsed._version === 'number' ? currentParsed._version : 0;
      }
    } catch (e) {
      // 数据库里不是 JSON，视为默认 version 0
    }
  }

  const clientVersion = typeof clientData._version === 'number' ? clientData._version : 0;

  // 冲突校验：如果数据库中的最新版本 > 0，且客户端版本不等于数据库当前版本，则发生并发冲突
  if (currentVersion > 0 && clientVersion !== currentVersion) {
    return { hasConflict: true, currentVersion };
  }

  // 否则，允许升级，并将版本递增
  const nextData = {
    ...clientData,
    _version: currentVersion + 1
  };

  return { hasConflict: false, nextData };
}
