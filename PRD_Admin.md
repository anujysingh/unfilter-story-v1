# PRD — CMS Admin (Editorial Suite)
# Unfilter Story — News Platform & Editorial Infrastructure

**Version:** 2.0  
**Date:** March 14, 2026  
**Status:** Feature Complete — Strategic Expansion Active  
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
*   **Industrial-Grade Research Environment**:
    *   High-contrast, pixel-perfect UI tailored for high-speed editorial scanning.
    *   **Signal Navigation Matrix**:
        *   **News Perimeter Selection**: Multi-select filtering across major news sources (*Entrackr, YourStory, Inc42, etc.*).
        *   **Industry Signal Matrix**: Multi-select thematic filtering by categories (*Funding, Tech, AI, etc.*) with dynamic extraction.
*   **Tactical Control Row**:
    *   **View Mode Matrix**: Iconographic toggles for high-density **Grid** or **List** viewing.
    *   **Operational Controls**: Integrated **Bookmarking** engine (state-aware) and **Temporal Control** (7d, 15d, 30d, Anytime signals).
    *   **Density Plane Adjustment**: Configurable signal volume (10, 20, 50 per page).
*   **Signal Intelligence Bar**:
    *   **Dynamic Status Core**: Real-time tracking of **Total Signals** across the active research perimeter.
    *   **Pagination Console**: High-precision navigation with deep tracking (e.g., "PAGE 1 OF 22").
*   **Deep Signal Sync (Backend Architecture)**:
    *   **Historical Archive Recovery**: Automated multi-page RSS crawling (Depth 1-10) to bridge year-over-year news gaps.
    *   **Source Normalization Engine**: Automated publisher identification and author-level routing.
    *   **Server-Side Intelligence**: High-performance Prisma filtering for sub-second signal acquisition.

---

## 4. Technical Requirements
*   **Frontend**: React 19 & Vite.
*   **API**: Node.js Fastify (50MB payload limit) with **RSS Parsing (Depth 10)**.
*   **Database**: SQLite/PostgreSQL via Prisma with **High-Density Signal Indexing**.

---
*Maintained by Antigravity AI — Admin PRD v2.0*
