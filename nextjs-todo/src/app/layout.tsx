/**
 * Root Layout Component
 * =====================
 *
 * This is the root layout that wraps all pages in the application.
 *
 * Next.js App Router - Layout System
 * -----------------------------------
 * Layouts in Next.js App Router:
 *   - Wrap all pages in the same directory and subdirectories
 *   - Persist across navigations (no re-rendering)
 *   - Can be nested (page gets all parent layouts)
 *   - The root layout must define <html> and <body> tags
 *
 * Layout Hierarchy
 * ----------------
 * app/
 *   layout.tsx      ← Root layout (this file)
 *   page.tsx        ← Home page
 *   about/
 *     layout.tsx    ← About layout (optional, nested)
 *     page.tsx      ← About page
 *
 * When visiting /about, the page is wrapped by:
 *   app/layout.tsx → app/about/layout.tsx → app/about/page.tsx
 *
 * Server Component (Default)
 * --------------------------
 * This layout is a React Server Component by default, meaning:
 *   - Rendered on the server
 *   - Can use async/await for data fetching
 *   - Cannot use hooks (useState, useEffect, etc.)
 *   - Cannot use browser APIs
 *
 * Metadata
 * --------
 * Next.js supports static and dynamic metadata exports:
 *
 *   export const metadata: Metadata = { ... }  // Static
 *   export async function generateMetadata() { ... }  // Dynamic
 *
 * Metadata is used for:
 *   - <title> tag
 *   - <meta> tags (description, keywords, etc.)
 *   - Open Graph / Twitter cards
 *   - Favicons and app icons
 */

import type { Metadata } from "next";
import "./globals.css";

/**
 * Page metadata for SEO and browser display.
 *
 * This is a static metadata export. For dynamic metadata
 * (e.g., based on URL params), use generateMetadata() function.
 */
export const metadata: Metadata = {
  title: "Tasks | Next.js Todo App",
  description:
    "A minimalist todo application built with Next.js, React Server Components, and Server Actions.",
};

/**
 * Root Layout Component
 *
 * Wraps all pages with common HTML structure and global styles.
 *
 * @param children - The page content (rendered inside <body>)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}
