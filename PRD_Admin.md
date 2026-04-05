# PRD — CMS Admin (Editorial Suite)
# Unfilter Story — News Platform & Editorial Infrastructure

**Version:** 2.8  
**Date:** March 22, 2026  
**Status:** Feature Complete — High-Frequency Archival Cycle Active  
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

### 3.10 Discovery Engine (Signal Intelligence Console v2.0)
*   **Professional Research Environment**:
    *   High-density, pixel-perfect UI with **Natural Casing** and **Non-Italic** typographic mandate for maximum legibility.
    *   **Logo Intelligence System**:
        *   **Real-Time Visual Attribution Sync**: Backend-driven mapping of partner logos to news signals during every fetch cycle.
        *   **Multi-Layered Fallback Hierarchy**: Four-stage resilience protocol (Curated > Google S2 > IconHorse > Typographic Badge).
    *   **Ergonomic Research Sidebar (Collapsible UX)**:
        *   **Tactical Parameter Management**: Collapsible sectors for *Temporal Radius, Startup Category, Industries, and News Perimeter*.
    *   **Universal Intelligence Matrix (v13.0 - Purified)**:
        *   **The Purified Signal Doctrine**: Explicit exclusion of non-startup "noise" (Macro-Economics, GDP, Stocks, General Public Market IPOs) to ensure 100% actionable startup intelligence.
        *   **Startup Signal Taxonomy (19 Master Signals)**: 
            *   *Actionable Economics*: Funding, Funding Ask, Revenue Milestone, Acquisition, Layoffs, Shutdown.
            *   *Growth Milestones*: Startup Launch, Product News / Launch, Expansion, Partnership.
            *   *Strategic Intelligence*: Founder Story / Profile, Pivot, Regulatory / Policy, Leadership / People, Legal / Litigation, Ecosystem News.
            *   *Content Intelligence*: Tech Guides / Tutorials, Trends / Future Tech, Product Review / Opinion, Innovation / Breakthrough.
        *   **Industry Vertical Taxonomy (25 Verticals)**: 
            *   *Core Tech*: Fintech, EdTech, HealthTech, MobilityTech, FoodTech, TravelTech, AI / ML, Cybersecurity, Web3 / Blockchain, ClimateTech / Sustainability, AgriTech, CleanTech / EV.
            *   *Infrastructure*: Developer Infrastructure / Cloud, SpaceTech / DeepTech, Telecom / Infrastructure, Manufacturing / Industrial.
            *   *Consumer/B2B*: Social / Community Platforms, SaaS / B2B, D2C / E-Commerce, LogisTech, Gaming / Media, Real Estate Tech, Government / Policy, Big Tech / Consumer Software.
    *   **Signal Conflict Resolution (PRD v2.0 Ruleset)**:
        1.  **Rule 1 — Single-Signal Integrity**: Every article is assigned exactly **ONE** primary signal. Multi-tagging is prohibited for Signals to ensure structural clarity. Order of Priority: *Funding > Shutdown > Layoffs > Acquisition > ... > Innovation*.
        2.  **Rule 2 — Structural Subject Weighting**: Triggers found in the Title take absolute precedence over Body mentions.
        3.  **Rule 3 — Semantic False-Positive Guards**: Cross-sector filtration (e.g., "AI/ML" news cannot trigger "EdTech" without explicit education-sector anchor words).
        4.  **Rule 4 — Whole-Word Precision**: Use of `\b` boundary enforcement in the Regex core to prevent contextual "leakage" (e.g., "space" vs "personal space").
*   **Tactical Control Row**:
    *   **Live Sync Controls**: Dedicated sidebar panel displaying real-time database density, timestamps of the last automated sync operations, and manual triggers.
    *   **Precision Calendar Matrix**: Interactive date selection (Start/End) explicitly max-capped at a 3-month (90 day) retrospective filter limit for optimal performance.
*   **Two-Tier Synchronization Architecture (RSS Engine)**:
    *   **Lightweight Quick Sync (~10s)**: A high-frequency incremental fetch running every 30 minutes. It probes exclusively the top item of each source and exits early upon database cache overlap to completely eliminate API rate-limits and CPU strain.
    *   **Deep Archival Scan (Initial Boot & Manual-Only)**: The computationally expensive 100-page historical rescan logic is strictly isolated. It automatically triggers *only* if the initial database is entirely empty, or when invoked via the manual UI "Full Rescan" override button.
    *   **Continuous Live UI Banners**: Frontend polling loop tracking real-time sync progress natively across the Discovery Dashboard, rendering auto-update notices gracefully.
*   **Automated Data Retention Protocol**:
    *   **The 6-Month Perimeter**: Scrapers strictly enforce a hard 6-month rejection cutoff for incoming signals. 
    *   **Self-Managing Database Pruning**: On system startup and recursively every 24 hours thereafter, a maintenance job irrevocably deletes any non-bookmarked signal physically older than 180 days to maintain peak database read performance and strictly bound storage consumption.

---

## 4. Technical Requirements
*   **Frontend**: React 19 & Vite.
*   **API**: Node.js Fastify (50MB payload limit) with **RSS Parsing (Depth 100)**, integrated **Logo Fallback Services**, and **Regex-based Whole-Word Matching** for industrial-grade classification confidence.
*   **Database**: SQLite/PostgreSQL via Prisma with **High-Density Temporal Indexing**.

---

*Maintained by Antigravity AI — Admin PRD v2.8*
