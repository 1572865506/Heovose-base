import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // 定义压力测试阶段，模拟 50 个并发用户 (VUs)
  stages: [
    { duration: '10s', target: 50 }, // 10秒内线性提升至 50 个并发用户
    { duration: '20s', target: 50 }, // 20秒内持续进行 50 个并发高频请求测试
    { duration: '5s', target: 0 },  // 5秒内停止测试
  ],
};

export default function () {
  // 由于您的本地服务在 9002 端口，此处配置 localhost:9002
  const url = 'http://localhost:9002/auth/login';
  
  // 模拟发送登录请求
  const payload = JSON.stringify({
    email: 'admin@heovose.com',
    password: 'admin23',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      // 模拟 Next.js Server Action 标识，使其作为接口写操作运行
      'Next-Action': 'mock-action-id-for-bruteforce-test',
    },
  };

  const res = http.post(url, payload, params);

  // 验证限流情况
  check(res, {
    '请求响应成功或被安全限流': (r) => r.status === 200 || r.status === 429,
    '触发限流 (429 Rate Limited)': (r) => r.status === 429,
  });

  // 模拟真实用户短暂的间隔，高频并发时仍会迅速消耗完每分钟 10 次的配额
  sleep(0.2); 
}
