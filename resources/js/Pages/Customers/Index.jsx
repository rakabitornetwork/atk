import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, TextInput, rupiah } from '../../Components/UI';

export default function CustomersIndex({ customers }) {
    const { data, setData, post, processing, reset } = useForm({ name: '', phone: '', address: '', notes: '' });

    return (
        <AuthenticatedLayout>
            <Head title="Pelanggan" />
            <PageHeader title="Pelanggan & Piutang" description="Data pelanggan, kontak, riwayat nominal transaksi, dan piutang aktif." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Pelanggan</h2>
                    <form onSubmit={(e) => { e.preventDefault(); post('/customers', { onSuccess: () => reset() }); }} className="space-y-2">
                        <TextInput placeholder="Nama pelanggan" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <TextInput placeholder="Nomor HP" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        <TextInput placeholder="Alamat" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        <TextInput placeholder="Catatan" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        <Button disabled={processing} className="w-full">Simpan Pelanggan</Button>
                    </form>
                </Card>
                <Card>
                    <DenseTable rows={customers} columns={[
                        { key: 'name', label: 'Nama' },
                        { key: 'phone', label: 'HP' },
                        { key: 'address', label: 'Alamat' },
                        { key: 'sales_total', label: 'Total Belanja', render: (row) => rupiah(row.sales_total) },
                        { key: 'due_total', label: 'Piutang', render: (row) => rupiah(row.due_total), tdClassName: 'font-semibold text-amber-300' },
                        { key: 'notes', label: 'Catatan' },
                    ]} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
