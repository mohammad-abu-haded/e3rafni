'use client';
import Link from "next/link";
import styles from "./Header.module.css";
import { usePathname } from "next/navigation";

const Navigation = () => {
  const path = usePathname();
  const navigationItems = [
    { name: "الرئيسية", href: "/" },
    { name: "غرف الألعاب", href: "/rooms" },
    { name: "إنشاء غرفة", href: "/rooms/create" },
    { name: "سجل المباريات", href: "/matches/history" },
  ];
  return (
    <nav className={styles["nav"]}>
      {navigationItems.map((item) => (
        <Link
          className={`${styles["nav-item"]} ${item.href === path ? `${styles["is-selected"]}` : ""}`}
          key={item.href}
          href={item.href}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
