import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, Select, TextInput, dateTime, rupiah } from '../../Components/UI';

export default function ServicesIndex({ services, orders }) {
    const { data, setData, post, processing, reset } = useForm({
        code: '',
        name: '',
        unit: 'halaman',
        price: 0,
        estimated_minutes: 0,
    });

    function submit(e) {
        e.preventDefault();
        post('/services', { onSuccess: () => reset() });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Jasa Pengetikan" />
            <PageHeader title="Jasa Pengetikan & Layanan" description="Kelola tarif layanan dan status pekerjaan jasa." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Layanan</h2>
                    <form onSubmit={submit} className="space-y-2">
                        <TextInput placeholder="Kode jasa" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        <TextInput placeholder="Nama layanan" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <TextInput placeholder="Satuan" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            <TextInput type="number" placeholder="Tarif" value={data.price} onChange={(e) => setData('price', Number(e.target.value))} />
                            <TextInput type="number" placeholder="Estimasi menit" value={data.estimated_minutes} onChange={(e) => setData('estimated_minutes', Number(e.target.value))} />
                        </div>
                        <Button disabled={processing} className="w-full">Simpan Layanan</Button>
                    </form>
                </Card>
                <div className="space-y-3">
                    <Card>
                        <h2 className="mb-2 text-sm font-semibold">Daftar Layanan</h2>
                        <DenseTable rows={services} columns={[
                            { key: 'code', label: 'Kode' },
                            { key: 'name', label: 'Layanan' },
                            { key: 'unit', label: 'Satuan' },
                            { key: 'price', label: 'Tarif', render: (row) => rupiah(row.price) },
                            { key: 'estimated_minutes', label: 'Estimasi' },
                        ]} />
                    </Card>
                    <Card>
                        <h2 className="mb-2 text-sm font-semibold">Order Jasa</h2>
                        <DenseTable rows={orders} columns={[
                            { key: 'order_number', label: 'Order' },
                            { key: 'title', label: 'Pekerjaan' },
                            { key: 'customer_name', label: 'Pelanggan', render: (row) => row.customer_name || 'Umum' },
                            { key: 'status', label: 'Status', render: (row) => (
                                <Select value={row.status} onChange={(e) => router.put(`/service-orders/${row.id}`, { status: e.target.value }, { preserveScroll: true })}>
                                    <option value="pending">pending</option>
                                    <option value="process">process</option>
                                    <option value="done">done</option>
                                    <option value="cancelled">cancelled</option>
                                </Select>
                            ) },
                            { key: 'due_at', label: 'Estimasi', render: (row) => dateTime(row.due_at) },
                        ]} />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
