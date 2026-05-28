import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, FieldLabel, PageHeader, Select, TextInput, dateTime } from '../../Components/UI';

export default function InventoryIndex({ products, movements, lowStock }) {
    const { data, setData, post, processing, reset } = useForm({
        product_id: products[0]?.id || '',
        type: 'in',
        quantity: 1,
        notes: '',
    });

    function submit(e) {
        e.preventDefault();
        post('/inventory/adjust', { onSuccess: () => reset('quantity', 'notes') });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Inventory" />
            <PageHeader title="Inventory & Kartu Stok" description="Stok masuk, keluar, koreksi, opname, dan alert stok minimum." />
            <div className="grid min-w-0 gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Penyesuaian Stok</h2>
                    <form onSubmit={submit} className="space-y-2">
                        <FieldLabel label="Produk" help="Pilih produk yang stoknya akan ditambah, dikurangi, atau disesuaikan. Angka stok saat ini tampil di pilihan.">
                            <Select value={data.product_id} onChange={(e) => setData('product_id', e.target.value)}>
                                {products.map((product) => <option key={product.id} value={product.id}>{product.name} - stok {product.stock}</option>)}
                            </Select>
                        </FieldLabel>
                        <FieldLabel label="Tipe perubahan" help="Stok masuk menambah stok, stok keluar mengurangi stok, set stok opname mengganti stok menjadi angka yang diisi.">
                            <Select value={data.type} onChange={(e) => setData('type', e.target.value)}>
                                <option value="in">Stok masuk</option>
                                <option value="out">Stok keluar</option>
                                <option value="adjustment">Set stok opname</option>
                            </Select>
                        </FieldLabel>
                        <FieldLabel label="Jumlah" help="Untuk stok masuk/keluar isi jumlah perubahan. Untuk stok opname isi jumlah stok akhir yang benar.">
                            <TextInput type="number" value={data.quantity} onChange={(e) => setData('quantity', Number(e.target.value))} />
                        </FieldLabel>
                        <FieldLabel label="Catatan" help="Alasan perubahan stok, misalnya barang rusak, salah input, opname bulanan, atau stok datang tanpa pembelian.">
                            <TextInput placeholder="Catatan" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </FieldLabel>
                        <Button disabled={processing} className="w-full">Simpan Stok</Button>
                    </form>
                    <h2 className="mb-2 mt-4 text-sm font-semibold">Stok Menipis</h2>
                    <DenseTable rows={lowStock} columns={[
                        { key: 'sku', label: 'SKU' },
                        { key: 'name', label: 'Produk' },
                        { key: 'stock', label: 'Stok' },
                        { key: 'minimum_stock', label: 'Min' },
                    ]} />
                </Card>
                <Card>
                    <DenseTable rows={movements} columns={[
                        { key: 'created_at', label: 'Tanggal', render: (row) => dateTime(row.created_at) },
                        { key: 'product_name', label: 'Produk' },
                        { key: 'type', label: 'Tipe' },
                        { key: 'quantity', label: 'Qty' },
                        { key: 'stock_before', label: 'Sebelum' },
                        { key: 'stock_after', label: 'Sesudah' },
                        { key: 'user_name', label: 'User' },
                        { key: 'notes', label: 'Catatan' },
                    ]} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
