# Portals 世界漫游 · 固定世界选择版

本项目基于 Ethan Mollick 的 ai-portals（https://github.com/emollick/ai-portals），保留原有 471 个 3D 世界，并添加一个独立世界选择大厅。

## 功能

- 打开首页：按类别浏览 471 个世界，输入英文名称或描述搜索，支持推荐、名称、奇幻排序。
- 点击缩略图：固定进入所选世界，不再随机跨越传送门。
- 世界内容由原版 Three.js 按原定逻辑生成；为保证同一世界多次打开不变，使用世界 ID 产生固定随机种子。
- 拖动画面环顾；W/S 沿原路线前进后退；A/D 左右偏移；Q/E 上升下降；Shift 加速；滚轮调整速度。
- 手机上拖动画面旋转视角，用屏幕左下角方向键移动。
- 顶部“自动巡游”会沿当前世界路线往返，不会进入下一个世界。
- 点击“返回世界列表”重新挑选；“重置视角”回到当前世界起点。

## 限制

原项目是为“按预设路线飞行”制作的，许多场景缺少场外几何和碰撞体；这里采用限制离开路线的自由观察模式，并不是可在世界任何位置行走的开放世界。部分特殊世界可能有视觉穿模。音频仍可按 S 开启。

## 本地运行

Node.js 18+，在项目根目录运行：

    npm ci
    npm run build
    npm run preview

然后打开 http://127.0.0.1:8001/。

## Linux + Nginx 部署

将 dist/ 上传到 /var/www/portals，使用 Nginx 静态目录：

    server {
        listen 80;
        server_name YOUR_DOMAIN;
        root /var/www/portals;
        index index.html;
        location / { try_files $uri $uri/ =404; }
    }

然后自行配置 HTTPS。不要用 Nginx 反向代理到 Node，除非你想使用 Node 预览服务器；正式部署只需要 dist 静态文件。

也可以直接将 dist 上传到 Netlify Deploys 页面，或用于 Cloudflare Pages 的静态部署。

## 版权

源项目采用 CC BY-NC-SA 4.0。仅用于非商业用途；保留作者署名、原仓库 LICENSE 与 THIRD-PARTY-NOTICES.txt。其他第三方素材可能存在额外条款。商业使用须另行处理授权。
