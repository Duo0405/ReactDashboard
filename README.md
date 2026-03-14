# 企業級 3D 主機網路監控儀表板 (Enterprise 3D Monitoring Dashboard)

這是一個以全新 **React 19**、**TypeScript** 與 **Vite** 為基礎開發的企業級網路及主機狀態監控儀表板專案。專案結合了豐富的 3D 與 2D 視覺化技術，為網管與運維人員提供直覺、現代化且具備高度互動性的監控畫面。

## 🌟 核心特色功能

- **🚀 現代前台技術堆疊**
  基於最新架構建立，保證絕佳的開發與執行效能：
  - **React 19** 搭配 **Vite** 提供極速層級模塊熱更新 (HMR)。
  - **Tailwind CSS v4** 快速建立具有響應式 (RWD)、一致性高的現代 UI 函式庫。
  - **Zustand** 輕量級且高效的全局狀態管理。

- **🌍 2D/3D 混合互動資料視覺化 (支援 Storybook 獨立開發)**
  不再只有乏味的文字與圖表，本專案提供多維度的視角：
  - **3D 主機機架監控 (`@react-three/fiber` + `three.js`)**
    即時渲染可旋轉拖曳的 3D 伺服器機房介面。點擊可監看各節點 CPU、RAM 等負載並帶有動態的呼吸選取效果。
  - **全球地區網路地圖 (`Pixi.js`)**
    基於 WebGL 高效能渲染的 2D 互動式世界地圖。可精確顯示各大洲（北美、歐洲、亞洲等）的節點健康度，支援高流暢度 Hover 和事件點擊互動。
  - 視覺化元件已全面抽離並整合至 **Storybook**，支援多種狀態（正常、警告、異常）的獨立預覽。

- **🔒 完整的基礎架構與權限控管 (RBAC)**
  - 使用 `react-router-dom` 實作包含登入認證攔截的**路由保護機制 (Protected Route)**。
  - 內建 **AdminRoute** 角色權限隔離，提供專屬的「帳號控管」後台（支援新增、切換權限、停用/啟用刪除使用者）。
  - 各頁面（儀表板、地圖、3D、帳號等）均實作了 **API 優先 + 失敗時自動 Fallback 至本地 Mock Data** 的強健機制。

## 🛠️ 技術棧 (Tech Stack)

| 領域 | 技術與函式庫 | 說明 |
| --- | --- | --- |
| **框架** | React 19, Vite, TypeScript | 核心基礎、組建構建工具 |
| **路由** | react-router-dom (v7) | 前端應用路由管理 |
| **狀態管理** | Zustand | 模組化且簡單的全局狀態掌控 (例：Store, Auth) |
| **樣式設計** | Tailwind CSS v4, Lucide React (Icons) | Utility-first 的設計系統 |
| **3D 引擎** | Three.js, @react-three/fiber, @react-three/drei | 實作 3D 機房儀表板元件 |
| **2D 繪圖** | Pixi.js (v8) | 實作全球 2D 互動拓樸地圖元件 |
| **元件開發** | Storybook (v10) | 獨立開發並測試 UI 與視覺化組件庫 |

## 📦 安裝與啟動 (Getting Started)

### 1. 安裝套件
確保你的環境中擁有一套 Node.js (推薦 v20 以上)
```bash
npm install
```

### 2. 啟動開發伺服器
```bash
npm run dev
```
執行後在瀏覽器開啟 `http://localhost:5173/` 預覽，預設情況下如果處於未登入狀態，將自動跳轉回 `/login` 登入頁面。

### 3. 本地測試帳號
- **系統管理員 (Admin)**：`admin@example.com` / `admin` (具備帳號控管權限)
- **一般使用者 (User)**：`user1@example.com` / `user1` (僅供檢視儀表板)

### 4. 其他指令
- 建置生產品版本：`npm run build`
- 啟動 Storybook 檢視原子組件庫（支援深色模式）：`npm run storybook`
- 執行 Lint 進行程式碼品質檢查：`npm run lint`

## 📂 專案架構 (Folder Structure)

```text
├── .storybook/       # Storybook 設定檔（已設定深色主題預設）
├── public/           # 靜態資源 (e.g. world-map.png 背景圖)
├── src/
│   ├── components/   
│   │   ├── ui/             # 共用基礎 UI 組件 (Button, Badge, StatCard)
│   │   └── visualization/  # 💡 複雜視覺化獨立元件 (WorldMap.tsx, ServerRoom3D.tsx)
│   ├── layout/       # 大版面結構組件 (AdminLayout, Sidebar, Header)
│   ├── pages/        # 全頁面組件
│   │   ├── Login.tsx           # 系統登入頁
│   │   ├── Home.tsx            # 總覽儀表板
│   │   ├── HostStatus3D.tsx    # 3D 主機狀態機房展示
│   │   ├── Region.tsx          # Pixi WebGL 地區拓樸圖
│   │   ├── AccountSettings.tsx # 個人帳號設定
│   │   └── UserManagement.tsx  # 🔒 [Admin Only] 帳號權限控管後台
│   ├── router/       # RRD 路由定義、ProtectedRoute 與 AdminRoute 邏輯
│   ├── store/        # Zustand 狀態管理 (authStore, appStore)
│   ├── types/        # TypeScript 共用型別 (dashboard.ts)
│   ├── index.css     # Tailwind CSS 全局樣式入口
│   ├── App.tsx       # RouterProvider 進入點
│   └── main.tsx      # React DOM Render 進入點
├── package.json
└── vite.config.ts    # Vite 構建環境配置
```

## 📝 後續維護與規劃 (Roadmap)
- [x] 重構 Pixi / 3D 視覺化邏輯為獨立 Storybook 元件。
- [x] 串聯 API 請求機制，並同時保持強健的 Mock Fallback 備援。
- [x] 整合基於角色的權限控管系統 (RBAC)。
- [ ] 串聯真實的 Websocket 呈現即時資料流 (Streaming Data)。
- [ ] 導入 i18n 多國語系架構支援。
- [ ] 增加單元測試基礎建置 (Vitest / React Testing Library)。
