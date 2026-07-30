---
AIGC:
    Label: "1"
    ContentProducer: 001191440300708461136T1XGW3
    ProduceID: 5786bd5c0986a5cce7a8c6e727c5411b_2856a5828be911f184f2525400e6dd8f
    ReservedCode1: LVEmz8zdeSPXv7E4ixD+/Im8O1LMhLF3yIIvFEVFWKLCbconDvOB678GQt+JtCv4aK1yUcC1d21oWbdRxxbW4OAuwNO9bQxT4cZty1JLotThHFW4nsFMCyF6SQsEhwL/PpQYivVgzgxeiaLSw+bE85TiCSIjfxrvc5oty5QwP0AVZNYZBKXaVYOfNTE=
    ContentPropagator: 001191440300708461136T1XGW3
    PropagateID: 5786bd5c0986a5cce7a8c6e727c5411b_2856a5828be911f184f2525400e6dd8f
    ReservedCode2: LVEmz8zdeSPXv7E4ixD+/Im8O1LMhLF3yIIvFEVFWKLCbconDvOB678GQt+JtCv4aK1yUcC1d21oWbdRxxbW4OAuwNO9bQxT4cZty1JLotThHFW4nsFMCyF6SQsEhwL/PpQYivVgzgxeiaLSw+bE85TiCSIjfxrvc5oty5QwP0AVZNYZBKXaVYOfNTE=
---

# 门店管理看板 - GitHub Pages 部署指南

## 这是什么

南城香门店管理看板中台，包含两个模块：
- **门店绩效排名**（2026年1-12月）
- **处罚统计看板**

## 架构说明

```
index.html          ← 融合首页（Tab切换）
├── perf.html       ← 绩效看板（数据外置）
├── punish.html     ← 处罚看板（数据外置）
├── data_perf.json  ← 绩效数据源（你更新这个文件即可）
└── data_punish.json ← 处罚数据源（你更新这个文件即可）
```

所有看板通过 fetch 从同目录加载 JSON 数据文件，自动带时间戳避免浏览器缓存。

## 部署到 GitHub Pages

### 第一步：创建 GitHub 仓库

1. 注册/登录 [GitHub](https://github.com)
2. 点击右上角 + → New repository
3. 仓库名填写 `store-dashboard`（或任意名称）
4. 选择 Public（公开）
5. 点击 Create repository

### 第二步：上传文件

将以下 5 个文件全部上传到仓库根目录：
- `index.html`
- `perf.html`
- `punish.html`
- `data_perf.json`
- `data_punish.json`

方法：仓库页面 → Add file → Upload files → 拖入全部文件 → Commit changes

### 第三步：启用 GitHub Pages

1. 仓库页面 → Settings → Pages
2. Source 选择 `main` 分支，目录选 `/ (root)`
3. 点击 Save
4. 等 1-2 分钟，页面会显示你的网址：
   `https://你的用户名.github.io/store-dashboard/`

### 第四步：分享链接

把上面的网址发给同事即可，所有人看到的是同一个实时版本。

---

## 日常更新数据

**只需要替换两个 JSON 文件：**

1. 在仓库页面找到 `data_punish.json` 或 `data_perf.json`
2. 点击文件 → 右上角铅笔图标（Edit）
3. 粘贴新数据 → Commit changes
4. GitHub Pages 自动重新部署（约30秒生效）

所有打开看板的人刷新页面即可看到最新数据，无需重新发送任何文件。

---

## 本地预览

如需在本地测试，用任意 HTTP 服务器即可（直接双击 HTML 会因为跨域限制无法加载 JSON）：

```bash
# Python 3
python -m http.server 8080

# 然后打开 http://localhost:8080
```

---

## 文件清单

| 文件 | 大小 | 说明 |
|------|------|------|
| index.html | 2.3 KB | 融合首页 |
| perf.html | 53 KB | 绩效看板 |
| punish.html | 47 KB | 处罚看板 |
| data_perf.json | 1.13 MB | 绩效数据（7个月） |
| data_punish.json | 140 KB | 处罚数据（327条） |
*（内容由AI生成，仅供参考）*
