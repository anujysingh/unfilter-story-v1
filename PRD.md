# Product Requirements Document (PRD) — v1.6
# Unfilter Story — News Platform & Editorial Infrastructure

**Version:** 1.6 (Comprehensive Restoration)  
**Date:** March 12, 2026  
**Status:** Baseline Established  
**Owner:** Product Engineering Team

---

## 1. Executive Summary

**Unfilter Story** is a high-performance, design-centric media platform optimized for technical journalists and news readers who value speed, precision, and aesthetics. The platform merges a world-class editorial drafting environment (CMS) with a sub-second performance delivery engine (Public Site).

Our mission is to provide an "Unfiltered" news experience by removing technical bloat and focusing on high-readability typography and brutalist design principles inspired by IBM.

---

## 2. User Personas

### 2.1 The Professional Editor (Vikram)
*   **Role**: Senior Journalist / Managing Editor.
*   **Needs**: A distraction-free writing environment, AI-powered drafting assistance, and absolute control over the publishing calendar.
*   **Pain Points**: Clunky CMS interfaces, lack of grammar checking, and difficult image management.

### 2.2 The Tech-Savvy Reader (Ananya)
*   **Role**: Consumer of high-quality tech and startup news.
*   **Needs**: Instant page loads, clean typography, and a mobile-optimized reading experience.
*   **Pain Points**: Heavy ads, slow trackers, and visual clutter.

### 2.3 The Site Administrator (Rahul)
*   **Role**: Platform Manager.
*   **Needs**: High-level visibility into article performance, category management, and data integrity.
*   **Pain Points**: Stale data in dashboards and poor metadata synchronization.

---

## 3. User Goals & Central Objectives

1.  **Editorial Efficiency**: Reduce the time from "Initial Idea" to "Published Article" by 40% through AI assistance.
2.  **Performance Supremacy**: Achieve a Google Lighthouse score of 95+ for Performance and SEO.
3.  **Design Consistency**: Enforce strict IBM Technical Precision branding across both the admin and the public portal.

---

## 4. Feature Specifications — CMS Admin (The Editorial Suite)

### 4.1 Pro-Writing Environment (TipTap)
*   **Contextual Toolbars**: Sticky glassmorphism toolbar for formatting and a floating bubble menu for quick edits.
*   **AI Drafting Suite**: Integrated LLM for rewriting text in different tones (Professional, Concise, Casual).
*   **Grammar Precision**: Inline wavy underlining for stylistic and grammatical corrections.
*   **Slash Command Menu (`/`)**: Quick-insertion for media, tables, and lists.

### 4.2 Article Lifecycle Management
*   **Status Workflow**: Articles transition seamlessly between **Draft → Scheduled → Published**.
*   **Action Dropdowns**: A status-aware menu allowing for "Publish Now," "Unpublish," or "Cancel Scheduling."
*   **Scheduling Engine**: High-precision calendar for setting future release dates.
*   **Safety Guards**: Custom confirmation modals (Glassmorphism) for all reversing/destructive actions.

### 4.3 Data Management & Metadata
*   **Sync Logic**: Filters for categories and tags update in real-time when new ones are added.
*   **SEO Controls**: Custom fields for SEO titles, descriptions, and social preview images.
*   **Media Library**: Integrated asset management for all editorial images.

---

## 5. Feature Specifications — Public Portal (The Reader Experience)

### 5.1 Presentation Layer
*   **Home Stream**: A high-speed feed of the latest stories powered by Astro 5.
*   **Technical Typography**: Strict usage of IBM Plex Sans for long-form reading and IBM Plex Mono for technical data points.
*   **Responsive Precision**: Layouts that adapt perfectly from 4K editorial monitors to mobile screens.

### 5.2 Performance & SEO
*   **Zero-JS Baseline**: The public site loads minimal JavaScript to ensure sub-second Time-to-Interactive (TTI).
*   **Semantic SEO**: Proper HTML5 heading hierarchies, automated meta-tag generation, and schema.org markup.

---

## 6. Design System — IBM Technical Precision

The platform follows a **Brutalist Grid Design** language.

*   **Grid Lines**: Consistent 1px borders (IBM Gray 80) across all card, table, and sidebar elements.
*   **Colors**: Primary (#161616), Neutral Grey (#262626), Accent Blue (#0F62FE), and Alert Red (#E94560).
*   **Aesthetics**: Minimalistic whitespace balanced with highly precise technical metadata labels.

---

## 7. Technical Requirements

*   **Frontend**: Astro 5 (Public), React 18 & Vite (Admin).
*   **Backend**: Node.js Fastify API.
*   **Database**: PostgreSQL 16 via Prisma ORM.
*   **Infrastructure**: Real-time HMR and Type-safe API communication.

---

## 8. Development Roadmap

For the next phase of evolution (v2.0), including RSS Aggregation and Native Email Newsletters, refer to:
📄 [PRD (V.2).md](./PRD%20(V.2).md)

---
*Maintained by Antigravity AI — Comprehensive Restoration v1.6*
