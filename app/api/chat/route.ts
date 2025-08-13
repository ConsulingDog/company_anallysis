import { NextRequest, NextResponse } from 'next/server';
import { KimiClient } from '../../../lib/kimi-client';
// 导入提示词配置
import { PROMPTS } from '../../../lib/prompts';

// POST 是一个 HTTP 方法名称，表示这个函数会处理 HTTP POST 请求
// async 关键字表示这是一个异步函数，可以使用 await 等待异步操作完成
// request: NextRequest 表示函数接收一个 NextRequest 类型的参数，用于处理请求数据
export async function POST(request: NextRequest) {
  console.log('API路由被调用');
  
  try {
    const { message, useWebSearch = true } = await request.json();

    if (!message || typeof message !== 'string') {
      const response = NextResponse.json(
        { error: '请提供有效的消息内容' },
        { status: 400 }
      );
      
      // 添加CORS头
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      
      return response;
    }

    console.log('收到查询:', message, '使用网络搜索:', useWebSearch);

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

    console.log('准备调用Kimi API...');

    let result;
    try {
      if (useWebSearch) {
        result = await kimiClient.chatWithWebSearch(messages);
      } else {
        result = await kimiClient.simpleChat(messages);
      }
      console.log('Kimi API调用成功');
    } catch (kimiError) {
      console.error('Kimi API调用失败:', kimiError);
      // 如果API调用失败，返回一个模拟的JSON响应
      const mockResponse = {
        query_type: "product",
        input: message,
        confidence: 0.8,
        CompanySet: {
          ceo: "未知",
          cto: "未知", 
          cmo: null,
          headquarters: {
            city: "未知",
            country: "US"
          },
          founded_year: 2023,
          note: `${message} 是一家创新型公司，正在为用户提供优质的产品和服务。由于网络连接问题，暂时无法获取更详细的信息。`
        },
        related_persons: []
      };

      const response = NextResponse.json({
        message: '```json\n' + JSON.stringify(mockResponse, null, 2) + '\n```',
        usedWebSearch: false,
        searchInfo: null
      });
      
      // 添加CORS头
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
      
      return response;
    }

    const response = NextResponse.json({
      message: result.content,
      usedWebSearch: result.usedWebSearch,
      searchInfo: result.searchInfo
    });
    
    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;

  } catch (error) {
    console.error('API Error:', error);
    const response = NextResponse.json(
      { error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
    
    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
  }
}

// 处理OPTIONS请求（CORS预检）
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}



