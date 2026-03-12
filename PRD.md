# Product Requirements Document (PRD) — v1.6
# Unfilter Story — News Platform & Support Infrastructure

**Version:** 1.6 (Comprehensive Update)  
**Date:** March 12, 2026  
**Status:** Current — Reflecting Finalized Implementation  
**Owner:** Product Team

---

## 1. Executive Summary

**Unfilter Story** is a high-performance, design-centric media platform optimized for technical precision and editorial efficiency. It serves two distinct audiences:
1.  **Readers**: A lightning-fast, branding-consistent news portal built with Astro 5, delivering content with sub-second load times.
2.  **Editors/Admins**: A professional-grade CMS dashboard with AI-assisted drafting, real-time article lifecycle management, and advanced metadata controls.

The platform is built on the pillar of "Technical Precision," merging high-end editorial tools with a brutalist, IBM-inspired aesthetic.

---

## 2. IBM Branding & Design System

The platform strictly follows the **IBM "Technical Precision & Grid Brutalism"** visual language to convey reliability and technical depth.

### 2.1 Core Visual Language
*   **Typography**: 
    *   **IBM Plex Sans**: Used for standard UI elements, menus, and article body text to ensure maximum readability.
    *   **IBM Plex Mono**: Used for technical metadata (dates, counts, categories), code snippets, and UI indicators.
*   **Color Palette**:
    *   **Primary Background**: IBM Gray 100 (#161616) for dark mode / White (#FFFFFF) for light mode.
    *   **UI Surfaces**: IBM Gray 90 (#262626) providing subtle depth.
    *   **Accents**: IBM Blue 60 (#0F62FE) for primary actions and Unfilter Red (#E94560) for critical states.
*   **Grid System**: A rigorous 1px grid-line border system (IBM Gray 80) is used across the dashboard to emphasize structure and precision.
*   **Iconography**: Strict usage of **Lucide Icons** styled with consistent stroke weights.

---

## 3. CMS Admin — Article Management Lifecycle

The CMS dashboard provides editors with absolute control over the article release cycle through a highly interactive interface.

### 3.1 Advanced Action System
Every article in the dashboard features a **Context-Aware Action Dropdown** (z-index: 100) that adapts based on the article's state:
*   **Draft / Unpublished**:
    *   **Edit Article**: Opens the Pro Editor.
    *   **Publish Now**: Triggers immediate publication.
*   **Scheduled**:
    *   **Publish Now**: Forces immediate release, bypassing the schedule.
    *   **Change Date**: Inline date-time adjustment via technical calendar picker.
    *   **Cancel Scheduling**: Reverts article to "Draft" state (Requires confirmation).
*   **Published**:
    *   **Unpublish**: Safely takes content offline while preserving it in the dashboard (Requires confirmation).

### 3.2 Premium Modal & Confirmation System
All destructive or critical actions (Delete, Unpublish, Cancel Scheduling) utilize **Custom High-Aesthetic Modals** (Glassmorphism effect) instead of browser prompts. 
*   **Dynamic Labels**: Buttons display context-specific text like "Yes, Unpublish" or "Cancel Scheduling" to prevent user error.

### 3.3 Search & Discovery Suite
*   **Cross-Tab Metadata Sync**: Categories and Tags filters update instantly when modified in and other parts of the CMS, ensuring no stale filter data.
*   **Technical Search**: Headline-based search with real-time results.
*   **Status Filters**: Quick filtering by Published, Scheduled, Draft, or Unpublished states.
*   **Technical Date Range**: Filtering articles using a precision "From - To" date picker with quick presets (Today, Yesterday, Last 7 Days).

---

## 4. CMS Admin — Pro Article Editor

A world-class writing environment designed for modern journalists.

### 4.1 TipTap Editor Suite
*   **Sticky Premium Toolbar**: A technical toolbar that remains fixed at the top during scrolling, featuring glassmorphism and IBM-styled controls.
*   **AI Writing Hub**:
    *   **Rewrite & Tone**: Highlight any text to instantly rewrite it in Professional, Casual, or Concise tones.
    *   **Draft Generation**: AI-powered content expansion based on minimal input.
*   **Grammar Assistant**: Inline technical underline and correction system for editorial precision.
*   **Rich Media Nodes**: Custom image nodes with caption, credit, and alignment controls.
*   **Metadata Sidebar**: Integrated controls for SEO Title, Meta Description, Categories, and Tags.

---

## 5. Technical Architecture

### 6.1 Frontend Development
*   **Public Site**: Built with **Astro 5** for maximum SEO and performance. Uses a "Zero-JS by default" approach with Islands architecture for interactive elements.
*   **CMS Dashboard**: Built with **React 18** and **Vite**, featuring sub-200ms HMR for an instantaneous development and editing experience.

### 6.2 Data & Logic
*   **Database**: PostgreSQL 16 managed via Prisma ORM for type-safe database queries.
*   **Schema**: Robust relational model handling nested Categories, Tags, and Versioning history.
*   **API**: Fastify (Node.js) providing a low-overhead, high-concurrency backend.

---

## 6. Project Structure

```text
unfilter-story/
├── api-backend/           # Fastify Business Logic & Prisma Schema
├── cms-admin/             # React SPA (The "Pro" Dashboard)
├── public-site/           # Astro 5 High-Speed Public Website
└── PRD.md                 # Current Implementation Reference
```

---

## 7. Future Roadmap (The Vision for v2.0)

For features currently in the planning stage (RSS Aggregators, Newsletters, Subscriptions, and Mobile Apps), refer to the dedicated roadmap:

📄 [PRD (V.2).md](./PRD%20(V.2).md)

---
*Maintained by Antigravity AI — End-to-End Update v1.6*
