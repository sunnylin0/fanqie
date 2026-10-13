# 領域模型與術語彙編 (Domain Model & Context Glossary)

## 核心名詞定義

### 目標應用 (Target Application)
- **番茄簡譜 (Fanqie Jianpu)**: 目標逆向對象（`app/fanqie.exe`），屬於基於舊版 NW.js (Node-WebKit) 構建的桌面簡譜繪製/播放軟體。
- **NW Container (NW 容器)**: 包含 Chromium (Content Shell)、Node.js 執行階段與 NPAPI Flash Player 模組的原生外殼。
- **Bootstrap Payload (引導封裝包)**: 附加在 `fanqie.exe` 檔案尾端（offset 46,338,560）的 ZIP 壓縮包，負責初始化桌面視窗並動態載入遠端腳本。
- **Remote Host (`lezhi99.com`)**: 原始軟體的核心業務邏輯與 API 存放站點。

### 逆向工具鏈 (Reverse Engineering Pipeline)
- **REA (Reverse Engineering Assistant)**: 提供靜態/動態二進制分析、JavaScript 模組還原、Inspector 追蹤能力的 MCP 伺服器與 CLI 工具。
- **IDE AI (Antigravity Agent)**: 本地開發環境中的智慧代理，負責調用 REA 產出的 Evidence 進行程式分析、反編譯重構與決策規劃。
- **MCP Bridge (Model Context Protocol 橋接)**: IDE AI 與 REA 之間的 stdio 通訊介面，使 AI 能直接呼叫 REA 逆向命令與工具集。

### 核心模組與離線化術語 (Core Modules & Offline Terms)
- **Zhipu Notation Engine (智譜排版引擎)**: 核心排版與簡譜繪製腳本（`Zhipu-jsCode.js`，約 63KB），處理音符、小節線、延音記號、歌詞及本地儲存快取。
- **Fplay Audio Engine (Fplay 播放引擎)**: 歷史遺留的 NPAPI Flash 簡譜發聲橋接器（`player.swf`），提供 MIDI 合成音效撥放。
- **Offline Patch (離線修補程序)**: 將原先動態請求 `http://zhipu.lezhi99.com/*` 的引導流程重構為本地檔案協議，使軟體在離線環境下依然可正常運作。
- **Static Web Runtime (純靜態 Web 執行架構)**: 移除原生桌面 NW.js 依賴，以純前端（HTML/CSS/JS）配合現代瀏覽器原生 API 運行的形態。
- **SoundFont Web Audio Synthesizer (聲音字型 Web Audio 合成器)**: 透過本地 `gangqin.js`（1.6MB 鋼琴音色庫）與 `window.AudioContext` 取代舊版 Flash 發聲的現代化音訊架構。
- **Zhipu Remote Draw Gateway (智譜遠端排版閘道)**: 接收樂譜文字代碼（`B:`, `Q:`, `D:`, `P:` 標記語法）並渲染輸出為向量 SVG 的後端服務。
- **Zhipu Local Vector Renderer (智譜本地向量算圖器)**: 基於 `zhipu-local-renderer.js` 與內嵌 SVG 字符集（20 種核心音符與符號）的純前端獨立排版引擎。
- **JPS Score File (.jps 簡譜檔案格式)**: 包含樂譜語法代碼、自訂向量元素與頁面排版配置的 JSON 結構化檔案格式。
- **Dual-Track Rendering Engine (雙軌排版算圖架構)**: 本地毫秒級 SVG 生成優先、遠端 ThinkPHP 伺服器為備援的混合容錯渲染策略。
- **Spring Grid Layout (彈性等比小節佈局)**: 依據小節內部音符時值總和動態分配 X 軸空間的水平排版自適應演算法。
- **Quadratic Bézier Slur (二階貝茲連音弧線)**: 以動態控制點即時生成 SVG 弧線路徑以連接起始與終止音符的渲染技術。
- **Underline Beam Geometry (減時線梁幾何)**: 根據音符時值（八分、十六分音符）在數字下方層疊繪製水平梁線的向量幾何規則。




