# PRD — CMS Admin (Editorial Suite)
# Unfilter Story — News Platform & Editorial Infrastructure

**Version:** 2.6  
**Date:** March 15, 2026  
**Status:** Feature Complete — Industrial Archival Cycle Active  
**Owner:** Product Engineering Team

---

## 1. Executive Summary
The **Unfilter Story CMS Admin** is a professional-grade editorial environment designed for high-performance journalism. It provides a distraction-free writing experience, integrated AI assistance, and robust media management to ensure every story published meets the highest technical and aesthetic standards.

---

## 2. Target User: The Professional Editor (Vikram)
*   **Needs**: High-speed drafting (TipTap), automated image compression, and high-fidelity article management.
*   **Key Achievement**: Eliminates the need for external image optimization (Squoosh/Photoshop) through native client-side processing.

---

## 3. Feature Specifications

### 3.1 Pro-Writing Environment (TipTap)
*   **Headline & Content Interface**:
    *   **High-Volume Headline**: Dedicated input for high-impact titles with "Enter Article Headline..." guidance.
    *   **Immersive Body**: Minimalist writing area with "Start writing..." placeholder.
*   **Taxonomy & Scheduling (Meta-Panel)**:
    *   **Dynamic Category Selection**: Single-select dropdown for assigning stories to specific feeds.
    *   **Intelligent Tagging**: Multi-select tag input with **Predictive Suggestions** and quick-add visual chips.
    *   **Precision Scheduling**: Integrated date picker for setting the official "Publishing Date" in advance.
*   **Advanced Rich-Text Toolbar**:
    *   **Formatting Layers**: Core formatting (Bold, Italic, Underlined, Strike) combined with Heading/Paragraph levels.
    *   **Technical Typography Controls**: Dual-font architecture using **Inter** (UI/Functional) and **Playfair Display** (Editorial Headlines).
    *   **Visual Alignment**: Comprehensive alignment suite (Left, Center, Right, Justify).
    *   **Advanced Tools**: Integrated **Color Picker** (Brand-aligned colors), Code marks, Quote blocks, and direct **Image/YouTube insertion**.
*   **Workspace Optimization**: 
    *   **Live Status Indicators**: Real-time status reporting (e.g., "WORKSPACE READY", "SAVING...") in Dark Green to provide editor feedback.
    *   **Editorial Metrics**: High-precision footer tracking for **Word Count** and **Character Count**.
*   **Mandatory Header Image**: 
    *   Articles cannot be published without a featured header image (Mandatory validation logic).
    *   Technical Guidance: Specific UI recommendations provided (**1600x900px recommended**).
    *   Visual Indicators: High-impact validation states and prominent "MANDATORY" labeling in branded typography.
*   **Contextual Toolbars**: Sticky glassmorphism toolbar for formatting and a floating bubble menu with Dark Green accents.
*   **AI Drafting Suite**: Integrated LLM for rewriting text in different tones (Professional, Concise, Casual).
*   **Slash Command Menu (`/`)**: Quick-insertion for media, tables, and lists.

### 3.2 Asset Performance & Compression Engine
*   **Native Re-encoding**: Utilizes HTML5 Canvas API to compress all images to JPEG (70% quality).
*   **Automated Resizing**: Enforces a 1920px maximum width to optimize site speed.
*   **Security Guards**: Blocks uploads > 5MB and restricts formats to PNG/JPEG only.

### 3.3 Centralized Media Library 
*   **Auto-Registration**: Every image uploaded via articles is automatically synced to the global library.
*   **Search & Indexing**: Real-time search by filename with metadata visibility (Size, Date, Format).
*   **Direct Management**: Ability to upload or permanently delete assets independently.

### 3.4 Navigation & Menu Management
*   **Hierarchical Header Control**:
    *   **Unified CRUD Ops**: Full Create, Read, Update, and Delete capabilities for the website's main menu.
    *   **Nested Sub-Menus**: Ability to create multi-level navigation structures (Parents/Children).
    *   **Smart Slug Engine**: Automated real-time URL generation (e.g., "Technology" -> `/category/technology`) with **Manual Override Detection** to preserve custom paths.
