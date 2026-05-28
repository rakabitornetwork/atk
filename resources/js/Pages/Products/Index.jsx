import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, Select, TextInput, rupiah } from '../../Components/UI';

export default function ProductsIndex({ products, categories }) {
    const { data, setData, post, processing, reset } = useForm({
        product_category_id: categories[0]?.id || '',
        sku: '',
        barcode: '',
        name: '',
        unit: 'pcs',
        purchase_price: 0,
        selling_price: 0,
        stock: 0,
        minimum_stock: 0,
        rack_location: '',
    });
    const categoryForm = useForm({ name: '' });

    function submit(e) {
        e.preventDefault();
        post('/products', { onSuccess: () => reset('sku', 'barcode', 'name', 'purchase_price', 'selling_price', 'stock', 'minimum_stock', 'rack_location') });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Produk ATK" />
            <PageHeader title="Master Produk ATK" description="Kelola SKU, barcode, harga, stok minimum, dan lokasi rak." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Produk</h2>
                    <form onSubmit={submit} className="space-y-2">
                        <Select value={data.product_category_id} onChange={(e) => setData('product_category_id', e.target.value)}>
                            <option value="">Tanpa kategori</option>
                            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                        </Select>
                        <TextInput placeholder="SKU" value={data.sku} onChange={(e) => setData('sku', e.target.value)} />
                        <TextInput placeholder="Barcode" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} />
                        <TextInput placeholder="Nama produk" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <TextInput placeholder="Satuan" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            <TextInput placeholder="Rak" value={data.rack_location} onChange={(e) => setData('rack_location', e.target.value)} />
                            <TextInput type="number" placeholder="Harga beli" value={data.purchase_price} onChange={(e) => setData('purchase_price', Number(e.target.value))} />
                            <TextInput type="number" placeholder="Harga jual" value={data.selling_price} onChange={(e) => setData('selling_price', Number(e.target.value))} />
                            <TextInput type="number" placeholder="Stok" value={data.stock} onChange={(e) => setData('stock', Number(e.target.value))} />
                            <TextInput type="number" placeholder="Stok min" value={data.minimum_stock} onChange={(e) => setData('minimum_stock', Number(e.target.value))} />
                        </div>
                        <Button disabled={processing} className="w-full">Simpan Produk</Button>
                    </form>
                    <form onSubmit={(e) => { e.preventDefault(); categoryForm.post('/products/categories', { onSuccess: () => categoryForm.reset() }); }} className="mt-4 border-t border-[var(--atk-border)] pt-3">
                        <p className="mb-2 text-xs font-semibold">Kategori Baru</p>
                        <div className="flex gap-2">
                            <TextInput placeholder="Nama kategori" value={categoryForm.data.name} onChange={(e) => categoryForm.setData('name', e.target.value)} />
                            <Button disabled={categoryForm.processing}>Tambah</Button>
                        </div>
                    </form>
                </Card>
                <Card>
                    <DenseTable
                        rows={products.data}
                        columns={[
                            { key: 'sku', label: 'SKU' },
                            { key: 'barcode', label: 'Barcode' },
                            { key: 'name', label: 'Nama' },
                            { key: 'category_name', label: 'Kategori' },
                            { key: 'stock', label: 'Stok' },
                            { key: 'minimum_stock', label: 'Min' },
                            { key: 'selling_price', label: 'Jual', render: (row) => rupiah(row.selling_price) },
                            { key: 'rack_location', label: 'Rak' },
                        ]}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
