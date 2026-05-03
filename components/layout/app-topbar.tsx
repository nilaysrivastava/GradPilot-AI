"use client";

import { usePathname } from "next/navigation";

import { GlobalTopbar } from "@/components/layout/global-topbar";
import { sidebarRoutes } from "@/lib/routes";

type AppTopbarProps = {
  onOpenSidebar: () => void;
};

export function AppTopbar({ onOpenSidebar }: AppTopbarProps) {
  const pathname = usePathname();

  const currentRoute = sidebarRoutes.find(
    (route) => pathname === route.href || pathname.startsWith(`${route.href}/`)
  );

  return (
    <GlobalTopbar
      pageTitle={currentRoute?.title ?? "GradPilot AI"}
      showMenuButton={false}
      onOpenSidebar={onOpenSidebar}
    />
  );
}