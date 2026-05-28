import { Head, useForm } from '@inertiajs/react';
import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, FieldLabel, PageHeader, Select, TextInput, rupiah } from '../../Components/UI';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

function integerValue(value, min = 0) {
    const digits = String(value ?? '').replace(/[^\d]/g, '');

    if (digits === '') {
        return min;
    }

    return Math.max(min, Number.parseInt(digits, 10));
}

function formatInteger(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value || 0));
}

function moneyInputValue(value) {
    const digits = String(value ?? '').replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');

    if (digits === '') {
        return '';
    }

    return formatInteger(Number.parseInt(digits, 10));
}

function quantityInputValue(value) {
    const digits = String(value ?? '').replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');

    if (digits === '') {
        return '';
    }

    return String(Math.max(1, Number.parseInt(digits, 10)));
}

function blockNonIntegerKey(event) {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
        event.preventDefault();
    }
}

export default function POSIndex({ products, services, customers }) {
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState([]);
    const { data, setData, post, processing, errors, transform } = useForm({
        customer_id: '',
        discount: '',
        paid_amount: '',
        payment_method: 'cash',
        payment_reference: '',
        notes: '',
        items: [],
    });

    const catalog = useMemo(() => [
        ...products.map((item) => ({ ...item, type: 'product', price: item.selling_price, code: item.sku })),
        ...services.map((item) => ({ ...item, type: 'service', price: item.price })),
    ], [products, services]);

    const filtered = catalog.filter((item) => `${item.name} ${item.code} ${item.barcode || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 80);
    const subtotal = cart.reduce((sum, item) => sum + Math.max(0, integerValue(item.quantity, 1) * integerValue(item.unit_price) - integerValue(item.discount)), 0);
    const total = Math.max(0, subtotal - integerValue(data.discount));
    const change = Math.max(0, integerValue(data.paid_amount) - total);
    const due = Math.max(0, total - integerValue(data.paid_amount));

    function addItem(item) {
        setCart((current) => {
            const key = `${item.type}-${item.id}`;
            const existing = current.find((line) => line.key === key);
            if (existing) {
                return current.map((line) => line.key === key ? { ...line, quantity: String(integerValue(line.quantity, 1) + 1) } : line);
            }
            return [...current, {
                key,
                type: item.type,
                id: item.id,
                name: item.name,
                unit: item.unit,
                quantity: '1',
                unit_price: moneyInputValue(item.price),
                discount: '',
            }];
        });
    }

    function updateLine(key, patch) {
        setCart((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
    }

    function submit(e) {
        e.preventDefault();
        transform((form) => ({
            ...form,
            discount: integerValue(form.discount),
            paid_amount: integerValue(form.paid_amount),
            items: cart.map((item) => ({
                ...item,
                quantity: integerValue(item.quantity, 1),
                unit_price: integerValue(item.unit_price),
                discount: integerValue(item.discount),
            })),
        }));
        post('/pos/sales', {
            preserveScroll: true,
            onBefore: () => cart.length > 0,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="POS Kasir" />
            <PageHeader title="POS Kasir High-Density" description="Cari produk ATK atau jasa, masukkan cart, lalu cetak struk thermal atau invoice A4." />
            <form onSubmit={submit} className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,1fr)_25rem]">
                <div className="space-y-3">
                    <Card>
                        <FieldLabel label="Cari item" help="Cari produk ATK atau jasa berdasarkan nama, SKU, barcode, atau kode jasa. Klik hasil pencarian untuk memasukkannya ke cart.">
                            <div className="relative">
                                <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-[var(--atk-muted)]" />
                                <TextInput className="pl-7" placeholder="Cari SKU, barcode, produk, atau jasa..." value={query} onChange={(e) => setQuery(e.target.value)} />
                            </div>
                        </FieldLabel>
                        <div className="atk-scrollbar mt-3 grid max-h-[38rem] gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                            {filtered.map((item) => (
                                <button key={`${item.type}-${item.id}`} type="button" onClick={() => addItem(item)} className="rounded-lg border border-[var(--atk-border)] bg-white/60 p-2 text-left transition hover:border-violet-400 dark:bg-slate-950/50">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="line-clamp-2 text-xs font-semibold">{item.name}</p>
                                        <span className={`rounded px-1.5 py-0.5 text-[10px] ${item.type === 'product' ? 'bg-sky-500/15 text-sky-300' : 'bg-violet-500/15 text-violet-300'}`}>{item.type === 'product' ? 'ATK' : 'JASA'}</span>
                                    </div>
                                    <p className="mt-1 text-[10px] text-[var(--atk-muted)]">{item.code || item.sku} · {item.unit} {item.type === 'product' ? `· stok ${item.stock}` : ''}</p>
                                    <p className="mt-2 text-sm font-bold tabular-nums">{rupiah(item.price)}</p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                <Card className="xl:sticky xl:top-16 xl:self-start">
                    <h2 className="mb-2 text-sm font-semibold">Cart Transaksi</h2>
                    <div className="space-y-2">
                        <FieldLabel label="Pelanggan" help="Pilih pelanggan jika transaksi ingin tersimpan ke riwayat pelanggan atau menjadi piutang. Kosongkan untuk pembeli umum.">
                            <Select value={data.customer_id} onChange={(e) => setData('customer_id', e.target.value)}>
                                <option value="">Pelanggan umum</option>
                                {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} {customer.phone ? `- ${customer.phone}` : ''}</option>)}
                            </Select>
                        </FieldLabel>
                        <div className="atk-scrollbar max-h-80 space-y-2 overflow-y-auto pr-1">
                            {cart.map((line) => (
                                <div key={line.key} className="rounded-lg border border-[var(--atk-border)] p-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-semibold">{line.name}</p>
                                        <button type="button" onClick={() => setCart((current) => current.filter((item) => item.key !== line.key))} className="text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                    <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
                                        <FieldLabel label={`Qty (${line.unit || 'unit'})`} help="Jumlah barang atau layanan yang dijual pada baris ini. Untuk jasa bisa diisi jumlah halaman, lembar, atau paket sesuai satuan.">
                                            <TextInput
                                                type="number"
                                                min="1"
                                                step="1"
                                                inputMode="numeric"
                                                value={line.quantity}
                                                onKeyDown={blockNonIntegerKey}
                                                onChange={(e) => updateLine(line.key, { quantity: quantityInputValue(e.target.value) })}
                                                onBlur={() => updateLine(line.key, { quantity: line.quantity === '' ? '1' : quantityInputValue(line.quantity) })}
                                            />
                                        </FieldLabel>
                                        <FieldLabel label="Harga" help="Harga jual per satuan untuk item ini. Bisa diubah manual jika ada harga khusus.">
                                            <TextInput
                                                type="text"
                                                inputMode="numeric"
                                                value={line.unit_price}
                                                onKeyDown={blockNonIntegerKey}
                                                onChange={(e) => updateLine(line.key, { unit_price: moneyInputValue(e.target.value) })}
                                                onBlur={() => updateLine(line.key, { unit_price: line.unit_price === '' ? '0' : moneyInputValue(line.unit_price) })}
                                            />
                                        </FieldLabel>
                                        <FieldLabel label="Diskon" help="Potongan khusus untuk item ini saja. Nilainya mengurangi subtotal baris item, bukan total seluruh nota.">
                                            <TextInput
                                                type="text"
                                                inputMode="numeric"
                                                value={line.discount}
                                                onKeyDown={blockNonIntegerKey}
                                                onChange={(e) => updateLine(line.key, { discount: moneyInputValue(e.target.value) })}
                                                onBlur={() => updateLine(line.key, { discount: line.discount === '' ? '0' : moneyInputValue(line.discount) })}
                                            />
                                        </FieldLabel>
                                    </div>
                                    <p className="mt-1 text-right text-xs font-bold"><span className="mr-1 text-[10px] font-medium text-[var(--atk-muted)]">Subtotal item</span>{rupiah(integerValue(line.quantity, 1) * integerValue(line.unit_price) - integerValue(line.discount))}</p>
                                </div>
                            ))}
                            {cart.length === 0 ? <p className="rounded-lg border border-dashed border-[var(--atk-border)] py-8 text-center text-[11px] text-[var(--atk-muted)]">Cart masih kosong.</p> : null}
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                            <FieldLabel label="Diskon nota" help="Potongan untuk total seluruh transaksi setelah semua subtotal item dijumlahkan. Cocok untuk promo toko, pembulatan, atau diskon belanja keseluruhan.">
                                <TextInput
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={data.discount}
                                    onKeyDown={blockNonIntegerKey}
                                    onChange={(e) => setData('discount', moneyInputValue(e.target.value))}
                                    onBlur={() => setData('discount', data.discount === '' ? '0' : moneyInputValue(data.discount))}
                                />
                            </FieldLabel>
                            <FieldLabel label="Nominal dibayar" help="Jumlah uang yang diterima dari pelanggan. Jika kurang dari total, sisanya tercatat sebagai piutang.">
                                <TextInput
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={data.paid_amount}
                                    onKeyDown={blockNonIntegerKey}
                                    onChange={(e) => setData('paid_amount', moneyInputValue(e.target.value))}
                                    onBlur={() => setData('paid_amount', data.paid_amount === '' ? '0' : moneyInputValue(data.paid_amount))}
                                />
                            </FieldLabel>
                            <FieldLabel label="Metode bayar" help="Pilih cara pembayaran utama: tunai, transfer, QRIS, atau tempo untuk transaksi belum lunas.">
                                <Select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                    <option value="cash">Tunai</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="qris">QRIS</option>
                                    <option value="tempo">Tempo</option>
                                </Select>
                            </FieldLabel>
                            <FieldLabel label="Referensi bayar" help="Nomor referensi transfer, ID QRIS, catatan bukti bayar, atau nomor transaksi eksternal. Boleh kosong untuk tunai.">
                                <TextInput placeholder="Ref pembayaran" value={data.payment_reference} onChange={(e) => setData('payment_reference', e.target.value)} />
                            </FieldLabel>
                        </div>
                        <FieldLabel label="Catatan transaksi/jasa" help="Isi instruksi tambahan, detail file, deadline, atau catatan khusus pelanggan untuk transaksi ini.">
                            <TextInput placeholder="Catatan transaksi/jasa" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        </FieldLabel>
                        <div className="rounded-lg bg-black/[0.04] p-2 text-xs dark:bg-white/[0.04]">
                            <div className="flex justify-between"><span>Subtotal</span><strong>{rupiah(subtotal)}</strong></div>
                            <div className="flex justify-between"><span>Total</span><strong>{rupiah(total)}</strong></div>
                            <div className="flex justify-between text-emerald-300"><span>Kembalian</span><strong>{rupiah(change)}</strong></div>
                            <div className="flex justify-between text-amber-300"><span>Piutang</span><strong>{rupiah(due)}</strong></div>
                        </div>
                        {errors.items ? <p className="text-[10px] text-rose-300">{errors.items}</p> : null}
                        <Button type="submit" disabled={processing || cart.length === 0} className="w-full">Simpan Transaksi</Button>
                    </div>
                </Card>
            </form>
        </AuthenticatedLayout>
    );
}
