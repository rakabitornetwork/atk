import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, StatCard, TextInput, rupiah } from '../../Components/UI';

export default function ReportsIndex({ filters, summary, topProducts, dailySales }) {
    const [from, setFrom] = useState(filters.from);
    const [to, setTo] = useState(filters.to);

    function apply(e) {
        e.preventDefault();
        router.get('/reports', { from, to }, { preserveState: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Laporan" />
            <PageHeader title="Laporan Penjualan & Keuangan" description="Penjualan, laba kotor, hutang/piutang, produk dan jasa terlaris." />
            <form onSubmit={apply} className="mb-3 flex flex-wrap gap-2">
                <TextInput className="w-40" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                <TextInput className="w-40" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                <Button>Terapkan</Button>
            </form>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                <StatCard label="Penjualan" value={rupiah(summary.sales_total)} hint={`${summary.sales_count} transaksi`} />
                <StatCard label="Pembelian" value={rupiah(summary.purchase_total)} />
                <StatCard label="Laba Kotor" value={rupiah(summary.gross_profit)} />
                <StatCard label="Piutang" value={rupiah(summary.receivables)} />
                <StatCard label="Hutang" value={rupiah(summary.debts)} />
            </div>
            <div className="mt-3 grid gap-3 xl:grid-cols-2">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Produk/Jasa Terlaris</h2>
                    <DenseTable rows={topProducts} columns={[
                        { key: 'name', label: 'Item' },
                        { key: 'item_type', label: 'Tipe' },
                        { key: 'quantity', label: 'Qty' },
                        { key: 'total', label: 'Total', render: (row) => rupiah(row.total) },
                    ]} />
                </Card>
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Penjualan Harian</h2>
                    <DenseTable rows={dailySales} keyField="date" columns={[
                        { key: 'date', label: 'Tanggal' },
                        { key: 'count', label: 'Transaksi' },
                        { key: 'total', label: 'Total', render: (row) => rupiah(row.total) },
                    ]} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
