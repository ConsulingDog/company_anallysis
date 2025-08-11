import { NextRequest, NextResponse } from 'next/server';
import { KimiClient } from '../../../lib/kimi-client';
// 导入提示词配置
import { PROMPTS } from '../../../lib/prompts';

// POST 是一个 HTTP 方法名称，表示这个函数会处理 HTTP POST 请求
// async 关键字表示这是一个异步函数，可以使用 await 等待异步操作完成
// request: NextRequest 表示函数接收一个 NextRequest 类型的参数，用于处理请求数据
export async function POST(request: NextRequest) {
  try {
    const { message, useWebSearch = true } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '请提供有效的消息内容' },
        { status: 400 }
      );
    }

    const kimiClient = new KimiClient();
    
    // 构建消息数组
    const messages = [
      {
        role: 'system' as const,
        content: PROMPTS.PERSON_ANALYSIS.system
      },
      {
        role: 'user' as const,
        content: PROMPTS.PERSON_ANALYSIS.userTemplate.replace('{name}', message)
      }
    ];

    let result;
    if (useWebSearch) {
      result = await kimiClient.chatWithWebSearch(messages);
    } else {
      result = await kimiClient.simpleChat(messages);
    }

    return NextResponse.json({
      message: result.content,
      usedWebSearch: result.usedWebSearch,
      searchInfo: result.searchInfo
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}



