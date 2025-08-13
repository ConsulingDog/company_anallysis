'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface WhiteboardNode {
  id: string;
  type: 'text' | 'card';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: {
    backgroundColor?: string;
    borderColor?: string;
    textColor?: string;
  };
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WhiteboardInterface() {
  const [isLoading, setIsLoading] = useState(false);
  const [whiteboardNodes, setWhiteboardNodes] = useState<WhiteboardNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();

  // 发送聊天消息
  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatInput,
          useWebSearch: false
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message || '抱歉，我无法处理您的请求。',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API响应失败');
      }
    } catch (error) {
      console.error('聊天API调用失败:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后再试。',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 处理从主页传递的查询参数
  useEffect(() => {
    const query = searchParams.get('query');
    if (query) {
      setSearchQuery(query);
      // 白板保持空白状态，不自动生成节点
    }
  }, [searchParams]);

  // 白板拖拽处理
  const handleWhiteboardMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  };

  const handleWhiteboardMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setViewport({
        ...viewport,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleWhiteboardMouseUp = () => {
    setIsDragging(false);
  };

  // 缩放处理
  const handleWhiteboardWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(3, viewport.scale * delta));
    setViewport({ ...viewport, scale: newScale });
  };

  // 重置视图
  const resetView = () => {
    setViewport({ x: 0, y: 0, scale: 1 });
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <span>←</span>
            <span>返回主页</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-lg font-semibold text-gray-900">
            {searchQuery ? `分析: ${searchQuery}` : '智能白板'}
          </h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={resetView}
            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 flex items-center space-x-1"
            title="重置视图"
          >
            <span>🎯</span>
            <span>重置</span>
          </button>
          <div className="text-sm text-gray-500 px-2">
            {Math.round(viewport.scale * 100)}%
          </div>
        </div>
      </div>

      {/* 主要内容区域 - 左右分栏 */}
      <div className="flex-1 flex">
        {/* 左侧白板画布 */}
        <div className="flex-1 relative overflow-hidden">
          <div 
            className="w-full h-full relative bg-white cursor-grab active:cursor-grabbing"
            onMouseDown={handleWhiteboardMouseDown}
            onMouseMove={handleWhiteboardMouseMove}
            onMouseUp={handleWhiteboardMouseUp}
            onWheel={handleWhiteboardWheel}
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)', 
              backgroundSize: `${20 * viewport.scale}px ${20 * viewport.scale}px`,
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              userSelect: 'none'
            }}
          >
            {/* 加载状态覆盖层 */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
                <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">🧠 AI正在分析中</h3>
                    <p className="text-gray-600">正在为您生成智能分析结果...</p>
                    <div className="mt-3 flex items-center justify-center space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 渲染白板节点 */}
            <div
              style={{
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                transformOrigin: '0 0',
                position: 'absolute',
                width: '100%',
                height: '100%'
              }}
            >
              {whiteboardNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute shadow-sm hover:shadow-md transition-shadow cursor-grab"
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    width: node.size.width,
                    height: node.size.height
                  }}
                >
                  <div
                    className="h-full w-full border-2 rounded-lg p-4"
                    style={{
                      backgroundColor: node.style?.backgroundColor || '#ffffff',
                      borderColor: node.style?.borderColor || '#d1d5db',
                      color: node.style?.textColor || '#374151'
                    }}
                  >
                    <div className="text-sm whitespace-pre-wrap overflow-hidden h-full">
                      {node.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧聊天区域 */}
        <div className={`bg-white border-l border-gray-200 transition-all duration-300 ${isChatOpen ? 'w-96' : 'w-16'}`}>
          {/* 聊天切换按钮 */}
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className="w-full flex items-center justify-center p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isChatOpen ? (
                  <>
                    <span className="mr-2">💬</span>
                    <span>收起聊天</span>
                  </>
                ) : (
                  <span className="text-xl">💬</span>
                )}
              </button>
            </div>

            {/* 聊天内容区域 */}
            {isChatOpen && (
              <>
                {/* 聊天消息列表 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <div className="text-4xl mb-2">🤖</div>
                      <p>开始与AI助手对话吧！</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 聊天输入区域 */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="输入消息..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={isChatLoading}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim() || isChatLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}