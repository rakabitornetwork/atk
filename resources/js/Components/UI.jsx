import { Link, usePage } from '@inertiajs/react';

export function rupiah(value) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(value || 0));
}

export function dateTime(value) {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
}

export function Card({ children, className = '' }) {
    return (
        <section className={`rounded-xl border border-[var(--atk-border)] bg-[var(--atk-surface)] p-3 shadow-xl shadow-black/5 backdrop-blur ${className}`}>
            {children}
        </section>
    );
}

export function PageHeader({ title, description, action }) {
    return (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
                <h1 className="text-base font-semibold tracking-tight text-[var(--atk-text)]">{title}</h1>
                {description ? <p className="mt-0.5 text-[11px] text-[var(--atk-muted)]">{description}</p> : null}
            </div>
            {action}
        </div>
    );
}

export function StatCard({ label, value, hint }) {
    return (
        <Card className="min-h-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--atk-muted)]">{label}</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-[var(--atk-text)]">{value}</p>
            {hint ? <p className="mt-1 text-[11px] text-[var(--atk-muted)]">{hint}</p> : null}
        </Card>
    );
}

export function DenseTable({ columns, rows, keyField = 'id', empty = 'Belum ada data.' }) {
    return (
        <div className="atk-scrollbar max-w-full overflow-x-auto rounded-lg border border-[var(--atk-border)]">
            <table className="w-full min-w-[42rem] border-collapse text-left text-[11px]">
                <thead>
                    <tr className="border-b border-[var(--atk-border)] bg-black/[0.03] dark:bg-white/[0.04]">
                        {columns.map((column) => (
                            <th key={column.key} className={`whitespace-nowrap px-2 py-1.5 font-semibold uppercase tracking-wider text-[var(--atk-muted)] ${column.className || ''}`}>
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="px-2 py-5 text-center text-[var(--atk-muted)]">{empty}</td>
                        </tr>
                    ) : rows.map((row, index) => (
                        <tr key={row[keyField] ?? index} className="border-b border-[var(--atk-border)] last:border-0 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]">
                            {columns.map((column) => (
                                <td key={column.key} className={`whitespace-nowrap px-2 py-1.5 tabular-nums ${column.tdClassName || ''}`}>
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Flash() {
    const { flash } = usePage().props;
    if (!flash?.success && !flash?.error) return null;
    return (
        <div className={`mb-3 rounded-lg border px-3 py-2 text-xs ${flash.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-400/30 bg-rose-500/10 text-rose-300'}`}>
            {flash.success || flash.error}
        </div>
    );
}

export function Button({ children, className = '', ...props }) {
    return (
        <button
            {...props}
            className={`inline-flex items-center justify-center rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            {children}
        </button>
    );
}

export function TextInput({ className = '', ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-lg border border-[var(--atk-border)] bg-white/70 px-2 py-1.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 dark:bg-slate-950/70 dark:text-slate-100 ${className}`}
        />
    );
}

export function Select({ className = '', children, ...props }) {
    return (
        <select
            {...props}
            className={`w-full rounded-lg border border-[var(--atk-border)] bg-white/70 px-2 py-1.5 text-xs text-slate-900 outline-none transition focus:border-violet-400 dark:bg-slate-950/70 dark:text-slate-100 ${className}`}
        >
            {children}
        </select>
    );
}

export function NavLink({ href, active, children }) {
    return (
        <Link
            href={href}
            className={`flex items-center rounded-lg px-2 py-1.5 text-[11px] font-medium transition ${active ? 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/20' : 'text-slate-600 hover:bg-black/5 dark:text-slate-300 dark:hover:bg-white/5'}`}
        >
            {children}
        </Link>
    );
}
