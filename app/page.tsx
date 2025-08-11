/**
 * 主页面组件 - Next.js 应用的根页面
 * 
 * 这个文件是 Next.js App Router 的主页面组件，对应访问根路径 "/" 时显示的内容。
 * 主要功能：
 * 1. 作为应用的入口页面
 * 2. 提供整体的页面布局和背景样式
 * 3. 渲染聊天界面组件
 */

// 导入聊天界面组件，使用 @ 别名指向项目根目录
// 从正确的相对路径导入 ChatInterface 组件
import ChatInterface from '../components/ChatInterface';

/**
 * Home 组件 - 应用主页
 * 
 * 这是一个 React 函数组件，作为 Next.js 应用的默认导出页面。
 * 当用户访问网站根路径时，会渲染这个组件。
 * 
 * @returns {JSX.Element} 返回包含聊天界面的主页面 JSX 元素
 */
export default function Home() {
  return (
    // 主容器元素，设置页面的整体样式
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 
        页面样式说明：
        - min-h-screen: 最小高度为屏幕高度，确保页面占满整个视口
        - bg-gradient-to-br: 背景渐变，从左上角到右下角
        - from-blue-50 to-indigo-100: 渐变颜色从浅蓝色到浅靛蓝色
        这样的设计提供了一个优雅的背景，适合聊天应用的界面
      */}
      
      {/* 渲染聊天界面组件 - 这是页面的核心功能组件 */}
      <ChatInterface />
    </main>
  );
}