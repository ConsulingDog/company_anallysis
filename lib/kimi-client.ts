import OpenAI from 'openai';

export class KimiClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.KIMI_API_KEY || "sk-WeNPPPvPyYodbFjn145a23tbucmEuVbEwMH0UhXDZooESpdK",
      baseURL: "https://api.moonshot.cn/v1"
    });
  }

  async chatWithWebSearch(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    try {
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
        const completion = await this.client.chat.completions.create({
           model: "kimi-k2-turbo-preview", // 使用 Kimi K2 模型进行联网搜索
           messages: currentMessages,
           temperature: 0.1,
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

          // tool_calls 可能是多个，因此我们使用循环逐个执行
          for (const toolCall of choice.message.tool_calls!) {
            const tool_call_name = toolCall.function.name;
            const tool_call_arguments = JSON.parse(toolCall.function.arguments);

            console.log('Tool Call Name:', tool_call_name);
            console.log('Tool Call Arguments:', tool_call_arguments);

            let tool_result;
            if (tool_call_name === "$web_search") {
              console.log('执行联网搜索...');
              tool_result = tool_call_arguments; // 对于内置函数，直接返回参数
            } else {
              tool_result = 'no tool found';
            }

            console.log('Tool Result:', tool_result);

            // 使用函数执行结果构造一个 role=tool 的 message
            // 需要在 message 中提供 tool_call_id 和 name 字段
            currentMessages.push({
              "role": "tool",
              "tool_call_id": toolCall.id,
              "name": tool_call_name,
              "content": JSON.stringify(tool_result),
            } as any);
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
      }

      // 如果循环结束但没有返回，说明出现了意外情况
      throw new Error('Unexpected end of tool call loop');
    } catch (error) {
      console.error('Kimi API Error:', error);
      throw new Error('调用Kimi API时发生错误');
    }
  }

  async simpleChat(messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[]) {
    try {
      const response = await this.client.chat.completions.create({
        model: "kimi-k2-turbo-preview",
        messages: messages,
        temperature: 0.6,
        max_tokens: 4000 // 增加输出长度限制，确保完整输出
      });

      return {
      content: response.choices[0].message.content,
      usedWebSearch: false,
      searchInfo: null
    };
    } catch (error) {
      console.error('Kimi API Error:', error);
      throw new Error('调用Kimi API时发生错误');
    }
  }
}