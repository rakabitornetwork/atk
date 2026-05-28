import { Link, router, usePage } from '@inertiajs/react';
import { BarChart3, Boxes, ClipboardList, FileClock, GitBranch, Home, LogOut, Package, ReceiptText, Settings, ShoppingCart, Truck, Users } from 'lucide-react';
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
    ['Update GitHub', '/settings/deployment', GitBranch, 'admin'],
    ['Pengaturan', '/settings', Settings, 'admin'],
];

export default function AuthenticatedLayout({ children }) {
    const { auth, app } = usePage().props;
    const current = window.location.pathname;

    function logout() {
        router.post('/logout');
    }

    return (
        <div className="min-h-screen text-[var(--atk-text)]">
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-52 border-r border-[var(--atk-border)] bg-[var(--atk-surface)] p-2 backdrop-blur-xl lg:block">
                <Link href="/dashboard" className="mb-2 flex h-10 items-center rounded-xl bg-violet-500/15 px-2 ring-1 ring-violet-400/20">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">ATK</div>
                    <div className="ml-2 min-w-0">
                        <p className="truncate text-xs font-bold">{app.store_name}</p>
                        <p className="text-[10px] text-[var(--atk-muted)]">Premium POS</p>
                    </div>
                </Link>
                <nav className="atk-scrollbar h-[calc(100vh-4rem)] space-y-1 overflow-y-auto">
                    {nav.filter((item) => item[3] !== 'admin' || auth.is_admin).map(([label, href, Icon]) => (
                        <NavLink key={href} href={href} active={current === href || current.startsWith(`${href}/`)}>
                            <Icon className="mr-2 h-3.5 w-3.5" />
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            <div className="lg:pl-52">
                <header className="sticky top-0 z-20 border-b border-[var(--atk-border)] bg-[var(--atk-surface)]/90 px-3 py-2 backdrop-blur-xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold">{auth.user?.name}</p>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--atk-muted)]">{auth.user?.role}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--atk-border)] px-2 py-1.5 text-[11px] font-semibold text-[var(--atk-text)]">
                                <LogOut className="h-3.5 w-3.5" />
                                Logout
                            </button>
                        </div>
                    </div>
                    <nav className="atk-scrollbar mt-2 flex gap-1 overflow-x-auto pb-1 lg:hidden">
                        {nav.filter((item) => item[3] !== 'admin' || auth.is_admin).map(([label, href, Icon]) => (
                            <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[10px] ${current === href ? 'bg-violet-600 text-white' : 'bg-[var(--atk-surface)] text-[var(--atk-text)]'}`}>
                                <Icon className="h-3 w-3" />
                                {label}
                            </Link>
                        ))}
                    </nav>
                </header>
                <main className="p-3">
                    <Flash />
                    {children}
                </main>
            </div>
        </div>
    );
}
