# 0001. 離線獨立化架構與 REA 混合整合模式

- **狀態**: 已採納 (Accepted)
- **日期**: 2026-10-13
- **決策者**: 使用者與 Antigravity AI

## 背景與問題脈絡 (Context)
目標程式 `app/fanqie.exe`（番茄簡譜）是一個基於舊版 NW.js (Node-WebKit) 封裝的桌面應用。經深入探查發現：
1. 程式內部包含一個附加的 ZIP 資源包（偏移量 46,338,560），啟動時強制載入遠端腳本 `http://zhipu.lezhi99.com/Public/js/nw/nw_1_0_beta.js`，若連線超時則直接結束程式。
2. 核心樂譜排版引擎（`Zhipu-jsCode.js`）與音訊播放器（Flash `player.swf`）均託管在遠端伺服器。
3. 逆向工程需要使用 REA (Reverse Engineering Assistant) 工具鏈，在不中斷 IDE 操作的前提下完成二進制資源探勘與代碼分析。

## 決策內容 (Decision)
1. **REA 整合模式 (Q1-A)**：採用混合模式。一方面將 REA 註冊進 IDE 的 `mcp_config.json`（作為 stdio MCP 伺服器），另一方面直接在本地全域安裝 `rea-agents` 並以 CLI 指令 (`rea`) 即時驅動分析，避免重啟 IDE 造成工作流中斷。
2. **重構目標 (Q2-A)**：採取「本地離線獨立化 (Offline Standalone)」路線。將所有遠端靜態資源（`zhipu-nw.html`、`zhipu-index-windows-y.html`、`Zhipu-jsCode.js`、CSS、圖片、音效組件）全數快取落地，並切斷對外部伺服器 `lezhi99.com` 的即時網路請求。
3. **資產解包策略 (Q3-A)**：解包 `app/fanqie.exe` 的末端 ZIP 到 `extracted/` 目錄，使 REA 的靜態分析器與 AST 解析引擎能直接對模組與 HTML/CSS 建立語意依賴圖。

## 後續影響與權衡 (Consequences)
- **正面效益**:
  - 不再依賴外部伺服器存活性，軟體具備永久離線可運行能力。
  - REA 工具可直接在本地讀取解包代碼與 PE 資源，產出完整的 Evidence JSON。
  - 後續可無縫升級為現代化 Electron 或無 Flash 依賴的 Web/Desktop 應用（例如用 Web Audio API 替代 Flash `player.swf`）。
- **待解決權衡**:
  - NPAPI Flash (`NPSWF32_17_0_0_169.dll` / `player.swf`) 在現代 Chromium 核心中已被棄用。若未來完全脫離舊版 NW.js，需要對播放協議進行音訊合成器替換。
