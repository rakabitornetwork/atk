import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, PageHeader, dateTime, rupiah } from '../../Components/UI';

export default function SaleShow({ sale, items, payments, settings }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Invoice ${sale.invoice_number}`} />
            <PageHeader
                title={`Invoice ${sale.invoice_number}`}
                description="Cetak struk thermal 58/80mm atau invoice A4 dari halaman yang sama."
                action={<div className="flex gap-2 no-print"><Button type="button" onClick={() => window.print()}>Cetak</Button><Link href="/pos" className="rounded-lg border border-[var(--atk-border)] px-3 py-1.5 text-xs font-semibold">POS Baru</Link></div>}
            />
            <div className="grid gap-3 xl:grid-cols-[1fr_22rem]">
                <Card className="print-page bg-white text-slate-950 dark:bg-white dark:text-slate-950">
                    <div className="flex items-start justify-between border-b border-slate-200 pb-3">
                        <div>
                            <h2 className="text-lg font-bold">{settings?.store_name || 'ATK POS'}</h2>
                            <p className="text-[11px]">{settings?.address || '-'}</p>
                            <p className="text-[11px]">{settings?.phone || '-'}</p>
                        </div>
                        <div className="text-right text-[11px]">
                            <p className="font-bold">{sale.invoice_number}</p>
                            <p>{dateTime(sale.sold_at)}</p>
                            <p>Kasir: {sale.cashier_name || '-'}</p>
                        </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                            <p className="font-semibold">Pelanggan</p>
                            <p>{sale.customer_name || 'Umum'}</p>
                            <p>{sale.customer_phone || ''}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">Status</p>
                            <p>{sale.status}</p>
                        </div>
                    </div>
                    <table className="mt-3 w-full text-[11px]">
                        <thead>
                            <tr className="border-y border-slate-200">
                                <th className="py-1 text-left">Item</th>
                                <th className="py-1 text-right">Qty</th>
                                <th className="py-1 text-right">Harga</th>
                                <th className="py-1 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="py-1">{item.name}<span className="ml-1 text-slate-400">({item.item_type})</span></td>
                                    <td className="py-1 text-right">{Number(item.quantity)}</td>
                                    <td className="py-1 text-right">{rupiah(item.unit_price)}</td>
                                    <td className="py-1 text-right font-semibold">{rupiah(item.total)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="ml-auto mt-3 w-64 space-y-1 text-[11px]">
                        <div className="flex justify-between"><span>Subtotal</span><strong>{rupiah(sale.subtotal)}</strong></div>
                        <div className="flex justify-between"><span>Diskon</span><strong>{rupiah(sale.discount)}</strong></div>
                        <div className="flex justify-between text-sm"><span>Total</span><strong>{rupiah(sale.total)}</strong></div>
                        <div className="flex justify-between"><span>Dibayar</span><strong>{rupiah(sale.paid_amount)}</strong></div>
                        <div className="flex justify-between"><span>Kembali</span><strong>{rupiah(sale.change_amount)}</strong></div>
                        <div className="flex justify-between"><span>Piutang</span><strong>{rupiah(sale.due_amount)}</strong></div>
                    </div>
                    <p className="mt-6 text-center text-[11px]">{settings?.receipt_footer || 'Terima kasih.'}</p>
                </Card>
                <Card className="no-print">
                    <h2 className="text-sm font-semibold">Mode Cetak</h2>
                    <p className="mt-2 text-[11px] text-[var(--atk-muted)]">Gunakan dialog print browser. Pilih ukuran thermal 58/80mm untuk struk, atau A4 untuk invoice.</p>
                    <div className="mt-3 space-y-2 text-xs">
                        <p><strong>Pembayaran:</strong> {payments.map((p) => `${p.method} ${rupiah(p.amount)}`).join(', ') || '-'}</p>
                        <p><strong>Catatan:</strong> {sale.notes || '-'}</p>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
