"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/provider/store";
import { logout } from "@/features/auth/authSlice";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Bot,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const navItems = [
    { name: "Dashboard", href: "/pages/dashboard", icon: LayoutDashboard },
    { name: "Chat", href: "/pages/chat", icon: MessageSquare },
    { name: "Documents", href: "/pages/documents", icon: FileText },
    { name: "Settings", href: "/pages/settings", icon: Settings },
  ];

  if (user?.role === "admin") {
    navItems.push({ name: "Admin", href: "/pages/admin", icon: ShieldAlert });
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar/50 backdrop-blur-md flex flex-col h-screen">
      <div className="p-6">
        <Link href="/pages/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Bot size={20} />
          </div>
          <span className="font-semibold text-lg tracking-tight gradient-heading">
            AI Assistant
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-primary" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-border">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex flex-col truncate pr-2">
            <span className="text-sm font-medium truncate">
              {user?.email || "user@example.com"}
            </span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">
              {user?.role || "USER"}
            </span>
          </div>
          <button
            onClick={() => dispatch(logout())}
            className="text-muted-foreground hover:text-destructive transition-colors p-2 rounded-md hover:bg-destructive/10"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
