# Admin Brand Guidelines — Unfilter Story
# Technical Precision & Functional Density

**Version:** 1.3 (Legibility & Ergonomic Update)  
**Target:** CMS Admin Panel  
**Design Philosophy:** High-density, multi-layered research environment with zero typographic friction.

---

## 1. Color System (Admin)
The Admin panel uses a deep neutral palette to reduce eye strain during long editorial sessions.

| Token | Hex Code | Usage |
| :--- | :--- | :--- |
| **Primary Accent** | `#005D3B` | Primary actions, headings, and branding (Dark Green) |
| **Highlight** | `#C9F775` | Active states, badges, and hover highlights (Lime Green) |
| **Clean Background** | `#FAFAFA` | Main workspace and dashboard backgrounds |
| **Surface White** | `#FFFFFF` | Content cards and form containers |
| **Border Neutral** | `#F3F4F6` | Subtle 1px dividers and container outlines |

---

## 2. Typography & Hierarchy
*   **Core Font**: `Nunito` (Sans-serif) for all interface logic and body.
*   **Non-Italic Mandate**: Strictly avoid `italic` styling across all UI elements, including logos, buttons, and badges, to maintain a clean, vertical, and modern aesthetic.
*   **Casing Protocol**: Revert all interface elements to **Natural Casing** (Sentence Case or Title Case). Entirely capitalized headings or labels are strictly prohibited unless used in high-impact signal tags.
*   **Primary Headings**: **56px Extra Bold** (font-weight 800), Natural Casing.
*   **Sub-headings**: **24px - 32px Extra Bold**, tracking-tight, Natural Casing.
*   **Standard Labels / Inputs**: **14px - 16px Bold**, Natural Casing.
*   **Secondary Metadata (Dense Display)**: **10px - 11px Black/Bold**, Natural Casing (e.g., date badges, small badges, helper snippets).
*   **Accessibility & Density Rule**: Minimum text size is **12px** for standard interactions, with a specialized floor of **10px** for high-density intelligence metadata (e.g., Signal units, date/time stamps).
*   **Technical Text**: `Monospace` (e.g., `font-mono`) for slugs, emails, and architecture paths (Min 10px).

---

## 3. UI Components & Grid
### 3.1 Containers
*   **Cards**: Large border-radius (`rounded-3xl` or `2rem`) with minimal shadow.
*   **Forms**: High-contrast inputs with soft gray backgrounds (`bg-gray-50`) that turn white on focus.

### 3.2 Management Tools
*   **Drag-and-Drop**: Tactile grip handles (`GripVertical`) with a scale-up effect on active grab.
*   **Tree Structures**: Clear 1px horizontal connectors for nested sub-menus.
*   **Empty States**: Illustrated with large technical icons and centered calls-to-action in standard casing.

---

## 4. Iconography
*   **Library**: Lucide React.
*   **Stroke Width**: 2.0.
*   **Sizing**: Consistent 18px-20px for sidebar items; 14px-16px for inline actions.

---
*Maintained by Antigravity AI — Admin Specific Design v1.2*
