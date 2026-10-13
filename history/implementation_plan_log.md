# 實作計畫日誌 (Implementation Plan Log)

---
## [2026-10-13 17:55] REA 整合與番茄簡譜逆向分析方案
- **步驟**:
  1. 環境調查與事實探勘（已完成：分析 `fanqie.exe` 為 NW.js 封裝，附帶 Flash 外掛與 `lezhi99.com` 動態載入腳本）。
  2. 執行 `/grill-with-docs`：透過 Grilling 決策樹向使用者確認逆向工程目標與 REA 串接模式。
  3. 配置 REA MCP 服務於 Antigravity IDE (`C:\Users\ESAO_NB27\.gemini\config\mcp_config.json`) 或透過 CLI 工具鏈直接交互。
  4. 解包與提取 `fanqie.exe` 前端靜態資產，探查遠端 API/JS 資源與 Flash 互動。
  5. 更新 `CONTEXT.md` 領域術語與相應 ADR。
- **影響檔案**:
  - `C:\Users\ESAO_NB27\.gemini\config\mcp_config.json`
  - `c:\github\fanqie\CONTEXT.md`
  - `c:\github\fanqie\history/*`
- **風險評估**:
  - 遠端伺服器 `lezhi99.com` 可能已離線，若需還原完整功能可能需從 Flash 或 Web Archive 找回核心邏輯。

---
## [2026-10-13 18:13] 離線獨立化修補與本地運行計畫
- **執行步驟**:
  1. 遠端資源本地化重定向：修改 `extracted/index.html` 與 `extracted/zhipu-nw.html`，將動態載入改為本地相對路徑載入。
  2. 修補 `Zhipu-jsCode.js`：確保其在完全無網路環境下能直接存取本地音符與排版組件。
  3. 重新封裝/本機測試運行：驗證離線版能否透過本地 NW.js 或瀏覽器正常啟動與排版樂譜。
- **影響檔案**:
  - `extracted/index.html`
  - `extracted/zhipu-nw.html`
  - `extracted/zhipu-index-windows-y.html`
  - `extracted/Zhipu-jsCode.js`
- **風險與緩解**:
  - Flash 播放功能依賴舊版 NW.js 之 NPAPI 外掛，現代瀏覽器不支援 NPAPI。
  - 緩解方案：優先保證簡譜排版/繪製/匯出功能離線可用；音訊部分評估是否需要 SoundFont/WebAudio 轉換。

---
## [2026-10-13 19:25] 離線算圖引擎與純本地排版 (Next Phase)
- **實作進展**:
  - 已完成靜態 Web 版環境落地 (`web/`)，移除 Flash 標籤改以 Web Audio 播放本地 1.6MB 鋼琴音色庫。
- **後續步驟規劃**:
  1. 深入逆向 `/Zhipu-draw` 繪圖協議：目前靜態版透過 HTTP POST 向 `http://zhipu.lezhi99.com/Zhipu-draw` 請求生成 SVG 向量樂譜。
  2. 逆向排版語法規格：解析 `B:` (標題), `Q:` (音符與小節線), `C:` (歌詞), `D:` (調號), `P:` (拍號), `J:` (節拍速度)。
  3. 建構純前端本機 SVG 繪圖器或離線 Mock 轉譯器，達成 100% 斷網完全獨立運作。
- **影響檔案**:
  - `web/index.html`
  - `web/Zhipu-jsCode.js`
  - `web/serve.js`
- **風險評估**:
  - 若 `lezhi99.com` 未來關閉，`Zhipu-draw` 若未完成本機 JavaScript 重寫將無法渲染新樂譜。
  - 緩解方案：使用 REA 或逆向工具解析 SVG 渲染對應表，將其移植至本機 TypeScript/JavaScript 渲染模組。

---
## [2026-10-13 19:32] 純前端算圖落地與專案收斂 (Completed)
- **實作結果**:
  - `web/zhipu-local-renderer.js` 開發完成，整合 20 種核心 SVG 向量字符定義。
  - `web/Zhipu-jsCode.js` 與 `web/index.html` 修補完成，達成即時本地排版與 `.jps` 檔案儲存/載入。
  - 本地靜態伺服器驗證通過，隨開即用。
- **後續維護與可選增強**:
  1. 支援 PDF 匯出（透過瀏覽器 `window.print()` 或 `jspdf` 將本地 SVG 直接輸出為高品質向量 PDF）。
  2. 支援 SoundFont 更多樂器音色擴充（如笛子、古箏、提琴等）。



