import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, Boxes, ClipboardList, FileClock, GitBranch, Home, LogOut, Menu, Package, ReceiptText, Settings, ShoppingCart, Truck, Users, X } from 'lucide-react';
import { useState } from 'react';
import ThemeToggle from '../Components/ThemeToggle';
import { Flash, NavLink } from '../Components/UI';

const nav = [
    ['Dashboard', '/dashboard', Home],
    ['POS Kasir', '/pos', ShoppingCart],
    ['Transaksi', '/sales', ReceiptText],
    ['Produk ATK', '/products', Package, 'admin'],
    ['Jasa Pengetikan', '/services', ClipboardList, 'admin'],
    ['Inventory', '/inventory', Boxes, 'admin'],
    ['Pembelian', '/purchases', Truck, 'admin'],
    ['Pelanggan', '/customers', Users, 'admin'],
    ['Akun Pengguna', '/users', Users, 'admin'],
    ['Laporan', '/reports', BarChart3, 'admin'],
    ['Audit', '/audit', FileClock, 'admin'],
    ['Update Aplikasi', '/settings/deployment', GitBranch, 'admin'],
    ['Pengaturan', '/settings', Settings, 'admin'],
];

export default function AuthenticatedLayout({ children }) {
    const { auth, app } = usePage().props;
    const current = window.location.pathname;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const visibleNavItems = nav.filter((item) => item[3] !== 'admin' || auth.is_admin);

    function logout() {
        router.post('/logout');
    }

    function isActiveNav(href) {
        if (href === '/settings') {
            return current === href;
        }

        return current === href || current.startsWith(`${href}/`);
    }

    function Avatar({ className = 'h-10 w-10' }) {
        return (
            <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-sm font-bold text-white ${className}`}>
                {auth.user?.profile_photo_url ? (
                    <img src={auth.user.profile_photo_url} alt={auth.user.name} className="h-full w-full object-cover" />
                ) : (
                    auth.user?.name?.charAt(0) ?? 'A'
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen min-w-0 max-w-full overflow-x-hidden text-[var(--atk-text)]">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 border-r border-[var(--atk-border)] bg-[var(--atk-surface)] p-2 backdrop-blur-xl lg:block">
                <Link href="/dashboard" className="mb-2 flex h-10 items-center rounded-xl bg-violet-500/15 px-2 ring-1 ring-violet-400/20">
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-violet-600 text-xs font-bold text-white">
                        {app.logo_icon_url ? <img src={app.logo_icon_url} alt="Logo icon" className="h-full w-full object-cover" /> : 'ATK'}
                    </div>
                    <div className="ml-2 min-w-0">
                        {app.navbar_logo_url ? <img src={app.navbar_logo_url} alt={app.store_name} className="h-5 max-w-full object-contain" /> : <p className="truncate text-xs font-bold">{app.store_name}</p>}
                        <p className="text-[10px] text-[var(--atk-muted)]">Premium POS</p>
                    </div>
                </Link>
                <div className="mb-2 rounded-xl border border-[var(--atk-border)] bg-black/[0.03] p-2 dark:bg-white/[0.03]">
                    <div className="flex items-center gap-2">
                        <Avatar />
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold">{auth.user?.name}</p>
                            <p className="truncate text-[10px] text-[var(--atk-muted)]">{auth.user?.email}</p>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[var(--atk-muted)]">
                        <span>Status akun</span>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">{auth.user?.role}</span>
                    </div>
                </div>
                <nav className="atk-scrollbar h-[calc(100vh-9.5rem)] space-y-1 overflow-y-auto">
                    {visibleNavItems.map(([label, href, Icon]) => (
                        <NavLink key={href} href={href} active={isActiveNav(href)}>
                            <Icon className="mr-2 h-3.5 w-3.5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="min-w-0 max-w-full lg:pl-52">
                <header className="sticky top-0 z-20 border-b border-[var(--atk-border)] bg-[var(--atk-surface)]/90 px-3 py-2 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(true)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--atk-border)] text-[var(--atk-text)] lg:hidden"
                                aria-label="Buka menu"
                            >
                                <Menu className="h-5 w-5" />
                            </button>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{auth.user?.name}</p>
                                <p className="truncate text-[11px] uppercase tracking-widest text-[var(--atk-muted)]">{auth.user?.role}</p>
                            </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            <ThemeToggle />
                            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--atk-border)] px-2 py-2 text-xs font-semibold text-[var(--atk-text)]">
                                <LogOut className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>
                <div
                    className={`fixed inset-0 z-40 lg:hidden ${
                        mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'
                    }`}
                    aria-hidden={!mobileMenuOpen}
                >
                        <button
                            type="button"
                            className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
                                mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                            onClick={() => setMobileMenuOpen(false)}
                            aria-label="Tutup menu"
                            tabIndex={mobileMenuOpen ? 0 : -1}
                        />
                        <aside
                            className={`relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-[var(--atk-border)] bg-[var(--atk-surface-strong)] p-3 shadow-2xl shadow-black/40 transition-transform duration-300 ease-out will-change-transform ${
                                mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        >
                            <div className="mb-3 flex items-center justify-between gap-2">
                                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex min-w-0 items-center rounded-xl bg-violet-500/15 px-2 py-2 ring-1 ring-violet-400/20">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-violet-600 text-xs font-bold text-white">
                                        {app.logo_icon_url ? <img src={app.logo_icon_url} alt="Logo icon" className="h-full w-full object-cover" /> : 'ATK'}
                                    </div>
                                    <div className="ml-2 min-w-0">
                                        {app.navbar_logo_url ? <img src={app.navbar_logo_url} alt={app.store_name} className="h-6 max-w-full object-contain" /> : <p className="truncate text-sm font-bold">{app.store_name}</p>}
                                        <p className="text-[11px] text-[var(--atk-muted)]">Premium POS</p>
                                    </div>
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--atk-border)]"
                                    aria-label="Tutup menu"
                                    tabIndex={mobileMenuOpen ? 0 : -1}
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <div className="mb-3 rounded-xl border border-[var(--atk-border)] bg-black/[0.03] p-2 dark:bg-white/[0.03]">
                                <div className="flex items-center gap-2">
                                    <Avatar />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">{auth.user?.name}</p>
                                        <p className="truncate text-xs text-[var(--atk-muted)]">{auth.user?.email}</p>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-wider text-[var(--atk-muted)]">
                                    <span>Status akun</span>
                                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300">{auth.user?.role}</span>
                                </div>
                            </div>
                            <nav className="atk-scrollbar min-h-0 flex-1 space-y-1 overflow-y-auto">
                                {visibleNavItems.map(([label, href, Icon]) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        tabIndex={mobileMenuOpen ? 0 : -1}
                                        className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActiveNav(href) ? 'bg-violet-600 text-white' : 'text-[var(--atk-text)] hover:bg-black/5 dark:hover:bg-white/5'}`}
                                    >
                                        <Icon className="mr-2 h-4 w-4" />
                                        {label}
                                    </Link>
                                ))}
                            </nav>
                        </aside>
                </div>
                <main className="min-w-0 max-w-full overflow-x-hidden p-3">
                    <Flash />
                    {children}
                    <footer className="mt-6 border-t border-[var(--atk-border)] pt-3 text-center text-xs font-medium text-[var(--atk-muted)]">
                        Made by Amon - Indramayu 2026
                    </footer>
                </main>
            </div>
        </div>
    );
}
