# 版本與變更發佈日誌 (Releases)

---
## [2026-10-13 17:55] Initial Discovery & Planning
### 變更摘要
- 調查 `c:\github\fanqie\app\fanqie.exe` 二進制特徵，定位為 NW.js + Flash 簡譜軟體架構。
- 驗證本地 Node.js (v22.22.0) 與 pnpm 環境，相容 REA 規範。
- 啟動 `/grill-with-docs` 決策樹與領域模型定義流程。

---
## [2026-10-13 18:13] Unpack, Asset Recovery & REA MCP Setup
### 變更摘要
- **REA 工具鏈**: 全域安裝 `rea-agents@6.4.0`，並於 `mcp_config.json` 寫入 REA MCP 服務定義。
- **Payload 解包**: 成功提取 `app/fanqie.exe` 內部 11 個靜態檔案至 `extracted/`。
- **遠端代碼攔截**: 完整鏡像下載遠端伺服器核心引擎 `Zhipu-jsCode.js`、`player.swf`、HTML 與樣式資產，解除伺服器離線失聯風險。
- **領域與決策文檔**: 產出 ADR 0001 (離線獨立化架構與 REA 混合整合模式) 及擴充 `CONTEXT.md`。

---
## [2026-10-13 19:25] Static Web & Web Audio SoundFont Engine Delivery
### 變更摘要
- **純靜態 Web 版本交付**: 建立 `web/` 目錄，去除舊版 NW.js 桌面外殼綁定，完全支援在現代 Chrome / Edge 直接開啟。
- **Web Audio 鋼琴音色庫**: 成功鏡像 1.6MB 之 `gangqin.js`（SoundFont），淘汰 NPAPI Flash 外掛（`player.swf`），實現原生瀏覽器簡譜發聲。
- **核心編輯器與示範曲**: 鏡像並修補 `Zhipu-jsCode-editor.js` 及《排排坐》示例文檔 `example43.jps`。
- **本地靜態伺服器**: 提供 `serve.js` 並於 `http://localhost:8080/` 測試通過（所有核心資產均返回 HTTP 200）。
- **架構決策與術語**: 發佈 ADR 0002 (純靜態 Web 執行架構與 Web Audio SoundFont 引擎) 並擴充 `CONTEXT.md`。

---
## [2026-10-13 19:32] Client-Side Vector Notation Engine & Local File Autonomy
### 變更摘要
- **純前端向量算圖引擎**: 建立 `web/zhipu-local-renderer.js`，內建 20 種 SVG 向量字符（音符、休止、升降、小節線、附點），達成 100% 離線毫秒級排版渲染。
- **本機檔案存取機制**: 實作本地 `.jps` 檔案匯出 (Blob 下載) 與匯入 (FileReader)，搭配 `localStorage` 自動草稿快取。
- **雙軌容錯架構**: 預設純本機向量算圖，必要時可自動備援回退至遠端伺服器。
- **架構決策與領域術語**: 發佈 ADR 0003 (純前端本地向量排版渲染器與本機檔案存儲管理) 並更新 `CONTEXT.md`。

---
## [2026-10-13 19:35] One-Click Launcher & NPM Scripts
### 變更摘要
- **專案配置**: 新增根目錄 `package.json`，支援 `pnpm start`。
- **一鍵啟動**: 建立 Windows [啟動.bat](file:///c:/github/fanqie/%E5%95%9F%E5%8B%95.bat)，雙擊自動呼叫系統預設瀏覽器開啟 `http://localhost:8080/` 並常駐服務。

---
## [2026-10-13 19:45] Official Spec Extraction & TS Layout Engine Planning
### 變更摘要
- **官方語法規範全集**: 成功鏡像並萃取官方全部 25 章語法說明文檔至 [docs/spec/GRAMMAR_SPEC.md](file:///c:/github/fanqie/docs/spec/GRAMMAR_SPEC.md)。
- **啟動修復**: 修復批次檔編碼與 `serve.js` 端口衝突處理機制。
- **排版演算法規劃**: 啟動 `Zhipu-draw` PHP 算圖演算法純 TypeScript / JavaScript 化逆向決策樹。

---
## [2026-10-13 19:53] TypeScript Score Layout Engine Release
### 變更摘要
- **TypeScript 算圖架構**: 於 `src/renderer/` 完成 AST 型別定義、官方 25 章語法解析器 (`parser.ts`)、小節彈性等比排版 (`layout.ts`) 與 SVG 產生器 (`svg-generator.ts`)。
- **建置管線配置**: 建立 `build.js` 並配置 `pnpm run build`，透過 esbuild 自動編譯輸出至 `web/zhipu-local-renderer.js`。
- **動態向量幾何**: 支援二階貝茲曲線連音線、動態多層減時梁線、高低音點、小節線與反覆記號。
- **架構決策與術語**: 發佈 ADR 0004 (TypeScript 純前端簡譜排版引擎與向量幾何渲染) 並擴充 `CONTEXT.md`。

---
## [2026-10-13 20:05] Serve.js ESM Compatibility Fix
### 變更摘要
- **模組語法相容**: 因 `package.json` 開啟 `"type": "module"`，將 `serve.js` 完整重構為原生 ES Module (`import ... from 'node:*'`)，徹底修復 `ReferenceError: require is not defined in ES module scope`。

---
## [2026-10-13 20:25] Menu Offline Support & ERR_INTERNET_DISCONNECTED Fix
### 變更摘要
- **連線問題排查**: 確認先前伺服器因 ESM crash 導致 8080 端口無服務，使瀏覽器對 localhost 拋出 `net::ERR_INTERNET_DISCONNECTED`；已修復並驗證所有對話框 HTML 均回傳 200。
- **純離線選單行為**:
  - `web/index.html`: 「打開」直接觸發 `#localFileInput` 讀取本地 `.jps`；「另存為」直接呼叫本地儲存；軟體與語法幫助改用 `window.open` 在新分頁瀏覽。
  - `web/Zhipu-jsCode.js`: 示範曲庫 `openExampleFile()` 全面接通本地 5 首曲譜；「導出SVG」實作純前端 DOM 抽取與 Blob 向量下載，完全移除遠端伺服器請求。

---
## [2026-10-13 20:40] Complete Symbol Assets Mirror (Offline Custom Symbols)
### 變更摘要
- **符號預覽圖與定義檔鏡像**: 下載並本地化所有 52 個自訂符號圖片 (`/Public/symbol/{1..52}.png`) 及對應之 SVG 片段定義檔 (`/Public/symbol/{1..52}.txt`)。
- **伺服器 MIME 配置**: 在 `serve.js` 補充 `.txt` 為 `text/plain; charset=utf-8`。
- **純離線可用**: 「符號大全」對話框圖片均可正常顯示，且點擊後可將符號正確插入曲譜中。







