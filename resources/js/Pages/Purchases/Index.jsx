import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, Select, TextInput, dateTime, rupiah } from '../../Components/UI';

export default function PurchasesIndex({ suppliers, products, purchases }) {
    const purchase = useForm({
        supplier_id: '',
        product_id: products[0]?.id || '',
        quantity: 1,
        unit_cost: 0,
        extra_cost: 0,
        paid_amount: 0,
        reference_number: '',
    });
    const supplier = useForm({ name: '', phone: '', address: '' });

    return (
        <AuthenticatedLayout>
            <Head title="Pembelian" />
            <PageHeader title="Pembelian & Supplier" description="Input pembelian barang, stok otomatis bertambah, hutang supplier tercatat." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Pembelian</h2>
                    <form onSubmit={(e) => { e.preventDefault(); purchase.post('/purchases', { onSuccess: () => purchase.reset('quantity', 'unit_cost', 'extra_cost', 'paid_amount', 'reference_number') }); }} className="space-y-2">
                        <Select value={purchase.data.supplier_id} onChange={(e) => purchase.setData('supplier_id', e.target.value)}>
                            <option value="">Tanpa supplier</option>
                            {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </Select>
                        <Select value={purchase.data.product_id} onChange={(e) => purchase.setData('product_id', e.target.value)}>
                            {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                        <div className="grid grid-cols-2 gap-2">
                            <TextInput type="number" value={purchase.data.quantity} onChange={(e) => purchase.setData('quantity', Number(e.target.value))} placeholder="Qty" />
                            <TextInput type="number" value={purchase.data.unit_cost} onChange={(e) => purchase.setData('unit_cost', Number(e.target.value))} placeholder="Harga beli" />
                            <TextInput type="number" value={purchase.data.extra_cost} onChange={(e) => purchase.setData('extra_cost', Number(e.target.value))} placeholder="Biaya tambahan" />
                            <TextInput type="number" value={purchase.data.paid_amount} onChange={(e) => purchase.setData('paid_amount', Number(e.target.value))} placeholder="Dibayar" />
                        </div>
                        <TextInput value={purchase.data.reference_number} onChange={(e) => purchase.setData('reference_number', e.target.value)} placeholder="Nomor referensi" />
                        <Button disabled={purchase.processing} className="w-full">Simpan Pembelian</Button>
                    </form>
                    <form onSubmit={(e) => { e.preventDefault(); supplier.post('/suppliers', { onSuccess: () => supplier.reset() }); }} className="mt-4 border-t border-[var(--atk-border)] pt-3">
                        <h2 className="mb-2 text-sm font-semibold">Supplier Baru</h2>
                        <div className="space-y-2">
                            <TextInput placeholder="Nama supplier" value={supplier.data.name} onChange={(e) => supplier.setData('name', e.target.value)} />
                            <TextInput placeholder="Telepon" value={supplier.data.phone} onChange={(e) => supplier.setData('phone', e.target.value)} />
                            <TextInput placeholder="Alamat" value={supplier.data.address} onChange={(e) => supplier.setData('address', e.target.value)} />
                            <Button disabled={supplier.processing} className="w-full">Tambah Supplier</Button>
                        </div>
                    </form>
                </Card>
                <Card>
                    <DenseTable rows={purchases} columns={[
                        { key: 'reference_number', label: 'Ref', render: (row) => row.reference_number || `PO-${row.id}` },
                        { key: 'supplier_name', label: 'Supplier', render: (row) => row.supplier_name || '-' },
                        { key: 'status', label: 'Status' },
                        { key: 'total', label: 'Total', render: (row) => rupiah(row.total) },
                        { key: 'due_amount', label: 'Hutang', render: (row) => rupiah(row.due_amount) },
                        { key: 'user_name', label: 'User' },
                        { key: 'purchased_at', label: 'Tanggal', render: (row) => dateTime(row.purchased_at) },
                    ]} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
