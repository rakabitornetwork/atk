import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Card, DenseTable, PageHeader, dateTime, rupiah } from '../../Components/UI';

export default function SalesIndex({ sales }) {
    return (
        <AuthenticatedLayout>
            <Head title="Transaksi" />
            <PageHeader title="Riwayat Transaksi" description="Lihat, cetak ulang, dan pantau transaksi tempo." />
            <Card>
                <DenseTable
                    rows={sales.data}
                    columns={[
                        { key: 'invoice_number', label: 'Invoice', render: (row) => <Link className="font-semibold text-violet-300" href={`/sales/${row.id}`}>{row.invoice_number}</Link> },
                        { key: 'customer_name', label: 'Pelanggan', render: (row) => row.customer_name || 'Umum' },
                        { key: 'cashier_name', label: 'Kasir' },
                        { key: 'status', label: 'Status' },
                        { key: 'total', label: 'Total', render: (row) => rupiah(row.total) },
                        { key: 'due_amount', label: 'Piutang', render: (row) => rupiah(row.due_amount) },
                        { key: 'sold_at', label: 'Waktu', render: (row) => dateTime(row.sold_at) },
                    ]}
                />
            </Card>
        </AuthenticatedLayout>
    );
}
