# Heovose Elevate 运维与系统故障恢复手册

本手册记录了 Heovose Elevate 后台系统升级、语言重定向以及线上运行期间可能遇到的典型问题、根本原因分析（Root Cause）以及标准的应急恢复流程，供后续运维使用。

---

## 1. 系统架构简述

本系统采用 **Docker 容器化分层部署**，运行在服务器主机上：
*   **Web 应用容器 (`heovose-web`)**：运行 Next.js 15 生产服务，对外暴露端口 `9002`。
*   **数据库容器 (`heovose-db`)**：运行 PostgreSQL 16 数据库服务，对外暴露端口 `5432`。
*   **存储容器 (`heovose-storage`)**：运行 MinIO S3 对象存储，对外暴露 API 端口 `9000`。
*   **网关反向代理 (`Nginx`)**：监听 `80` (HTTP) 与 `443` (HTTPS)，配置 SSL 证书，并将流量代理至内网的 `heovose-web:9002`。

---

## 2. 典型问题排查与修复预案

### 问题一：更新后网站报 502 / 容器陷入无限重启（Restart Loop）

#### 💥 故障现象
*   线上页面访问提示 `502 Bad Gateway`。
*   在服务器上运行 `docker ps -a` 看到 `heovose-web` 容器的状态为 `Restarting (1)`。
*   查看容器日志 `docker logs heovose-web` 报以下错误：
    ```text
    [Error: Could not find a production build in the '.next' directory. Try building your app with 'next build' before starting the production server...]
    ```

#### 🔍 根本原因
*   **内存溢出（OOM）导致编译中断**：在网站后台触发更新时，脚本是在 **容器内部** 执行 `npm run build`。由于云服务器内存有限，且 Next.js 编译极其消耗内存，Node 进程在编译阶段被系统内核的 OOM Killer 强制杀死。
*   **编译文件损坏/丢失**：进程非正常死亡导致 `/app/.next` 编译目录被破坏或成为空文件夹。容器重启后，Next.js 因找不到编译包而无法启动，进而导致 Nginx 反代失效报 502。

#### 🛠️ 应急恢复步骤 (在服务器主机上手动编译)
由于主机环境没有容器的内存限制，通过主机 Docker 重新构建镜像可以 100% 解决此问题：
```bash
# 1. 登录服务器，进入项目源码目录
cd /mnt/nvme1n1/heovose/app

# 2. 推送最新的数据库哈希结构字段
npx prisma@6 db push

# 3. 在主机上重新构建 Docker 镜像 (这会将编译阶段放在干净的 Builder 中进行)
docker build -t heovose-web .

# 4. 重启网站容器以加载最新编译完成的镜像
docker restart heovose-web
```

---

### 问题二：更新机制在后台执行时进程卡死、无响应

#### 💥 故障现象
*   在后台点击“执行系统更新”后，日志打印到“正在重新构建项目”后长期没有动静，系统直接失去响应，甚至服务器 SSH 变卡。

#### 🔍 根本原因
*   Next.js 默认构建会开启多线程并占用服务器的大部分内存，低配云服务器（如 1核2G 或 2核4G）会在瞬间被占满 CPU 和 SWAP 分区，导致整个系统级死锁。

#### 🛠️ 防范与优化措施 (已部署于 `update-system.sh`)
我们已将后台升级的构建命令增加了**线程与物理内存双重限制**：
```bash
env UV_THREADPOOL_SIZE=1 NODE_OPTIONS="--max-old-space-size=1024" npm run build
```
*   **`UV_THREADPOOL_SIZE=1`**：强制使用单线程编译，确保服务器有余力处理 Nginx 流量，防止 SSH 和服务器锁死。
*   **`NODE_OPTIONS="--max-old-space-size=1024"`**：强制 Node.js 内存上限为 1024MB，超限会自动进行垃圾回收，防止被 OOM 强杀。

---

### 问题三：日语等未支持语种访问未跳回默认语种，直接打不开或加载错误

#### 💥 故障现象
*   浏览器语言设为日语（`jp`）等后台没有启用的语言，或者直接输入 `/jp` 访问时，网页没有跳转回后台设置的印尼语（`id`）或越南语（`vi`），而是直接打开了无翻译的 `/jp` 路径。

#### 🔍 根本原因
*   **Edge 沙盒限制**：Next.js 中间件 (`middleware.ts`) 只能运行在 Edge 运行时，无法使用依赖 TCP 的 PrismaClient，导致无法从数据库动态获取管理员指定的默认语种。
*   **异常捕获冲突**：Next.js 的 `redirect()` 原理是通过抛出 `NEXT_REDIRECT` 异常终止执行的。原代码中将其包裹在 `try-catch` 中，导致重定向异常被误吞，网页直接回落到了硬编码逻辑。

#### 🛠️ 重构设计 (已部署)
我们将语言校验和重定向逻辑彻底转移到 **标准 Node 运行环境下的 Server Layout/Page** 中，且消除了所有硬编码：
*   **首选校验**：用户访问 `/` 时，[src/app/page.tsx](file:///home/anthony/projects/Heovose-base/src/app/page.tsx) 动态读取 `languages` 配置，检查浏览器 `Accept-Language` 头（支持 `zh_CN` 与 `zh-CN` 兼容），匹配不到则重定向回数据库的 `defaultLanguage`。
*   **非法路由拦截**：当用户直接访问非法路径 `/jp` 时，[[locale]/layout.tsx](file:///home/anthony/projects/Heovose-base/src/app/[locale]/layout.tsx) 会捕获参数，在 `locales` 列表中未匹配时，动态从数据库读取默认语言并执行 `redirect()` 强行带回。

---

## 3. 极简应急指令卡（Cheat Sheet）

当系统发生异常时，请按顺序使用以下 Docker 命令进行排查：

| 命令 | 作用 | 使用场景 |
| :--- | :--- | :--- |
| `docker ps -a` | 查看所有容器运行状态 | 排查网站、数据库、对象存储容器是否处于 `Up` (运行中) |
| `docker logs heovose-web --tail 50` | 查看 Web 容器最新 50 行日志 | 网站无法访问、报 500、502 错误时定位直接原因 |
| `docker restart heovose-web` | 重启 Web 容器 | **更新卡死、502 报错时的首选第一步**，重置容器状态 |
| `docker exec -it heovose-web pkill -f next-build` | 强杀容器内卡死的编译进程 | 后台执行更新时超过 5 分钟无响应，强行解锁进程 |
| `docker exec -it heovose-web tail -f /app/backups/update_log.txt` | 实时查看容器内系统更新进度 | 后台执行更新时，在 SSH 终端实时跟踪具体进度 |
