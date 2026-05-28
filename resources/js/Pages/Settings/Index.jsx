import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, PageHeader, Select, TextInput } from '../../Components/UI';

export default function SettingsIndex({ settings }) {
    const { data, setData, post, processing } = useForm({
        store_name: settings?.store_name || '',
        phone: settings?.phone || '',
        address: settings?.address || '',
        receipt_footer: settings?.receipt_footer || '',
        default_paper_size: settings?.default_paper_size || 'thermal_80',
        invoice_prefix: settings?.invoice_prefix || 'ATK',
        theme: settings?.theme || 'dark',
    });

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan" />
            <PageHeader title="Pengaturan Toko & Cetak" description="Profil toko, footer struk, ukuran kertas default, prefix invoice, dan tema." />
            <Card className="max-w-2xl">
                <form onSubmit={(e) => { e.preventDefault(); post('/settings'); }} className="grid gap-2 sm:grid-cols-2">
                    <TextInput placeholder="Nama toko" value={data.store_name} onChange={(e) => setData('store_name', e.target.value)} />
                    <TextInput placeholder="Telepon" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                    <TextInput className="sm:col-span-2" placeholder="Alamat" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                    <TextInput className="sm:col-span-2" placeholder="Footer struk" value={data.receipt_footer} onChange={(e) => setData('receipt_footer', e.target.value)} />
                    <Select value={data.default_paper_size} onChange={(e) => setData('default_paper_size', e.target.value)}>
                        <option value="thermal_58">Thermal 58mm</option>
                        <option value="thermal_80">Thermal 80mm</option>
                        <option value="a4">A4</option>
                    </Select>
                    <TextInput placeholder="Prefix invoice" value={data.invoice_prefix} onChange={(e) => setData('invoice_prefix', e.target.value)} />
                    <Select value={data.theme} onChange={(e) => setData('theme', e.target.value)}>
                        <option value="dark">Gelap premium</option>
                        <option value="light">Terang premium</option>
                    </Select>
                    <div className="sm:col-span-2">
                        <Button disabled={processing}>Simpan Pengaturan</Button>
                    </div>
                </form>
            </Card>
        </AuthenticatedLayout>
    );
}
