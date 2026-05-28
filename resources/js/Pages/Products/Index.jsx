import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, FieldLabel, PageHeader, Select, TextInput, rupiah } from '../../Components/UI';

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
            <div className="grid min-w-0 gap-3 xl:grid-cols-[22rem_minmax(0,1fr)]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Produk</h2>
                    <form onSubmit={submit} className="space-y-2">
                        <FieldLabel label="Kategori" help="Kelompok produk untuk memudahkan pencarian, laporan, dan pengaturan rak. Bisa dikosongkan jika belum ada kategori.">
                            <Select value={data.product_category_id} onChange={(e) => setData('product_category_id', e.target.value)}>
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </Select>
                        </FieldLabel>
                        <FieldLabel label="SKU" help="Kode unik internal toko untuk produk. Contoh: ATK-PULPEN-001. Tidak boleh sama dengan produk lain.">
                            <TextInput placeholder="SKU" value={data.sku} onChange={(e) => setData('sku', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Barcode" help="Kode barcode dari kemasan produk. Isi jika produk akan dicari atau discan memakai barcode scanner.">
                            <TextInput placeholder="Barcode" value={data.barcode} onChange={(e) => setData('barcode', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Nama produk" help="Nama barang yang tampil di POS, laporan, nota, dan invoice. Buat singkat tetapi jelas.">
                            <TextInput placeholder="Nama produk" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </FieldLabel>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <FieldLabel label="Satuan" help="Satuan jual produk, misalnya pcs, pak, rim, box, atau lembar.">
                                <TextInput placeholder="Satuan" value={data.unit} onChange={(e) => setData('unit', e.target.value)} />
                            </FieldLabel>
                            <FieldLabel label="Rak" help="Lokasi penyimpanan barang, misalnya Rak A1 atau Etalase 2, agar mudah dicari.">
                                <TextInput placeholder="Rak" value={data.rack_location} onChange={(e) => setData('rack_location', e.target.value)} />
                            </FieldLabel>
                            <FieldLabel label="Harga beli" help="Modal atau harga pokok per satuan. Dipakai untuk menghitung laba kotor.">
                                <TextInput type="number" placeholder="Harga beli" value={data.purchase_price} onChange={(e) => setData('purchase_price', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Harga jual" help="Harga yang digunakan saat produk masuk ke cart POS. Masih bisa diubah manual saat transaksi.">
                                <TextInput type="number" placeholder="Harga jual" value={data.selling_price} onChange={(e) => setData('selling_price', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Stok awal" help="Jumlah barang yang tersedia saat produk dibuat pertama kali.">
                                <TextInput type="number" placeholder="Stok" value={data.stock} onChange={(e) => setData('stock', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Stok minimum" help="Batas minimum stok. Jika stok sama atau di bawah nilai ini, produk tampil di daftar stok menipis.">
                                <TextInput type="number" placeholder="Stok min" value={data.minimum_stock} onChange={(e) => setData('minimum_stock', Number(e.target.value))} />
                            </FieldLabel>
                        </div>
                        <Button disabled={processing} className="w-full">Simpan Produk</Button>
                    </form>
                    <form onSubmit={(e) => { e.preventDefault(); categoryForm.post('/products/categories', { onSuccess: () => categoryForm.reset() }); }} className="mt-4 border-t border-[var(--atk-border)] pt-3">
                        <p className="mb-2 text-xs font-semibold">Kategori Baru</p>
                        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                            <FieldLabel label="Nama kategori" help="Nama kelompok produk baru, misalnya Alat Tulis, Kertas, Map, atau Perlengkapan Kantor." className="flex-1">
                                <TextInput placeholder="Nama kategori" value={categoryForm.data.name} onChange={(e) => categoryForm.setData('name', e.target.value)} />
                            </FieldLabel>
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
