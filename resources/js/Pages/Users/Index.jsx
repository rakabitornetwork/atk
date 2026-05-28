import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, PageHeader, Select, TextInput, dateTime } from '../../Components/UI';

export default function UsersIndex({ users, roles }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
    });

    return (
        <AuthenticatedLayout>
            <Head title="Akun Pengguna" />
            <PageHeader title="Akun Pengguna" description="Buat akun administrator, kasir, atau operator." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Akun</h2>
                    <form onSubmit={(e) => { e.preventDefault(); post('/users', { onSuccess: () => reset() }); }} className="space-y-2">
                        <TextInput placeholder="Nama" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <TextInput type="email" placeholder="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <TextInput type="password" placeholder="Password minimal 8 karakter" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        <Select value={data.role} onChange={(e) => setData('role', e.target.value)}>
                            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                        </Select>
                        {Object.values(errors).length ? <p className="text-[10px] text-rose-300">{Object.values(errors)[0]}</p> : null}
                        <Button disabled={processing} className="w-full">Simpan Akun</Button>
                    </form>
                </Card>
                <Card>
                    <DenseTable rows={users} columns={[
                        { key: 'name', label: 'Nama' },
                        { key: 'email', label: 'Email' },
                        { key: 'role', label: 'Role' },
                        { key: 'created_at', label: 'Dibuat', render: (row) => dateTime(row.created_at) },
                    ]} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
