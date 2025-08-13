'use client';
// 可用首页
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface RecentProject {
  id: string;
  title: string;
  description: string;
  lastEdited: string;
  type: 'company' | 'person' | 'product';
}

interface CommunityProject {
  id: string;
  title: string;
  description: string;
  author: string;
  avatar: string;
  category: string;
  likes: number;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [communityProjects, setCommunityProjects] = useState<CommunityProject[]>([]);

  // 模拟数据
  useEffect(() => {
    // 模拟最近项目数据
    setRecentProjects([
      {
        id: '1',
        title: '苹果公司分析',
        description: '对苹果公司的全面企业分析报告',
        lastEdited: '2024年1月15日',
        type: 'company'
      },
      {
        id: '2',
        title: '马云个人档案',
        description: '阿里巴巴创始人马云的详细背景分析',
        lastEdited: '2024年1月14日',
        type: 'person'
      },
      {
        id: '3',
        title: 'iPhone产品研究',
        description: 'iPhone系列产品的市场分析和技术特点',
        lastEdited: '2024年1月13日',
        type: 'product'
      },
      {
        id: '4',
        title: '特斯拉公司',
        description: '电动汽车领域的创新企业分析',
        lastEdited: '2024年1月12日',
        type: 'company'
      }
    ]);

    // 模拟社区项目数据
    setCommunityProjects([
      {
        id: '1',
        title: '2024年科技巨头对比分析',
        description: '深度对比苹果、谷歌、微软等科技公司的发展策略',
        author: '科技观察者',
        avatar: '🔍',
        category: '企业分析',
        likes: 128,
        createdAt: '3天前'
      },
      {
        id: '2',
        title: '新能源汽车行业领袖分析',
        description: '分析特斯拉、比亚迪等企业创始人的领导风格',
        author: '商业分析师',
        avatar: '⚡',
        category: '人物分析',
        likes: 95,
        createdAt: '5天前'
      },
      {
        id: '3',
        title: 'AI芯片市场竞争格局',
        description: '英伟达、AMD、英特尔在AI芯片领域的竞争分析',
        author: '硬件专家',
        avatar: '🧠',
        category: '产品分析',
        likes: 76,
        createdAt: '1周前'
      },
      {
        id: '4',
        title: '互联网大厂组织架构研究',
        description: '腾讯、阿里、字节跳动的组织结构对比',
        author: '组织研究员',
        avatar: '🏢',
        category: '企业分析',
        likes: 203,
        createdAt: '1周前'
      }
    ]);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // 跳转到白板页面并传递搜索查询
      router.push(`/whiteboard?query=${encodeURIComponent(searchQuery)}`);
    } else {
      // 如果搜索为空，跳转到空白板
      router.push('/whiteboard');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'person': return '👤';
      case 'product': return '📱';
      default: return '📄';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '企业分析': return 'bg-blue-100 text-blue-800';
      case '人物分析': return 'bg-green-100 text-green-800';
      case '产品分析': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-2xl font-bold text-gray-900">Lovart</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                Referral Link
              </button>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Upgrade
              </button>
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                肖
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            What are we creating today, 肖洋?
          </h1>
          
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Start with a creative idea or task"
                className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <span className="text-xl">📎</span>
                </button>
                <button 
                  onClick={handleSearch}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <span className="text-xl">🚀</span>
                </button>
              </div>
            </div>
            
            {/* 快捷标签 */}
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              {['Branding', 'Posters', 'Ads', 'Character Design', 'Videos'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearchQuery(tag)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Projects 区域 */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">📁</span>
              Recent Projects
            </h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              See All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 新建项目卡片 */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-gray-400 cursor-pointer transition-colors">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-3">
                <span className="text-white text-2xl">+</span>
              </div>
              <span className="text-gray-600 font-medium">New Project</span>
            </div>
            
            {/* 最近项目卡片 */}
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-4xl">{getProjectIcon(project.type)}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate">{project.title}</h3>
                <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                <p className="text-xs text-gray-400">Last edited on {project.lastEdited}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Created by Lovarters 区域 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Created by Lovarters</h2>
            <div className="flex space-x-2">
              {['All', 'Branding', 'Poster & Ad', 'Illustration', 'UI', 'Character Design', 'Video & Storyboard', 'Product Design', 'Architectural Design'].map((filter) => (
                <button
                  key={filter}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === 'All' 
                      ? 'bg-black text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityProjects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  <span className="text-6xl">{project.avatar}</span>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(project.category)}`}>
                      {project.category}
                    </span>
                    <div className="flex items-center text-gray-400 text-sm">
                      <span className="mr-1">❤️</span>
                      <span>{project.likes}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{project.title}</h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">{project.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>by {project.author}</span>
                    <span>{project.createdAt}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}