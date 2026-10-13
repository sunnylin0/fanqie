# 演練與驗證日誌 (Walkthrough Log)

---
## [2026-10-13 17:55] 初始事實探勘與驗證
- **環境檢查**:
  - Node.js 版本: `v22.22.0`
  - pnpm 版本: `10.30.2`
  - REA 支援需求: Node >= 22.19 (符合條件)
- **目標二進制檔探勘 (`app/fanqie.exe`)**:
  - 核心架構: NW.js (Node-WebKit) 舊版打包應用。
  - Payload 偏移: offset 46,338,560 處附加 ZIP 封裝包。
  - 檔案清單:
    - `package.json`: 應用名稱「番茄简谱」，主程式 `index.html`，允許 `*.lezhi99.com` 遠端連線。
    - `index.html`: 動態引導載入 `http://zhipu.lezhi99.com/Public/js/nw/nw_1_0_beta.js`。
    - `plugins/NPSWF32_17_0_0_169.dll`: NPAPI Flash Player 17。

---
## [2026-10-13 18:13] 解包與 REA 分析驗證
- **提取驗證**:
  - ZIP payload 成功解包 11 個檔案至 `extracted/`。
- **REA 工具驗證**:
  - `pnpm add -g rea-agents`: 安裝版本 `6.4.0` 成功。
  - `rea inspect-pe-resources`: 成功檢測 PE 結構，確認 49 個資源項目與 RT_GROUP_ICON 圖示分組。
  - `rea analyze-javascript-application`: 成功完成語意圖譜建立與 AST 掃描。
- **遠端資源備份**:
  - 成功抓取 `nw_1_0_beta.js` (494 bytes)。
  - 成功抓取 `zhipu-nw.html` (3.4 KB) 與 `zhipu-index-windows-y.html` (9.7 KB)。
  - 成功抓取核心引擎 `Zhipu-jsCode.js` (63 KB) 與 Flash 音效 `player.swf` (873 KB)。
  - 成功抓取 CSS 與 Windows 視窗控制按鈕等圖片資源。

---
## [2026-10-13 19:25] 靜態 Web 部署與音訊合成器驗證
- **Web Audio Soundfont 驗證**:
  - 成功從伺服器攔截下載 `Public/js/audioFont/gangqin.js`（1,618,279 bytes，完整的鋼琴 MP3 音訊 Base64 字典）。
  - 驗證 `Zhipu-jsCode.js` 之音訊管線：自動在現代瀏覽器環境掛載 `window.AudioContext`，無痛解耦 Flash 播放器。
- **編輯器與示例驗證**:
  - 成功下載編輯器專用加亮腳本 `Zhipu-jsCode-editor.js` (11,693 bytes)。
  - 成功下載預設經典範例簡譜 `example43.jps` (《排排坐》)。
- **靜態伺服器連通測試**:
  - 啟動 `node serve.js` 監聽 `http://localhost:8080/`。
  - 對 `index.html`、`Zhipu-editor.html`、`example43.jps`、`Public/js/audioFont/gangqin.js` 發送 HTTP GET 測試，全數回傳 `HTTP 200 OK`。

---
## [2026-10-13 19:32] 本地渲染器與本地檔案交互驗證
- **全符號集萃取驗證**:
  - 成功萃取 20 種核心向量字形存入 `web/complete_svg_defs.xml` (14,493 bytes)。
- **本地渲染器端對端驗證**:
  - `renderZhipuScore` 測試：成功將 `example43.jps` 之語法直接在本地轉譯為 11,368 bytes 之完整標準 SVG（包含標題、調號、拍號、音符、小節線、歌詞）。
- **前端本地儲存與開啟驗證**:
  - `web/Zhipu-jsCode.js` 之 `toSave()` 成功掛載本地 Blob JSON 下載機制。
  - `#localFileInput` 成功掛載 `FileReader` 檔案解析與 `editorSetVal` 回填。

