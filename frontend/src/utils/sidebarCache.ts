let cachedSidebarCollapsed: boolean | null = null;

export function getInitialSidebarCollapsed(): boolean {
  if (cachedSidebarCollapsed !== null) {
    return cachedSidebarCollapsed;
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("sector_madness_sidebar_collapsed");
    if (saved !== null) {
      cachedSidebarCollapsed = saved === "true";
      return cachedSidebarCollapsed;
    }
  }
  return false;
}

export function setSidebarCollapsedCache(collapsed: boolean) {
  cachedSidebarCollapsed = collapsed;
  if (typeof window !== "undefined") {
    localStorage.setItem("sector_madness_sidebar_collapsed", String(collapsed));
  }
}
