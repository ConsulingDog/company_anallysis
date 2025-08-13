import OpenAI from 'openai';

// 全局速率限制管理
class RateLimitManager {
  private static instance: RateLimitManager;
  private lastRequestTime: number = 0;
  private requestQueue: Array<() => void> = [];
  private isProcessing: boolean = false;
  
  static getInstance(): RateLimitManager {
    if (!RateLimitManager.instance) {
      RateLimitManager.instance = new RateLimitManager();
    }
    return RateLimitManager.instance;
  }
  
  async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      this.requestQueue.push(resolve);
      this.processQueue();
    });
  }
  
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      const minInterval = 25000; // 25秒间隔，确保不超过每分钟3个请求
      
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`等待 ${waitTime}ms 以避免速率限制...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      this.lastRequestTime = Date.now();
      const resolve = this.requestQueue.shift()!;
      resolve();
      
      // 给其他请求一些处理时间
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.isProcessing = false;
  }
}

export class KimiClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KIMI_API_KEY || "sk-WeNPPPvPyYodbFjn145a23tbucmEuVbEwMH0UhXDZooESpdK",
      baseURL: "https://api.moonshot.cn/v1"
    });
  }

  async chatWithWebSearch(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    const maxRetries = 5;
    let retryCount = 0;
    const rateLimitManager = RateLimitManager.getInstance();

    while (retryCount <= maxRetries) {
      try {
        // 等待获得请求槽位
        await rateLimitManager.waitForSlot();
        const tools = [
          {
            "type": "builtin_function",
            "function": {
              "name": "$web_search",
            },
          }
        ];

        let currentMessages = [...messages];
        let finishReason: string | null = null;
        let usedWebSearch = false;

        // 循环处理可能的多次工具调用
        while (finishReason === null || finishReason === "tool_calls") {
          try {
            const completion = await this.client.chat.completions.create({
               model: "kimi-k2-turbo-preview", // 使用 Kimi K2 模型进行联网搜索
               messages: currentMessages,
               temperature: 0,
               max_tokens: 4000, // 增加输出长度限制，确保完整输出
               tools: tools as any, // 通过 tools 参数，将定义好的 tools 提交给 Kimi 大模型
             });

            const choice = completion.choices[0];
            console.log('Kimi Choice:', choice);
            
            finishReason = choice.finish_reason;
            console.log('Finish Reason:', finishReason);

            if (finishReason === "tool_calls") {
              usedWebSearch = true;
              // 将 Kimi 大模型返回给我们的 assistant 消息也添加到上下文中
              currentMessages.push(choice.message);

              // 处理工具调用结果
              for (const toolCall of choice.message.tool_calls || []) {
                if (toolCall.function.name === "$web_search") {
                  console.log('Web search performed:', toolCall.function.arguments);
                  // 添加工具调用结果到消息历史
                  currentMessages.push({
                    role: "tool",
                    content: "搜索已完成，请基于搜索结果回答用户问题。",
                    tool_call_id: toolCall.id,
                  });
                }
              }
            } else {
              // 没有工具调用，返回最终结果
              console.log('Final Response:', choice.message.content);
              return {
                content: choice.message.content,
                usedWebSearch: usedWebSearch,
                searchInfo: usedWebSearch ? {
                  searchPerformed: true,
                  timestamp: new Date().toISOString(),
                  note: "此回答基于最新的联网搜索结果"
                } : null
              };
            }
          } catch (apiError: any) {
             console.log('捕获到API错误:', apiError.constructor.name, apiError.status);
             
             // 检查是否是速率限制错误 - 检查多种可能的错误类型
             const isRateLimitError = apiError?.status === 429 || 
                                     apiError?.type === 'rate_limit_reached_error' || 
                                     apiError?.error?.type === 'rate_limit_reached_error' ||
                                     (apiError.constructor.name === 'RateLimitError');
              
             if (isRateLimitError && retryCount < maxRetries) {
               // 从headers中获取重试时间，如果没有则使用指数退避策略
               const retryAfter = apiError?.headers?.['x-retry-after'] || 
                                 apiError?.headers?.['retry-after'];
               
               // 使用指数退避策略：基础等待时间 * 2^重试次数，最少30秒
               const baseWaitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000; // 30秒基础等待
               const exponentialWaitTime = Math.min(baseWaitTime * Math.pow(2, retryCount), 300000); // 最多5分钟
               const waitTime = Math.max(exponentialWaitTime, 30000); // 至少等待30秒
               
               console.log(`速率限制错误，等待 ${waitTime}ms 后重试... (第 ${retryCount + 1}/${maxRetries} 次重试)`);
               
               await new Promise(resolve => setTimeout(resolve, waitTime));
               retryCount++;
               // 重新开始整个请求流程
               finishReason = null;
               currentMessages = [...messages];
               usedWebSearch = false;
               break; // 跳出内层循环，重新开始外层循环
             } else {
               // 如果不是速率限制错误或已达到最大重试次数，重新抛出错误
               throw apiError;
             }
          }
        }

        // 如果到达这里且没有返回，说明出现了意外情况
        if (retryCount > maxRetries) {
          throw new Error('达到最大重试次数，调用Kimi API失败');
        }
      } catch (error: any) {
        // 如果是非速率限制错误，直接抛出
        if (retryCount >= maxRetries) {
          throw new Error('达到最大重试次数，调用Kimi API失败');
        }
        throw error;
      }
    }
    
    throw new Error('调用Kimi API时发生未知错误');
  }

  async simpleChat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    const maxRetries = 5;
    let retryCount = 0;
    const rateLimitManager = RateLimitManager.getInstance();

    while (retryCount <= maxRetries) {
      try {
        // 等待获得请求槽位
        await rateLimitManager.waitForSlot();
        const completion = await this.client.chat.completions.create({
          model: "kimi-k2-turbo-preview",
          messages: messages,
          temperature: 0,
          max_tokens: 4000,
        });

        const choice = completion.choices[0];
        console.log('Kimi Response:', choice.message.content);
        
        return {
          content: choice.message.content,
          usedWebSearch: false,
          searchInfo: null
        };
      } catch (error: any) {
        console.error('Kimi API Error:', error);
        
        // 检查是否是速率限制错误 - 检查多种可能的错误类型
        const isRateLimitError = error?.status === 429 || 
                                error?.type === 'rate_limit_reached_error' || 
                                error?.error?.type === 'rate_limit_reached_error' ||
                                (error.constructor.name === 'RateLimitError');
         
        if (isRateLimitError && retryCount < maxRetries) {
          // 从headers中获取重试时间，如果没有则使用指数退避策略
          const retryAfter = error?.headers?.['x-retry-after'] || 
                            error?.headers?.['retry-after'];
          
          // 使用指数退避策略：基础等待时间 * 2^重试次数，最少30秒
          const baseWaitTime = retryAfter ? parseInt(retryAfter) * 1000 : 30000; // 30秒基础等待
          const exponentialWaitTime = Math.min(baseWaitTime * Math.pow(2, retryCount), 300000); // 最多5分钟
          const waitTime = Math.max(exponentialWaitTime, 30000); // 至少等待30秒
          
          console.log(`速率限制错误，等待 ${waitTime}ms 后重试... (第 ${retryCount + 1}/${maxRetries} 次重试)`);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        
        // 如果不是速率限制错误或已达到最大重试次数，抛出错误
        throw new Error('调用Kimi API时发生错误');
      }
    }
  }
}