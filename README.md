# 琉璃月图床

[English](#english) | 简体中文

> 琉璃月图床是一个基于 Vue 3 + Go 构建的现代化图床服务，提供快速、稳定的图片存储和访问体验。支持本地存储、数据库管理，以及灵活的部署方案。

## 项目特色

- 🚀 **高性能架构**: 前端 Vue 3 + 后端 Go，性能卓越
- 💾 **数据库支持**: MySQL 存储图片元数据，便于管理
- 🔒 **安全可靠**: 文件类型验证、大小限制、防重复上传
- 🎨 **现代化UI**: 基于 shadcn-vue 组件库，界面美观
- 🐳 **容器化部署**: 支持 Docker 一键部署
- 🌐 **多种部署**: 支持 Cloudflare Pages、Vercel、自建服务器

## 技术栈

### 前端
- **Vue 3** - 渐进式 JavaScript 框架
- **TypeScript** - 类型安全
- **Vite** - 现代化构建工具
- **Tailwind CSS** - 原子化 CSS 框架
- **shadcn-vue** - 高质量组件库

### 后端
- **Go** - 高性能编程语言
- **Gin** - 轻量级 Web 框架
- **GORM** - 优雅的 ORM 库
- **MySQL** - 可靠的关系型数据库

## 快速开始

### 方式一：完整部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd IMG
```

2. **启动后端服务**
```bash
cd go-backend
go mod tidy
go run main.go
```

3. **启动前端服务**
```bash
cd ..
pnpm install
pnpm dev
```

4. **访问应用**
- 前端: http://localhost:5175
- 后端: http://localhost:3001

### 方式二：Docker 部署

```bash
cd go-backend
docker-compose up -d
```

### 方式三：云端部署

**Vercel 一键部署**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

**Cloudflare Pages 部署**

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://dash.cloudflare.com/?to=/:account/workers-and-pages/create)

## 配置说明

### 环境变量

**前端配置** (`.env.dev`)
```env
VITE_IMG_API_URL=http://localhost:3001
```

**后端配置** (`.env`)
```env
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
PORT=3001
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=15728640
```

## API 接口

### 上传图片
```http
POST /upload
Content-Type: multipart/form-data

Body: file (image file)

Response:
{
  "data": {
    "link": "http://localhost:3001/v2/uuid-filename.jpg"
  },
  "success": true,
  "status": 200
}
```

### 访问图片
```http
GET /v2/{filename}
```

### 获取图片信息
```http
GET /api/image/{filename}
```

## 项目结构

```
琉璃月图床/
├── src/                    # 前端源码
│   ├── components/         # Vue 组件
│   ├── views/             # 页面组件
│   ├── utils/             # 工具函数
│   └── assets/            # 静态资源
├── go-backend/            # Go 后端
│   ├── handlers/          # 请求处理器
│   ├── models/            # 数据模型
│   ├── config/            # 配置管理
│   └── uploads/           # 文件存储
├── functions/             # Cloudflare Functions
└── public/                # 公共资源
```

## 部署指南

### 生产环境优化

1. **Nginx 反向代理**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /v2/ {
        alias /path/to/uploads/;
        expires 1y;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
    }
}
```

2. **性能优化**
- 启用 Gzip 压缩
- 配置 CDN 加速
- 设置文件缓存策略

3. **安全加固**
- 配置 HTTPS
- 限制上传频率
- 添加用户认证

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目！

## 开源协议

本项目基于 MIT 协议开源。

---

## English

# Liuli Moon Image Hosting

A modern image hosting service built with Vue 3 + Go, providing fast and stable image storage and access experience.

## Features

- 🚀 **High Performance**: Vue 3 frontend + Go backend
- 💾 **Database Support**: MySQL for metadata storage
- 🔒 **Secure & Reliable**: File validation, size limits, anti-duplication
- 🎨 **Modern UI**: Built with shadcn-vue components
- 🐳 **Containerized**: Docker deployment support
- 🌐 **Multiple Deployment**: Cloudflare Pages, Vercel, self-hosted

## Tech Stack

**Frontend**: Vue 3, TypeScript, Vite, Tailwind CSS, shadcn-vue
**Backend**: Go, Gin, GORM, MySQL

## Quick Start

See Chinese documentation above for detailed setup instructions.

## License

MIT License