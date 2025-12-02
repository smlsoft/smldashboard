'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    PieChart,
    Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
    { name: 'ภาพรวม', icon: LayoutDashboard, href: '/' },
    { name: 'บัญชี', icon: Calculator, href: '/accounting' },
    { name: 'การขาย', icon: ShoppingCart, href: '/sales' },
    { name: 'สินค้าคงคลัง', icon: Package, href: '/inventory' },
    { name: 'ลูกค้า', icon: Users, href: '/customers' },
];

const secondaryItems = [
    { name: 'ตั้งค่า', icon: Settings, href: '/settings' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[hsl(var(--card))] border-r border-[hsl(var(--border))] flex flex-col transition-all duration-300">
            {/* Logo Section */}
            <div className="h-16 flex items-center px-8 border-b border-[hsl(var(--border))]">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[hsl(var(--primary))] to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <PieChart className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold tracking-tight text-[hsl(var(--foreground))]">
                        MIS Dashboard
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6">
                <div>
                    <p className="px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                        Menu
                    </p>
                    <nav className="space-y-1">
                        {menuItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                                        isActive
                                            ? "bg-[hsl(var(--primary))] text-white shadow-lg shadow-indigo-500/25"
                                            : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-5 w-5 transition-colors",
                                        isActive ? "text-white" : "text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))]"
                                    )} />
                                    {item.name}
                                    {isActive && (
                                        <ChevronRight className="ml-auto h-4 w-4 text-white/50" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div>
                    <p className="px-4 text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-3">
                        Other
                    </p>
                    <nav className="space-y-1">
                        {secondaryItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))] transition-all duration-200 group"
                            >
                                <item.icon className="h-5 w-5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] transition-colors" />
                                {item.name}
                            </Link>
                        ))}
                        <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200 group">
                            <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                            ออกจากระบบ
                        </button>
                    </nav>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 m-4 mt-2 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-inner ring-2 ring-white/10">
                        <span className="text-xs font-bold text-white">AD</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">Admin User</p>
                        <p className="text-xs text-slate-400 truncate">admin@company.com</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
