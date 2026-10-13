# 0002. 純靜態 Web 執行架構與 Web Audio SoundFont 引擎

- **狀態**: 已採納 (Accepted)
- **日期**: 2026-10-13
- **決策者**: 使用者與 Antigravity AI

## 背景與問題脈絡 (Context)
在第一輪決策後，已完成 `app/fanqie.exe` 的解包與遠端資產鏡像（包括 63KB 的前端排版控制腳本 `Zhipu-jsCode.js`、1.6MB 鋼琴音色庫 `gangqin.js` 以及相關 HTML/CSS 資源）。
面臨兩個核心架構選擇：
1. **執行載體 (Q4)**：使用者決定採用 **純靜態網頁版 (Q4.C)**，免安裝任何原生運行時（如舊版 NW.js 或 Electron），直接能在現代標準瀏覽器（Chrome、Edge）中啟動使用。
2. **音訊發聲機制 (Q5)**：原版使用 NPAPI Flash (`player.swf`) 進行發聲。經代碼深度分析發現，`Zhipu-jsCode.js` 內部其實已具備完整的 Web Audio API 與 `Soundfont` 模組，優先嘗試連接 `window.AudioContext` 與 `Public/js/audioFont/gangqin.js`。

## 決策內容 (Decision)
1. **純靜態架構 (Static Web Distribution)**：
   - 在專案內建立 `web/` 獨立資料夾，消除對 `require('nw.gui')` 等桌面外殼 API 的強依賴。
   - 視窗按鈕與檔案儲存介面轉為標準 Web 模式：存檔/讀檔支援瀏覽器 `localStorage` 與本機 `.jps` 檔案直接下載/上傳。
2. **Web Audio SoundFont 合成器 (Q5.A)**：
   - 徹底移除 `<object>` 與 `<embed>` Flash 外掛標籤。
   - 啟用內建的 Web Audio API 播放通道，直接加載本地鏡像的 1.6MB `gangqin.js` 鋼琴音色，達成零外掛的高音質簡譜撥放。
3. **排版渲染通訊處理**：
   - 樂譜 SVG 渲染由 `Zhipu-draw` 端點產生。在靜態網頁版中，預設向 `http://zhipu.lezhi99.com/Zhipu-draw` 進行非同步繪製請求，並設計本地離線快取/代理機制。

## 後續影響與權衡 (Consequences)
- **正面效益**:
  - 零依賴：任何現代瀏覽器皆可雙擊或透過靜態伺服器（`pnpm serve` / `npx serve`）直接使用。
  - 音訊現代化：告別 NPAPI Flash 安全限制與相容性死穴，音質更清晰且可在跨平台環境播放。
- **待解決權衡**:
  - `Zhipu-draw` 目前仍需遠端 PHP 伺服器進行 SVG 轉換。若要在完全斷網時依然能繪製全新樂譜，未來可進一步逆向其 PHP 算圖演算法並將其純 JavaScript/TypeScript 化。
