"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarCheck, BookOpen, Target, Zap,
  Heart, MessageCircle, Users, BarChart3, Settings, Shield,
  Menu, X, LogOut, AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils/cn";
import { APP_NAME } from "@/lib/constants";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { logOut } from "@/lib/supabase/auth";
import { useRouter } from "next/navigation";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/check-in", label: "Check-In", icon: CalendarCheck },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/triggers", label: "Triggers", icon: Zap },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/motivation", label: "Motivation", icon: Heart },
  { href: "/emergency", label: "Emergency", icon: AlertTriangle },
  { href: "/coach", label: "AI Coach", icon: MessageCircle },
  { href: "/community", label: "Community", icon: Users },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logOut();
    router.push("/");
  };

  const items = profile?.role === "admin"
    ? [...navItems, { href: "/admin", label: "Admin", icon: Shield }]
    : navItems;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg dark:border-gray-700/60 dark:bg-gray-900/80 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/dashboard" className="text-lg font-bold text-teal-600">{APP_NAME}</Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-gray-200 px-4 py-2 dark:border-gray-700">
            {items.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                    : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </nav>
        )}
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-gray-200/60 bg-white dark:border-gray-700/60 dark:bg-gray-900 lg:flex">
        <div className="flex items-center justify-between border-b border-gray-200/60 px-6 py-5 dark:border-gray-700/60">
          <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-teal-600 to-violet-600 bg-clip-text text-transparent">
            {APP_NAME}
          </Link>
          <ThemeToggle />
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                pathname === href
                  ? "bg-gradient-to-r from-teal-50 to-violet-50 text-teal-700 shadow-sm dark:from-teal-950 dark:to-violet-950 dark:text-teal-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-gray-200/60 p-4 dark:border-gray-700/60">
          <div className="mb-3 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {profile?.name}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
