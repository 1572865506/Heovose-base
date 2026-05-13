import { NextResponse } from 'next/server';
import { testSMTPConnection } from '@/lib/mail';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { host, port, secure, user, pass, to } = body;

    if (!host || !port || !user || !pass || !to) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await testSMTPConnection({
      host,
      port: parseInt(port),
      secure: secure === 'true' || secure === true,
      user,
      pass,
      to
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API Test Email] Error:', error);
    
    // 转换技术错误为用户友好的中文提示
    let friendlyMessage = '测试邮件发送失败，请检查配置。';
    const errorStr = String(error.message || '');
    
    if (errorStr.includes('wrong version number')) {
      friendlyMessage = 'SMTP 加密协议与端口不匹配。建议：465端口开启SSL，587端口关闭SSL。';
    } else if (errorStr.includes('ECONNREFUSED')) {
      friendlyMessage = '连接被拒绝。请检查 SMTP 地址和端口是否正确，或服务器是否允许外网连接。';
    } else if (errorStr.includes('ETIMEDOUT')) {
      friendlyMessage = '连接超时。请检查网络状态或防火墙是否拦截了邮件端口。';
    } else if (errorStr.includes('535') || errorStr.includes('Invalid login') || error.code === 'EAUTH') {
      friendlyMessage = '身份验证失败。请检查 SMTP 用户名和密码（或授权码）是否正确。';
    } else if (errorStr.includes('ENOTFOUND')) {
      friendlyMessage = '无法解析 SMTP 主机地址，请检查域名是否拼写正确。';
    }

    return NextResponse.json({ 
      error: friendlyMessage,
      technicalDetail: error.message,
      code: error.code
    }, { status: 500 });
  }
}
