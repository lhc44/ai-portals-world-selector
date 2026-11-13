# Portals World Selector · 世界漫游

> **471 个程序化生成的 3D 世界，挑选一个，慢慢探索。**

本项目基于 [Ethan Mollick / ai-portals](https://github.com/emollick/ai-portals) 二次开发。保留原项目的世界生成器、Three.js 渲染能力和场景资源，把默认的“连续随机穿越世界”改为**世界选择大厅 → 进入指定世界 → 留在当前世界探索**。

项目是**纯前端静态网站**：无需数据库、无需后端 API，也无需登录。桌面浏览器与支持 WebGL 的移动浏览器均可使用。

## 目录

- [功能与改动](#功能与改动)
- [使用方法](#使用方法)
- [本地开发与构建](#本地开发与构建)
- [项目结构](#项目结构)
- [Linux 服务器部署教程](#linux-服务器部署教程)
- [更新、运维与故障排查](#更新运维与故障排查)
- [技术原理与限制](#技术原理与限制)
- [版权与致谢](#版权与致谢)

## 功能与改动

| 功能 | 当前实现 |
| --- | --- |
| 471 个 3D 世界 | 保留原项目的世界定义、生成逻辑和缩略图 |
| 世界选择大厅 | 首页以卡片、缩略图和简介展示全部世界 |
| 分类与搜索 | 按场景类别筛选，搜索英文名称/描述，支持不同排序 |
| 指定场景 | 点击卡片进入选定世界，地址包含世界 ID |
| 固定场景 | 探索时不再自动跳转到下一座传送门或随机世界 |
| 自由观察 | 鼠标或手指拖动视角，键盘/触屏控制沿场景路线移动 |
| 自动巡游 | 仅在当前世界内沿路线往返，不自动切换世界 |
| 便捷返回 | 一键返回世界列表，或重置当前位置与视角 |
| 稳定种子 | 默认根据世界 ID 计算种子，以提高重复打开时的一致性 |
| 纯静态部署 | `npm run build` 生成 `dist/`，可放到静态 Web 服务器上 |

### 与原项目的区别

原版 Portals 是一个几乎无需操作的连续旅程，按设计好的线路自动穿越到下一个世界。本版本把“世界选择”放在入口，让用户主动决定探索哪个场景，并在当前场景内停留。原版的几何、纹理、动态视觉与音频生成技术仍然沿用。

这是一种**基于原有飞行路径的漫游模式**，而不是重写整套场景为带碰撞、重力和地面行走的开放世界。详细限制见下文。

## 使用方法

### 1. 选择世界

进入网站首页，浏览 471 张场景卡片。可以搜索名称或描述、切换分类、选择排序方式；点击一张卡片进入对应 3D 世界。

你也可以把指定世界的网址分享给其他人，例如：

```text
https://YOUR_DOMAIN/?world=alpenglow-horn&explore=1
```

`world` 是世界 ID，`explore=1` 表示使用漫游模式。请替换示例域名。

### 2. 电脑操作

| 操作 | 控制 |
| --- | --- |
| 前进 / 后退 | W / S |
| 向左 / 向右 | A / D |
| 上升 / 下降 | E / Q |
| 加速 | 按住 Shift |
| 环顾四周 | 按住鼠标左键拖动 |
| 调整移动速度 | 鼠标滚轮 |
| 自动巡游 | 点击顶部“自动巡游” |
| 重置位置与视角 | 点击顶部“重置视角” |
| 返回大厅 | 点击顶部“返回世界列表” |

注意：原版的 `S` 音频快捷键与新增的“后退 S”存在重叠；需要开关音效时，**推荐使用画面中的音量按钮**，避免误操作。

### 3. 手机操作

在支持 WebGL 的手机浏览器中打开首页、点击世界卡片进入场景。**滑动视图**可以调整朝向；**屏幕方向按钮**可以前进、后退、左右移动和升降。移动设备可在原有设置界面降低画质，以改善性能。

### 4. 使用建议

第一次进入复杂世界时可能需要等待几何与纹理生成。某些场景对显卡或手机 GPU 要求较高。遇到黑屏时，优先检查 WebGL、浏览器硬件加速与设备性能。

## 本地开发与构建

### 环境

- Node.js **18 或更高版本**（建议使用当前维护中的 LTS 版本）
- npm
- 支持 WebGL 的现代浏览器

克隆项目（把 `OWNER` 换成实际 GitHub 仓库所有者）：

```bash
git clone https://github.com/OWNER/ai-portals-world-selector.git
cd ai-portals-world-selector
npm ci
```

**开发预览**（源码目录，默认仅本机访问）：

```bash
npm start
# 浏览器打开 http://127.0.0.1:8000/
```

**生产构建并预览**：

```bash
npm run build
npm run preview
# 浏览器打开 http://127.0.0.1:8001/
```

`npm run build` 会执行 `tools/build-deploy.mjs`，生成适合部署的静态目录 `dist/`：包括 HTML、CSS、按需加载的场景模块、缩略图、分享页面等。构建阶段会处理大量模块，首次执行需要一些时间。

**部署时只需把 `dist/` 作为网站根目录**。项目不需要启动 WebSocket、Spring Boot、数据库或其它业务 API。

## 项目结构

```text
ai-portals-world-selector/
├── index.html                   # 页面骨架：画布、大厅入口和探索控制
├── src/
│   ├── entry.js                 # 入口：显示世界大厅 / 加载指定世界
│   ├── main.js                  # 原核心程序及单世界启动参数
│   ├── core/
│   │   ├── engine.js            # Three.js 世界加载和动画引擎
│   │   └── explore.js           # 漫游控制器：键鼠、触控、位移和视角
│   ├── ui/
│   │   ├── world-hub.css        # 世界选择大厅与漫游按钮样式
│   │   ├── atlas.js             # 原画廊及链接适配
│   │   └── share.js             # 世界分享链接
│   ├── worlds/                  # 471 个程序化场景及注册表
│   └── parts/                   # 场景共用的几何、效果与辅助模块
├── vendor/                      # Three.js 及相关模块
├── thumbs/                      # 471 张场景缩略图
├── tools/
│   ├── build-deploy.mjs         # 静态打包工具
│   └── serve.mjs                # 本地静态预览服务器
├── deploy/
│   ├── http-server.py           # 可选：独立 Python 静态服务器
│   └── portals-world-selector.service # 可选：systemd 开机自启模板
├── WORLD_SELECTOR_README.md     # 补充技术说明
├── LICENSE                      # 原项目许可证
├── THIRD-PARTY-NOTICES.txt      # 第三方说明
└── dist/                        # 构建产物，已被 .gitignore 忽略
```

### 关键逻辑在哪里？

- `src/entry.js`：有合法的 `?world=<id>` 参数才加载 3D 引擎；否则显示世界大厅。
- `src/core/explore.js`：管理移动按键、触屏操作、方向、路线位置、自动巡游。
- `src/core/engine.js`：按固定世界模式启动与渲染，禁止自动准备和进入下一个世界。
- `src/main.js`：解析选中的世界、设置稳定种子、初始化 UI 和漫游事件。
- `tools/build-deploy.mjs`：将源码和资源输出到 `dist/`，用于正式部署。

## Linux 服务器部署教程

这里提供两种独立方案。**所有 IP、域名和账号都使用示例占位符**，请按实际环境替换；不要把密码、私钥、Token 等写入代码或提交 GitHub。

### 方案 A：独立 Python 静态服务（端口 6868）

适合希望独立运行，不改动已有 Nginx 网站的服务器。该方案与当前验证过的部署方式一致。

1. 安装 Node.js 18+、npm、Git，以及 Python 3.6+。
2. 将仓库克隆到一个用于部署的目录（下方示例为 `/opt/ai-portals-world-selector`），并保证部署用户对此目录有写权限。
3. 构建静态网站：

```bash
cd /opt/ai-portals-world-selector
npm ci
npm run build
test -f dist/index.html
```

4. 复制项目自带的静态服务器与 systemd 服务模板：

```bash
sudo cp deploy/http-server.py /opt/ai-portals-world-selector/http-server.py
sudo cp deploy/portals-world-selector.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now portals-world-selector
```

5. 验证本机是否返回 HTTP 200：

```bash
systemctl status portals-world-selector --no-pager
curl -I http://127.0.0.1:6868/
```

6. 在云平台安全组、防火墙中**按需放通 TCP 6868**，然后访问：

```text
http://YOUR_SERVER_IP:6868/
```

可根据服务器实际目录修改 `deploy/portals-world-selector.service` 里的 `WorkingDirectory` 和 `ExecStart`。这份模板使用独立进程、非特权用户运行，不要求用户用 root 启动网站进程。

**提醒：**该示例是 HTTP；正式对外服务如有域名，建议另外通过受信任的反向代理或 CDN 配置 HTTPS。

### 方案 B：已有 Nginx，直接托管静态目录

如果服务器已经运行 Nginx，不需要再启动 Python 服务。先构建 `dist/`，再将其内容放到 Nginx 指向的网站目录，例如 `/var/www/portals`。

```nginx
server {
    listen 6868;
    server_name _;
    root /var/www/portals;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
```

修改前确认端口未占用，并在现有 Nginx 配置体系中加入**新的**站点文件，不覆盖已有站点：

```bash
sudo nginx -t
sudo systemctl reload nginx
curl -I http://127.0.0.1:6868/
```

也可把 `dist/` 交给其它静态托管平台，不要求使用 Python 或 Nginx。

## 更新、运维与故障排查

### 更新项目

部署目录对应的 Git 分支更新后，执行：

```bash
cd /opt/ai-portals-world-selector
git pull --ff-only
npm ci
sudo systemctl stop portals-world-selector
npm run build
sudo systemctl start portals-world-selector
```

上面示例会有短暂维护窗口；如需无停机发布，可先在独立目录构建，再采用发布目录切换方案。**更新 README 等文档本身不需要重新构建或重启网站。**

### 常用命令（方案 A）

```bash
sudo systemctl status portals-world-selector
sudo systemctl restart portals-world-selector
sudo journalctl -u portals-world-selector -n 100 --no-pager
ss -ltnp | grep 6868
curl -I http://127.0.0.1:6868/
```

### 故障排查

| 现象 | 优先检查 |
| --- | --- |
| 本机 200，但公网打不开 | 云安全组、主机防火墙、TCP 6868 入站规则 |
| 服务无法启动 | `systemctl status`、`journalctl`、工作目录与文件权限 |
| 页面打开但 3D 黑屏 | WebGL、硬件加速、GPU 性能、浏览器控制台 |
| 缩略图缺失 / 页面 404 | 是否部署完整 `dist/`，以及静态服务器根目录 |
| 修改代码后没变化 | 是否重新运行 `npm run build`，浏览器缓存是否刷新 |
| 手机卡顿 | 在设置里选择较低画质，并关闭其它高负载页面 |
| 场景移动时穿模 / 看不到部分区域 | 本版本采用受限路线漫游；见技术限制 |

## 技术原理与限制

1. **程序化世界**：世界几何与场景效果由原版 Three.js 代码在浏览器中生成，而非将所有场景作为现成 3D 模型下载。
2. **懒加载**：只有用户选定世界后才进入 3D 渲染逻辑；每个世界对应单独的按需模块。
3. **单世界模式**：世界选择由 URL 参数决定；引擎禁止自动预加载下一世界与传送门跳转。
4. **路线约束**：前进后退沿作者设计的飞行路线，左右和高度允许在有限范围内偏移。这能减少进入没有几何内容的区域，但不是完整自由飞行/地面行走/物理碰撞系统。
5. **稳定随机种子**：根据世界 ID 生成初始种子，不保证所有实时效果或设备渲染完全相同。
6. **浏览器执行**：无项目自建账号、后端接口或数据库；原版设置和收藏功能可使用浏览器本地存储。

### 目前已知限制

- 部分世界仅围绕既定飞行轨迹设计，偏离路线时可能出现视觉穿透或未完成区域。
- 显卡、浏览器、驱动不同，WebGL 支持和帧率可能不同。
- 世界名称和部分原版画廊/设置文案仍是英文。
- `S` 既是漫游后退键，也是原版音频快捷键，建议通过界面音量按钮控制声音。
- 原版的一些“旅程/画廊”功能及相关页面仍保留在仓库中，但首页主要以**单世界选择**为入口。

## 版权与致谢

- 原始项目：[emollick/ai-portals](https://github.com/emollick/ai-portals)，Ethan Mollick 与其项目贡献者。
- 原项目许可：**Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)**。
- 本修改版保留原项目的 `LICENSE` 和 `THIRD-PARTY-NOTICES.txt`；请遵守署名、非商业使用及相同方式共享的许可要求。第三方组件可能有单独的许可条款。
- 如果计划商业化使用，请先核对原项目和相关第三方资源的授权范围。

---

这是对项目功能和部署方式的说明文档；**没有包含真实服务器地址、账户、密码、Token、SSH 私钥或其他访问凭据**。