# Serena MCP 连接指南

## 项目配置已创建

已在 `C:\Users\Admin\Desktop\codebuddy\.serena\project.yml` 创建 Serena 项目配置文件。

## 连接步骤

### 1. 确保 Serena 服务正在运行

在终端中运行：
```bash
# 检查 Serena 是否在运行
serena status

# 或者启动 Serena
serena start
```

### 2. 在 Serena 中打开项目

```bash
# 进入项目目录
cd C:\Users\Admin\Desktop\codebuddy

# 在 Serena 中打开
serena open .
```

### 3. 验证连接

在 Serena 中运行：
```
list_memories
```

如果成功，会显示项目的记忆文件列表。

## 可用的 Serena 功能

连接成功后，你可以：

- **读取记忆**：访问之前保存的项目知识
- **写入记忆**：保存重要的项目信息
- **搜索代码**：使用 Serena 的代码搜索功能
- **项目管理**：访问项目配置和设置

## 故障排除

如果连接失败：

1. 检查 Serena 服务是否在运行
2. 确认 MCP 端口是否正确（默认：24282）
3. 查看日志：`serena logs`

## 项目当前状态

- ✅ Next.js 14 网站项目
- ✅ Supabase 数据库集成
- ✅ Tailwind CSS 样式
- ✅ 用户认证系统
- ✅ 文章管理系统（含富文本编辑器）
- ✅ Analytics 分析页面
- ✅ v2.0 已部署到 Vercel