*   **Format & Types**:
    *   **Versatile Item Types**: Support for standard **Links**, **Dropdowns**, and **Category Groups**.
    *   **Custom Ordering**: High-fidelity **Drag-and-Drop Engine** using `@dnd-kit` for tactile, real-time reordering of main items and sub-menus with automated backend priority syncing.
*   **Visual Management**:
    *   **Hierarchical Registry**: An indented tree view for nested sub-menus with specialized styling for child items.

### 3.5 Taxonomy & Structural Management
*   **Unified Taxonomy Hub**:
    *   **Categories Registry**: List-based management of primary content divisions with automated **Slug Generation** and real-time count badges.
    *   **Visual Tag Index**: Multi-column grid of hashtag-style content markers for quick thematic scanning.
*   **Administrative Actions**:
    *   **Inline Editing**: Ability to rename or modify slugs for categories directly from the registry view.
    *   **Creation Modals**: Dedicated workflows for "Add Category" and "Add Tag" to expand site hierarchy.
    *   **Cleanup Tools**: One-click deletion of unused tags or categories to maintain structural integrity.

### 3.5 Article Registry & Dashboard
*   **Editorial Table**: Tracking of **Headline, Status, Author, Category, Tags, and Date**.
*   **Visual Badging**: Dark Green (Published), Sky Blue (Scheduled), Neutral (Draft), Warning (Unpublished).
*   **Live Sync**: Automated 30-second background polling ensures state consistency across editors.
*   **Action Menu**: Context-aware menu for "Republish", "Unpublish", and "Reschedule" workflows.

### 3.6 Dashboard Overview (Intelligence)
*   **Performance Snapshot**:
    *   **Core Metrics**: Real-time tracking of **Published Articles, Total Authors, and Total Views**.
    *   **Growth Analytics**: Visual indicators for monthly percentage changes (e.g., "+12% from last month").
*   **Activity Stream**:
    *   **Recent Activity Feed**: Centralized list of recent editorial actions and site updates.

### 3.7 User & Role Management
*   **Team Registry**:
    *   **User Identity**: Tracking of Name, Email, and status (Active/Inactive).
    *   **Role-Based Access**: Permission-aware roles (e.g., **Admin, Editor**) with visual labeling.
*   **Collaboration Tools**:
    *   **Invite System**: Integrated workflow for onboarding new editorial staff members via email.

### 3.8 Global Site Configuration (Settings)
*   **Information Governance**:
    *   **Site Identity**: Centralized management of Site Title and SEO Meta Description.
*   **Feature Flags**:
    *   **Newsletter Optimization**: One-click toggle for enabling/disabling subscription widgets on the public site.

### 3.9 Site Architecture & Routing Observer
*   **Visual Site Mapping**:
    *   **Architecture Flow**: A structural overview showing how **Core Pages**, **Category Feeds**, and **Article Slugs** are interconnected.
    *   **Routing Discovery**: Automated listing of all live URLs currently active on the public website.
*   **Content Model Visualization**:
    *   **Source Mapping**: Visual indicators showing which categories drive which specific page sections.
    *   **Path Validation**: Real-time status checks for permalinks to ensure no routing conflicts.

