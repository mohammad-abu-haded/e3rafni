"use client";
import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MenuIcon from "@/public/menu.svg";

const Navigation = () => {
  const navigationRef = useRef<HTMLDivElement>(null);
  const path = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigationItems = [
    { name: "غرف الألعاب", href: "/rooms" },
    { name: "إنشاء غرفة", href: "/rooms/create" },
    { name: "سجل المباريات", href: "/matches/history" },
  ];

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        navigationRef.current &&
        !navigationRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div ref={navigationRef} className={styles["navigation-container"]}>
      <button
        className={styles["menu-button"]}
        type="button"
        aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
        aria-expanded={isMenuOpen}
        aria-controls="header-navigation"
        onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsMenuOpen(false);
          }
        }}
      >
        <MenuIcon className={styles["menu-icon"]} />
      </button>
      <div
        id="header-navigation"
        className={`${styles["navigation-panel"]} ${isMenuOpen ? styles["navigation-panel-open"] : ""}`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsMenuOpen(false);
          }
        }}
      >
        <nav className={styles["nav"]}>
          {navigationItems.map((item) => (
            <Link
              className={`${styles["nav-item"]} ${item.href === path ? styles["is-selected"] : ""}`}
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Navigation;
