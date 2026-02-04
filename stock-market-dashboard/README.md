# 股票板块行情实时看板

这是一个实时显示中国A股市场各行业板块表现的React应用，使用腾讯财经和东方财富网的API获取真实市场数据。

## 功能特性

- 实时显示各大行业板块的整体表现
- 展示每个板块内的龙头股票
- 支持板块详情页面，查看具体股票信息
- 移动端友好的响应式设计
- 自动刷新数据，每5秒更新一次

## 技术栈

- React 18
- TypeScript
- React Router
- CSS Modules
- 代理服务器用于绕过API限制

## 数据来源

- 主要数据源：腾讯财经API
- 备用数据源：东方财富网API
- 当API不可用时自动切换到模拟数据

## 安装与运行

1. 克隆项目：
```bash
git clone https://github.com/tuajoiuf/myOpenClaw.git
cd stock-market-dashboard
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

4. 在浏览器中打开 `http://localhost:3000` 查看应用

## 生产构建

```bash
npm run build
```

## 部署

应用已部署在 GitHub Codespaces 中，可通过以下 URL 访问：
https://verbose-goggles-g7v7rgj77j7259p-3005.app.github.dev/

## 项目结构

```
src/
├── components/          # React组件
│   ├── Dashboard.tsx    # 主仪表板
│   ├── SectorCard.tsx   # 板块卡片
│   ├── StockCard.tsx    # 股票卡片
│   ├── SectorDetail.tsx # 板块详情页
│   ├── Favorites.tsx    # 收藏页面
│   └── Layout.tsx       # 主布局
├── services/            # API服务
│   └── stockApi.ts      # 股票数据API
├── utils/               # 工具函数
│   └── stockDataGenerator.ts # 数据生成器
├── types/               # TypeScript类型定义
│   └── StockTypes.ts    # 股票相关类型
├── styles/              # 样式文件
└── setupProxy.js        # 代理配置文件
```

## API代理配置

由于前端无法直接访问第三方API，我们在开发环境中配置了代理：
- `/api/stock/*` -> 转发到腾讯财经API
- `/api/eastmoney/*` -> 转发到东方财富网API

## 注意事项

- 应用使用的是免费的公共API，可能会有访问频率限制
- 当API不可用时，应用会自动切换到模拟数据以保证用户体验
- 在生产环境中建议使用付费的金融数据API服务以获得更稳定的数据源