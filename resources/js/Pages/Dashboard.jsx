import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Card, DenseTable, PageHeader, StatCard, dateTime, rupiah } from '../Components/UI';

export default function Dashboard({ stats, recentSales, lowStockProducts, pendingServices }) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />
            <PageHeader title="Dashboard Operasional" description="Ringkasan penjualan ATK, jasa pengetikan, stok, kas, dan pekerjaan aktif." action={<Link href="/pos" className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white">Buka POS</Link>} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <StatCard label="Omzet Hari Ini" value={rupiah(stats.sales_total)} hint={`${stats.sales_count} transaksi`} />
                <StatCard label="ATK" value={rupiah(stats.product_total)} hint="Penjualan barang" />
                <StatCard label="Jasa" value={rupiah(stats.service_total)} hint="Pengetikan/cetak" />
                <StatCard label="Piutang" value={rupiah(stats.receivables)} hint="Belum lunas" />
                <StatCard label="Stok Menipis" value={stats.low_stock} hint={`${stats.pending_services} jasa pending`} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Transaksi Terakhir</h2>
                    <DenseTable
                        rows={recentSales}
                        columns={[
                            { key: 'invoice_number', label: 'Invoice' },
                            { key: 'customer_name', label: 'Pelanggan', render: (row) => row.customer_name || 'Umum' },
                            { key: 'cashier_name', label: 'Kasir' },
                            { key: 'total', label: 'Total', render: (row) => rupiah(row.total), tdClassName: 'font-semibold' },
                            { key: 'sold_at', label: 'Waktu', render: (row) => dateTime(row.sold_at) },
                        ]}
                    />
                </Card>
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Stok Menipis</h2>
                    <DenseTable
                        rows={lowStockProducts}
                        columns={[
                            { key: 'sku', label: 'SKU' },
                            { key: 'name', label: 'Produk' },
                            { key: 'stock', label: 'Stok' },
                            { key: 'minimum_stock', label: 'Min' },
                            { key: 'rack_location', label: 'Rak' },
                        ]}
                    />
                </Card>
                <Card className="xl:col-span-2">
                    <h2 className="mb-2 text-sm font-semibold">Pekerjaan Jasa Aktif</h2>
                    <DenseTable
                        rows={pendingServices}
                        columns={[
                            { key: 'order_number', label: 'Order' },
                            { key: 'title', label: 'Pekerjaan' },
                            { key: 'customer_name', label: 'Pelanggan', render: (row) => row.customer_name || 'Umum' },
                            { key: 'status', label: 'Status' },
                            { key: 'due_at', label: 'Estimasi', render: (row) => dateTime(row.due_at) },
                        ]}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
