import { Head, useForm } from '@inertiajs/react';
import { Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, PageHeader, Select, TextInput, rupiah } from '../../Components/UI';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

function FieldLabel({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[var(--atk-muted)]">{label}</span>
            {children}
        </label>
    );
}

export default function POSIndex({ products, services, customers }) {
    const [query, setQuery] = useState('');
    const [cart, setCart] = useState([]);
    const { data, setData, post, processing, errors, transform } = useForm({
        customer_id: '',
        discount: 0,
        paid_amount: 0,
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
    const subtotal = cart.reduce((sum, item) => sum + Math.max(0, item.quantity * item.unit_price - item.discount), 0);
    const total = Math.max(0, subtotal - Number(data.discount || 0));
    const change = Math.max(0, Number(data.paid_amount || 0) - total);
    const due = Math.max(0, total - Number(data.paid_amount || 0));

    function addItem(item) {
        setCart((current) => {
            const key = `${item.type}-${item.id}`;
            const existing = current.find((line) => line.key === key);
            if (existing) {
                return current.map((line) => line.key === key ? { ...line, quantity: Number(line.quantity) + 1 } : line);
            }
            return [...current, {
                key,
                type: item.type,
                id: item.id,
                name: item.name,
                unit: item.unit,
                quantity: 1,
                unit_price: Number(item.price),
                discount: 0,
            }];
        });
    }

    function updateLine(key, patch) {
        setCart((current) => current.map((line) => line.key === key ? { ...line, ...patch } : line));
    }

    function submit(e) {
        e.preventDefault();
        transform((form) => ({ ...form, items: cart }));
        post('/pos/sales', {
            preserveScroll: true,
            onBefore: () => cart.length > 0,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="POS Kasir" />
            <PageHeader title="POS Kasir High-Density" description="Cari produk ATK atau jasa, masukkan cart, lalu cetak struk thermal atau invoice A4." />
            <form onSubmit={submit} className="grid gap-3 xl:grid-cols-[1fr_25rem]">
                <div className="space-y-3">
                    <Card>
                        <div className="relative">
                            <Search className="absolute left-2 top-2 h-3.5 w-3.5 text-[var(--atk-muted)]" />
                            <TextInput className="pl-7" placeholder="Cari SKU, barcode, produk, atau jasa..." value={query} onChange={(e) => setQuery(e.target.value)} />
                        </div>
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
                        <Select value={data.customer_id} onChange={(e) => setData('customer_id', e.target.value)}>
                            <option value="">Pelanggan umum</option>
                            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} {customer.phone ? `- ${customer.phone}` : ''}</option>)}
                        </Select>
                        <div className="atk-scrollbar max-h-80 space-y-2 overflow-y-auto pr-1">
                            {cart.map((line) => (
                                <div key={line.key} className="rounded-lg border border-[var(--atk-border)] p-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-xs font-semibold">{line.name}</p>
                                        <button type="button" onClick={() => setCart((current) => current.filter((item) => item.key !== line.key))} className="text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                    <div className="mt-2 grid grid-cols-3 gap-1">
                                        <FieldLabel label={`Qty (${line.unit || 'unit'})`}>
                                            <TextInput type="number" min="0.01" step="0.01" value={line.quantity} onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) })} />
                                        </FieldLabel>
                                        <FieldLabel label="Harga">
                                            <TextInput type="number" min="0" value={line.unit_price} onChange={(e) => updateLine(line.key, { unit_price: Number(e.target.value) })} />
                                        </FieldLabel>
                                        <FieldLabel label="Diskon">
                                            <TextInput type="number" min="0" value={line.discount} onChange={(e) => updateLine(line.key, { discount: Number(e.target.value) })} />
                                        </FieldLabel>
                                    </div>
                                    <p className="mt-1 text-right text-xs font-bold"><span className="mr-1 text-[10px] font-medium text-[var(--atk-muted)]">Subtotal item</span>{rupiah(line.quantity * line.unit_price - line.discount)}</p>
                                </div>
                            ))}
                            {cart.length === 0 ? <p className="rounded-lg border border-dashed border-[var(--atk-border)] py-8 text-center text-[11px] text-[var(--atk-muted)]">Cart masih kosong.</p> : null}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <FieldLabel label="Diskon nota">
                                <TextInput type="number" min="0" placeholder="0" value={data.discount} onChange={(e) => setData('discount', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Nominal dibayar">
                                <TextInput type="number" min="0" placeholder="0" value={data.paid_amount} onChange={(e) => setData('paid_amount', Number(e.target.value))} />
                            </FieldLabel>
                            <FieldLabel label="Metode bayar">
                                <Select value={data.payment_method} onChange={(e) => setData('payment_method', e.target.value)}>
                                    <option value="cash">Tunai</option>
                                    <option value="transfer">Transfer</option>
                                    <option value="qris">QRIS</option>
                                    <option value="tempo">Tempo</option>
                                </Select>
                            </FieldLabel>
                            <FieldLabel label="Referensi bayar">
                                <TextInput placeholder="Ref pembayaran" value={data.payment_reference} onChange={(e) => setData('payment_reference', e.target.value)} />
                            </FieldLabel>
                        </div>
                        <FieldLabel label="Catatan transaksi/jasa">
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
