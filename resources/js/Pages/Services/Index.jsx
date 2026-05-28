import { Head, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, FieldLabel, PageHeader, Select, TextInput, dateTime, rupiah } from '../../Components/UI';

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
            <div className="grid w-full min-w-0 max-w-full gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Layanan</h2>
                    <form onSubmit={submit} className="space-y-2">
                        <FieldLabel label="Kode jasa" help="Kode unik untuk layanan, misalnya JTK-001. Dipakai untuk identifikasi jasa di POS dan laporan.">
                            <TextInput placeholder="Kode jasa" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Nama layanan" help="Nama jasa yang akan tampil di POS dan nota, misalnya Jasa Pengetikan Dokumen atau Cetak Hitam Putih.">
                            <TextInput placeholder="Nama layanan" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </FieldLabel>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <FieldLabel label="Satuan" help="Satuan hitung jasa, misalnya halaman, lembar, paket, file, atau menit.">
                                <TextInput placeholder="Satuan" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            </FieldLabel>
                            <FieldLabel label="Tarif" help="Harga jasa per satuan. Contoh: Rp3.000 per halaman atau Rp1.000 per lembar.">
                                <TextInput type="number" placeholder="Tarif" value={data.price} onChange={(e) => setData('price', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Estimasi menit" help="Perkiraan waktu pengerjaan untuk satu order jasa. Membantu admin memantau deadline pekerjaan.">
                                <TextInput type="number" placeholder="Estimasi menit" value={data.estimated_minutes} onChange={(e) => setData('estimated_minutes', Number(e.target.value))} />
                            </FieldLabel>
                        </div>
                        <Button disabled={processing} className="w-full">Simpan Layanan</Button>
                    </form>
                </Card>
                <div className="min-w-0 max-w-full space-y-3">
                    <Card className="overflow-hidden">
                        <h2 className="mb-2 text-sm font-semibold">Daftar Layanan</h2>
                        <DenseTable rows={services} columns={[
                            { key: 'code', label: 'Kode' },
                            { key: 'name', label: 'Layanan' },
                            { key: 'unit', label: 'Satuan' },
                            { key: 'price', label: 'Tarif', render: (row) => rupiah(row.price) },
                            { key: 'estimated_minutes', label: 'Estimasi' },
                        ]} />
                    </Card>
                    <Card className="overflow-hidden">
                        <h2 className="mb-2 text-sm font-semibold">Order Jasa</h2>
                        <DenseTable rows={orders} columns={[
                            { key: 'order_number', label: 'Order' },
                            { key: 'title', label: 'Pekerjaan' },
                            { key: 'customer_name', label: 'Pelanggan', render: (row) => row.customer_name || 'Umum' },
                            { key: 'status', label: 'Status', render: (row) => (
                                <FieldLabel label="Status order" help="Ubah status pekerjaan: pending belum dikerjakan, process sedang dikerjakan, done selesai, cancelled dibatalkan.">
                                    <Select value={row.status} onChange={(e) => router.put(`/service-orders/${row.id}`, { status: e.target.value }, { preserveScroll: true })}>
                                        <option value="pending">pending</option>
                                        <option value="process">process</option>
                                        <option value="done">done</option>
                                        <option value="cancelled">cancelled</option>
                                    </Select>
                                </FieldLabel>
                            ) },
                            { key: 'due_at', label: 'Estimasi', render: (row) => dateTime(row.due_at) },
                        ]} />
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