### 3.10 Discovery Engine (Signal Intelligence Console)
*   **Professional Research Environment**:
    *   High-density, pixel-perfect UI with **Natural Casing** and **Non-Italic** typographic mandate for maximum legibility.
    *   **Logo Intelligence System**:
        *   **Real-Time Visual Attribution Sync**: Backend-driven mapping of partner logos to news signals during every fetch cycle, ensuring zero-latency brand recognition.
        *   **Multi-Layered Fallback Hierarchy**: A four-stage resilience protocol for elusive logos:
            1. **Primary**: High-fidelity logo from curated partner metadata.
            2. **Secondary**: Tactical domain-based favicon harvesting (Google S2).
            3. **Tertiary**: Emergency lookup via *IconHorse* intelligence vectors.
            4. **Final Response**: High-contrast typographic badge ensuring zero "broken" visual states.
    *   **Ergonomic Research Sidebar (Collapsible UX)**:
        *   **Tactical Parameter Management**: All intelligence vectors—*Temporal Radius, Startup Category, Industries, and News Perimeter*—are individually collapsible to optimize vertical focus.
        *   **Fluid Interaction Layer**: Smooth entry/exit animations with persistent batch action controls (ALL | CLR).
    *   **Signal Navigation Matrix**:
        *   **News Perimeter Selection**: Multi-select filtering across the 16-point Strategic Intelligence Matrix (*YourStory, Inc42, Entrackr, Economic Times, VCCircle, LiveMint, Moneycontrol, StartupTalky, Entrepreneur India, The Ken, Morning Context, Finshots, IndianStartupNews, TICE News, StartupNews.fyi, Google News*).
        *   **Startup Category Matrix**: Multi-select thematic filtering across a **Dual-Vector Intelligence Matrix** (21 Industry Verticals + 10 Business Signals).
        *   **Multi-Tiered Signal Architecture**: Automated high-confidence classification for 10 critical business events (**Funding, Startup Launch, Acquisition, Shutdown, Layoffs, Product Launch, Founder Interview, Pivot, Funding Ask, Revenue Milestone**).
        *   **Signal Conflict Resolution (PRD v1.9 Ruleset)**:
            1.  **Rule 1 — Priority Hierarchy**: If multiple signals compete, the higher-priority signal wins. Order: **Funding > Shutdown > Layoffs > Acquisition > Pivot > Funding Ask > Revenue Milestone > Startup Launch > Product Launch > Founder Interview**.
            2.  **Rule 2 — Multi-Tag Capability**: Articles covering multiple discrete events (e.g., "raises $200M" + "turns profitable") are assigned dual tags.
            3.  **Rule 3 — Strategic Cap**: A maximum of **2 tags** per signal pulse. If 3+ signals qualify, Rule 1 selects the top 2.
            4.  **Rule 4 — Headline Subject Weighting**: Triggers found in the grammatical subject/headline take absolute priority over body mentions (Tiebreaker).
*   **Tactical Control Row**:
    *   **View Mode Matrix**: Iconographic toggles for high-density **Grid** or **List** viewing.
    *   **Precision Calendar Matrix**: Interactive date selection for specific windows (e.g., 13th March 2026). Users can provide only a **Start Date** to isolate signals for a single day (EndDate is non-mandatory).
    *   **Manual Trigger Protocol**: Custom ranges require an explicit **APPLY** action to trigger signal acquisition, preventing partial fetches during input calibration.
    *   **Temporal Constraint Guard**: Single-scan date ranges are strictly limited to **90 days**. Adjusting signal density (10, 20, 50 per page) triggers immediate, sub-second re-fetches to maintain UX fluidity.
    *   **Dynamic 1-Year Lifecycle**: A strict 1-year rolling research perimeter. Historical signals are automatically maintained by the background archival worker.
    *   **Temporal Precision Guard**: Mandatory capture of original publishing date/time (isoDate priority). Fallback to system time is strictly prohibited to prevent signal spoofing.
*   **Signal Intelligence Bar**:
    *   **Dynamic Status Core**: Real-time tracking of **Total Signals** across the active research perimeter.
    *   **Pagination Console**: High-precision navigation with deep tracking (e.g., "Unit 1 / 58").
    *   **Emergency Signal Sync**: Circular manual trigger to bypass cache and force a fresh re-linking of brand assets and signal metadata.
*   **Deep Signal Sync (Backend Architecture)**:
    *   **Thematic Routing Engine**: Automated keyword mapping layer that performs dual-vector classification and priority-based conflict resolution.
    *   **Signal Keyword Dictionary**: A multi-tiered lexicon (v1.9) with specific confidence thresholds for industrial business events.
    *   **Historical Archive Recovery**: Automated multi-page RSS crawling with **High-Density Depth (up to 100 pages)**.
    *   **Autonomous Archival Worker**: Background cron-style cycle (4-hour interval) ensuring the 1-year research lifecycle is permanently populated.
    *   **Parallel Ingestion Core**: Simultaneous processing of 3-source batches to accelerate signal acquisition.

---

## 4. Technical Requirements
*   **Frontend**: React 19 & Vite.
*   **API**: Node.js Fastify (50MB payload limit) with **RSS Parsing (Depth 100)**, integrated **Logo Fallback Services** (Google, IconHorse), and autonomous background workers.
*   **Database**: SQLite/PostgreSQL via Prisma with **High-Density Temporal Indexing** and Real-time Brand Mapping.

---
*Maintained by Antigravity AI — Admin PRD v2.6*
