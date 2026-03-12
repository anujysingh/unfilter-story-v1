# Product Requirements Document (PRD) — v1.6
# Unfilter Story — News Platform & Support Infrastructure

**Version:** 1.6 (Comprehensive Update)  
**Date:** March 12, 2026  
**Status:** Current — Reflecting Finalized Implementation  
**Owner:** Product Team

---

## 1. Executive Summary

**Unfilter Story** is a high-performance, design-centric media platform optimized for technical precision and editorial efficiency. It serves two distinct audiences:
1.  **Readers**: A lightning-fast, branding-consistent news portal built with Astro 5.
2.  **Editors/Admins**: A professional-grade CMS dashboard with AI-assisted drafting, real-time article lifecycle management, and a robust support infrastructure.

---

## 2. IBM Branding & Design System

The platform strictly follows the **IBM "Technical Precision & Grid Brutalism"** visual language.

### 2.1 Visual Identity
*   **Typography**: 
    *   **IBM Plex Sans**: Standard UI elements, menus, and article body text.
    *   **IBM Plex Mono**: Metadata (dates, counts, categories), code snippets, and technical indicators.
*   **Color Palette**:
    *   **Primary Background**: IBM Gray 100 (#161616) or Pure White (#FFFFFF).
    *   **UI Surfaces**: IBM Gray 90 (#262626) with refined elevation.
    *   **Accents**: IBM Blue 60 (#0F62FE) for primary actions and Unfilter Red (#E94560) for alerts.
*   **Branding Elements**: Centralized usage of the **IBM 8-bar logo** and consistent 1px grid-line borders to convey technical robustness.

---

## 3. CMS Admin — Article Management Lifecycle

The CMS dashboard provide editors with granular control over the article release cycle.

### 3.1 Advanced Action System
Every article in the dashboard features a **Context-Aware Action Dropdown** that adapts based on the article's current status:
*   **Draft/Unpublished Articles**:
    *   **Edit Article**: Direct jump to the rich text editor.
    *   **Publish Now**: Immediate transition to live state.
*   **Scheduled Articles**:
    *   **Publish Now**: Force an immediate release.
    *   **Change Date**: Reschedule via an inline calendar/time picker.
    *   **Cancel Scheduling**: Revert the article to "Draft" status (Requires Confirmation).
*   **Published Articles**:
    *   **Unpublish**: Safely take an article offline (Requires Confirmation).

### 3.2 Premium Modal System
All critical actions (Delete, Unpublish, Cancel Scheduling, Publishing) utilize **Custom High-Aesthetic Modals** instead of browser-based prompts. 
*   **Features**: Glassmorphism backdrops, specific Lucide icons, and descriptive action labels (e.g., "Yes, Unpublish", "Confirm Cancellation").

### 3.3 Dynamic Filtering & Search
*   **Real-time Synchronization**: The "Category" and "Tags" filters update instantly when new metadata is created in sibling tabs.
*   **Headline Search**: High-performance search by headline with debounce logic.
*   **Date Range Filtering**: Quick presets (Today, Last 7 Days) or custom technical date range selection.

---

## 4. CMS Admin — Pro Article Editor

A high-performance drafting environment optimized for modern web journalism.

### 4.1 TipTap "Pro" Implementation
*   **Sticky Premium Toolbar**: A glassmorphism-enhanced toolbar with technical precision controls.
*   **AI Writing Hub**:
    *   **Tone Transition**: Modify highlighted text into Professional, Casual, or Concise styles.
    *   **Smart Drafting**: Generate or expand content based on headlines.
*   **Technical Metadata Control**: Integrated fields for SEO titles, meta descriptions, categories, and tags with multi-select capabilities.

---

## 5. Support Platform — Room & Ticket Management

A temporary communication bridge between Algo Providers and Clients.

### 5.1 Temporary Support Rooms
*   **Invite Link Logic**: Generates secure, unique URLs for restricted access.
*   **Automated Expiry**: 
    *   Rooms defaulted to 15 days; extendable by Admin.
    *   Transition to read-only state upon expiry.
*   **Data Privacy**: Automated purge of archived rooms after 30 days.

---

## 6. Technical Architecture

### 6.1 Modern Stack
*   **Frontend**: 
    *   **Public Site**: Astro 5 (Zero-JS baseline, Islands architecture).
    *   **CMS Dashboard**: React 18 with Vite for instantaneous HMR.
*   **Backend**: Fastify for high-throughput API performance.
*   **Database**: PostgreSQL 16 managed via Prisma ORM.
*   **Real-time Layers**: Socket.IO for chat and real-time dashboard updates.

### 6.2 Key Indicators
*   **SEO**: Semantic HTML5 hierarchy, automated meta-tag generation, and fast TTI scores.
*   **UX**: Adaptive layouts for mobile and technical tablet environments.

---

## 7. Project Structure

```text
unfilter-story/
├── api-backend/           # Fastify Business Logic
├── cms-admin/             # React Editorial Dashboard
├── public-site/           # Astro 5 High-Speed News Site
└── PRD.md                 # Product Definitions
```

---

## 8. Future Roadmap (The Vision for v2.0)

A detailed roadmap for the next major evolution of the platform has been developed. Key focus areas include native RSS feeds, automated newsletters, Razorpay subscriptions, and native mobile applications.

**For the full v2.0 feature analysis, refer to:**  
📄 [PRD (V.2).md](./PRD%20(V.2).md)

---
*Maintained by Antigravity AI — Comprehensive Update v1.6*
