# 公司实体分析聊天助手

基于Kimi K2 API的智能公司实体规范化和人员分析工具，支持联网搜索功能。

## 功能特性

- 🏢 **公司实体规范化**: 从产品名称或人名中识别并规范化公司实体
- 👥 **人员详细分析**: 对公司相关人员进行深度分析
- 🌐 **联网搜索**: 集成Kimi K2内置的联网搜索功能，获取最新信息
- 📊 **结构化输出**: 严格按照JSON Schema格式输出分析结果
- 💬 **实时聊天**: 现代化的聊天界面，支持实时对话

## 技术栈

- **前端**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **AI模型**: Kimi K2 (kimi-k2-turbo-preview)
- **API**: Moonshot AI Kimi API

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local` 文件并配置你的Kimi API密钥：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```
KIMI_API_KEY=your_kimi_api_key_here
KIMI_BASE_URL=https://api.moonshot.cn/v1
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 支持的查询类型

1. **公司名称**: 如"苹果公司"、"Apple Inc."
2. **产品名称**: 如"iPhone"、"微信"
3. **人员姓名**: 如"马云"、"Tim Cook"

### 输出格式

系统会返回结构化的JSON数据，包含：

- **CompanySet**: 公司实体信息
  - 公司正式名称和别名
  - 高管信息（CEO、CTO、CMO）
  - 核心贡献者
  - 主要产品
  - 总部位置和成立年份

- **related_persons**: 相关人员详细信息
  - 基础信息（姓名、年龄、职位）
  - 工作经历
  - 教育背景
  - 技能迁移分析

### 联网搜索功能

应用集成了Kimi K2的内置联网搜索功能，能够：

- 自动判断是否需要联网搜索
- 获取最新的公司和人员信息
- 提供更准确和及时的分析结果

## 项目结构

```
├── app/
│   ├── api/chat/          # API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页面
├── components/
│   └── ChatInterface.tsx # 聊天界面组件
├── lib/
│   ├── kimi-client.ts    # Kimi API客户端
│   └── prompts.ts        # 提示词配置
└── README.md
```

## API说明

### POST /api/chat

发送聊天消息并获取分析结果。

**请求体**:
```json
{
  "message": "查询内容",
  "useWebSearch": true
}
```

**响应**:
```json
{
  "message": "分析结果",
  "usedWebSearch": true
}
```

## 开发说明

### 自定义提示词

可以在 `lib/prompts.ts` 中修改系统提示词，调整分析逻辑和输出格式。

### 扩展功能

- 添加更多分析维度
- 支持批量查询
- 集成其他AI模型
- 添加数据导出功能

## 注意事项

1. 确保Kimi API密钥有效且有足够的配额
2. 联网搜索功能需要网络连接
3. 大量请求可能会触发API限制

## 许可证

MIT License