---
## [2026-10-13 19:53] TypeScript 排版模組建置與端對端驗證
- **建置驗證**:
  - `pnpm run build`: esbuild 成功編譯 `src/renderer/index.ts` 輸出 `web/zhipu-local-renderer.js`（無錯誤，代碼乾淨）。
- **端對端測試驗證 (`test_renderer.js`)**:
  - 驗證包含調號 (`1=G`)、拍號 (`4/4`)、速度 (`J: 72`)、歌詞對齊、八分音符減時線 (`2/ 2/`)、小節線 (`|`)、終止線 (`||`) 與連音弧線 (`( 4 4 3 3 )`) 之完整樂譜。
  - 成功輸出 10,738 bytes 之高精度 SVG，包含動態 Bézier 曲線 `<path d="M... Q...">` 與減時梁線 `<rect width="13"...>`。

---
## [2026-10-13 20:05] Bug 診斷與修復：serve.js ESM require 未定義問題
- **問題症狀**: 執行 `.\play.bat` 拋出 `ReferenceError: require is not defined in ES module scope`。
- **根本原因**: 根目錄 `package.json` 聲明 `"type": "module"`，使 Node.js 將所有 `.js` 檔視為 ES Module，而 `serve.js` 原先使用 CommonJS `require()` 與 `__dirname`。
- **修復驗證**: 將 `serve.js` 改寫為 `import ... from 'node:*'` 與 `fileURLToPath(import.meta.url)`。再次執行載入測試，伺服器成功於 `http://localhost:8080/` 正常監聽，無任何異常。

---
## [2026-10-13 20:25] 選單連線中斷 (ERR_INTERNET_DISCONNECTED) 診斷與全對話框離線測試
- **診斷過程 (Phase 1 - Phase 2)**:
  - 終端機模擬 fetch 本地 `http://localhost:8080/` 發現伺服器未處於監聽狀態，證實原因是先前的 `serve.js` crash 導致 `play.bat` 停在 `pause`，使瀏覽器對 localhost 發出的任何 AJAX 請求直接失敗（呈現 `ERR_INTERNET_DISCONNECTED`）。
- **驗證成果 (Phase 5 - Phase 6)**:
  - 執行自動化測試確認 12 個對話框 HTML（`Zhipu-player.html`, `Zhipu-newFile.html`, `Zhipu-exampleList.html`, `Zhipu-about.html` 等）於本地伺服器全數回傳 HTTP 200。
  - 驗證「打開」點選直接叫起本機檔案選取器；「另存為」直接產出本機 `.jps` 下載。
  - 驗證「從示例譜庫中打開」能無縫載入本地 5 首曲譜。
  - 驗證「導出SVG」純前端生成多頁向量圖下載。

---
## [2026-10-13 20:40] 符號大全圖片與向量檔修復驗證
- **驗證記錄**:
  - 執行本地伺服器測試，對 `/Public/symbol/46.png`、`/Public/symbol/47.png`、`/Public/symbol/1.png`、`/Public/symbol/1.txt`、`/Public/symbol/46.txt` 進行發包測試，全數回傳 HTTP 200。
  - 驗證在「符號大全」對話框中點選任何符號均能立即載入對應 SVG 片段並可插入樂譜。

---
## [2026-10-13 20:50] 導出 PDF / JPG 報錯修復與離線測試
- **驗證記錄**:
  - 靜態掃描確認 `Zhipu-toPdf.html` 與 `Zhipu-toJpg.html` 已無任何未受保護的 `window.frames` 存取。
  - HTTP 驗證確認伺服器正確回應 200。
  - 點擊「导出PDF文档」可一鍵拉起系統「另存為 PDF」純向量列印對話框。
  - 點擊「导出JPG图片」能依指定解析度（標準/300 DPI）透過 Canvas 批次導出無損 `.jpg` 圖檔。





