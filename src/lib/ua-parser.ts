export function parseUA(ua: string) {
  const device = {
    type: 'Desktop',
    browser: 'Unknown',
    os: 'Unknown'
  };

  if (!ua) return device;

  // Device type
  if (/mobile/i.test(ua)) device.type = 'Mobile';
  else if (/tablet/i.test(ua)) device.type = 'Tablet';

  // Browser
  if (/chrome|crios/i.test(ua) && !/edge|opr|opera|brave/i.test(ua)) device.browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) device.browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) device.browser = 'Firefox';
  else if (/edge|edg/i.test(ua)) device.browser = 'Edge';
  else if (/opr|opera/i.test(ua)) device.browser = 'Opera';

  // OS
  if (/windows/i.test(ua)) device.os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) device.os = 'macOS';
  else if (/android/i.test(ua)) device.os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) device.os = 'iOS';
  else if (/linux/i.test(ua)) device.os = 'Linux';

  return device;
}
