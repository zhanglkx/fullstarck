"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import styles from "./site-header.module.scss";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/api-test", label: "API 测试" },
  { href: "/serverstate", label: "服务器状态" },
  { href: "/npmdata", label: "NPM 统计" },
  { href: "/qrcode", label: "二维码" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const toggleMobileNav = () => setMobileNavOpen((open) => !open);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" onClick={() => setMobileNavOpen(false)}>
          Fullstack Lab
        </Link>
        <nav className={styles.navDesktop} aria-label="主导航">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={styles.navLink}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={isMobileNavOpen}
          aria-controls="mobile-nav"
          onClick={toggleMobileNav}
        >
          <span className="sr-only">打开菜单</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      {isMobileNavOpen ? (
        <nav id="mobile-nav" className={styles.mobilePanel} aria-label="移动端主导航">
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={styles.mobileLink}
              onClick={() => setMobileNavOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
