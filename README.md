# Shodan 网络映射器

一个基于 Shodan API 的网络映射与漏洞分析平台。

## 特性

- 🔍 **先进的主机发现**：针对 IP 和域名的详细侦察
- 🛡️ **漏洞分析**：CVE 风险评估
- 📊 **数据可视化**：交互式图表和网络拓扑
- 🔔 **实时监控**：警报与持续扫描
- 📈 **报告导出**：多种格式输出
- 🌐 **全球数据**：充分利用 Shodan 庞大的互联网情报
- 🔑 **多个 API Key**：支持轮询使用多把 Shodan API Key
- 🔒 **访问密码**：可选的基础认证保护

## 快速开始

1. 在 [developer.shodan.io](https://developer.shodan.io) 获取 Shodan API Key。
2. 将 `.env.example` 复制为 `.env`，填写 `SHODAN_API_KEYS`、`APP_PASSWORD` 等配置，可通过 `CORS_ORIGIN` 指定前端地址。
3. 安装依赖：`npm run install-all`。
4. 启动开发环境：`npm run dev`。

## Docker 部署

```bash
docker build -t shodan-web .
docker run -d --env-file .env -p 3001:3001 shodan-web
```
如需跨域访问，可在 `.env` 中设置 `CORS_ORIGIN`。

## 主要 API

- `/api/shodan/host/:ip` 获取主机详情
- `/api/shodan/search` 搜索 Shodan 数据库
- `/api/analysis/vulnerabilities/:ip` 漏洞分析
- `/api/alerts` 监控与扫描接口
- `/api/shodan/domain/:domain` 域名信息查询

## 安全声明

本项目仅用于合法授权的安全研究与网络分析，使用者需遵守所在地的法律法规。
