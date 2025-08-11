'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  usedWebSearch?: boolean;
  searchInfo?: {
    searchPerformed: boolean;
    timestamp: string;
    note: string;
  } | null;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          useWebSearch: useWebSearch
        }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        usedWebSearch: data.usedWebSearch,
        searchInfo: data.searchInfo
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `抱歉，发生了错误：${error instanceof Error ? error.message : '未知错误'}`,
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string, usedWebSearch?: boolean, searchInfo?: any) => {
    // 如果内容为空或undefined，显示默认消息
    if (!content || content.trim() === '') {
      return (
        <div className="space-y-3">
          {searchInfo && searchInfo.searchPerformed && (
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🌐</span>
                  <div>
                    <h4 className="font-semibold text-blue-800">联网搜索已启用</h4>
                    <p className="text-sm text-blue-600">{searchInfo.note}</p>
                  </div>
                </div>
                <div className="text-xs text-blue-500">
                  {new Date(searchInfo.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          )}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-gray-500">模型返回了空内容，请重试或检查输入。</div>
          </div>
        </div>
      );
    }

    // 直接显示模型返回的内容，不进行复杂的JSON解析
    return (
      <div className="space-y-3">
        {searchInfo && searchInfo.searchPerformed && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🌐</span>
                <div>
                  <h4 className="font-semibold text-blue-800">联网搜索已启用</h4>
                  <p className="text-sm text-blue-600">{searchInfo.note}</p>
                </div>
              </div>
              <div className="text-xs text-blue-500">
                {new Date(searchInfo.timestamp).toLocaleString()}
              </div>
            </div>
          </div>
        )}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="whitespace-pre-wrap leading-relaxed text-gray-800">{content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg flex flex-col chat-container">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
          <h1 className="text-xl font-bold">公司实体分析聊天助手</h1>
          <p className="text-sm opacity-90">基于Kimi K2的智能公司实体规范化和人员分析工具</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 messages-container">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p className="text-lg mb-2">👋 欢迎使用公司实体分析助手</p>
              <p>请输入公司名称、产品名称或人员姓名进行分析</p>
              <div className="mt-4 text-sm">
                <p>示例查询：</p>
                <div className="mt-2 space-y-2">
                  <div className="bg-blue-50 p-2 rounded">
                    <p className="font-medium text-blue-800">📊 公司实体分析：</p>
                    <ul className="list-disc list-inside ml-4 text-blue-700">
                      <li>苹果公司</li>
                      <li>特斯拉</li>
                      <li>iPhone</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 p-2 rounded">
                    <p className="font-medium text-green-800">👤 人员分析：</p>
                    <ul className="list-disc list-inside ml-4 text-green-700">
                      <li>马云</li>
                      <li>埃隆·马斯克</li>
                    </ul>
                  </div>
                  <div className="bg-orange-50 p-2 rounded">
                    <p className="font-medium text-orange-800">🌐 联网搜索查询：</p>
                    <ul className="list-disc list-inside ml-4 text-orange-700">
                      <li>2024年10月8日的中国A股指数是多少？</li>
                      <li>最新的苹果公司股价</li>
                      <li>特斯拉最新财报</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`message-bubble p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'user-message text-white'
                    : 'assistant-message text-white'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div>
                    {formatMessage(message.content, message.usedWebSearch, message.searchInfo)}
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
                <div className="text-xs opacity-75 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="message-bubble p-3 rounded-lg assistant-message text-white">
                <div className="loading-dots">正在分析中...</div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-center mb-2">
            <label className="flex items-center text-sm text-gray-600">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(e) => setUseWebSearch(e.target.checked)}
                className="mr-2"
              />
              启用联网搜索
            </label>
          </div>
          <div className="flex space-x-2">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入公司名称、产品名称或人员姓名..."
              className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '分析中...' : '发送'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}