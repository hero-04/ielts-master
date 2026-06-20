"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BookOpen,
  LayoutDashboard,
  Book,
  Headphones,
  PenTool,
  Mic,
  Settings,
  LogOut,
  History,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Reading", href: "/reading", icon: Book },
  { name: "Listening", href: "/listening", icon: Headphones },
  { name: "Vocabulary", href: "/vocabulary", icon: BookOpen },
  { name: "Writing", href: "/writing", icon: PenTool },
  { name: "Speaking", href: "/speaking", icon: Mic },
  { name: "My Tests", href: "/my-tests", icon: History },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated && mounted) {
      router.push("/login");
    }
  }, [isAuthenticated, router, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Dark Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-gray-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-white">
            <BookOpen className="w-6 h-6 text-primary-light" />
            <span className="text-xl font-bold">IELTS Master</span>
          </Link>
        </div>

        <div className="p-4 flex-1">
          <div className="mb-4 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Menu
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-primary text-white" 
                      : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
              {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.full_name || "User"}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || "user@example.com"}</p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area - White */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0">
          <h1 className="text-xl font-semibold text-gray-800 capitalize">
            {pathname.split("/")[1] || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {user?.user_type === "premium" ? "Premium Plan" : "Free Plan"}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-gray-50 p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
