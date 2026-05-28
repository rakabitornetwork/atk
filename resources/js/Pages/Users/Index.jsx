import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Button, Card, DenseTable, FieldLabel, PageHeader, Select, TextInput, dateTime } from '../../Components/UI';

export default function UsersIndex({ users, roles, primaryAdminEmail }) {
    const [editingUserId, setEditingUserId] = useState(null);
    const { data, setData, post, processing, reset, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        profile_photo: null,
    });
    const editForm = useForm({
        name: '',
        email: '',
        password: '',
        role: 'kasir',
        profile_photo: null,
    });

    function startEdit(user) {
        setEditingUserId(user.id);
        editForm.setData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            profile_photo: null,
        });
    }

    function cancelEdit() {
        setEditingUserId(null);
        editForm.reset();
        editForm.clearErrors();
    }

    function submitEdit(userId) {
        editForm.post(`/users/${userId}/update`, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: cancelEdit,
        });
    }

    function deleteUser(user) {
        if (!confirm(`Hapus akun ${user.name}?`)) {
            return;
        }

        router.delete(`/users/${user.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Akun Pengguna" />
            <PageHeader title="Akun Pengguna" description="Buat akun administrator, kasir, atau operator." />
            <div className="grid gap-3 xl:grid-cols-[22rem_1fr]">
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Tambah Akun</h2>
                    <form onSubmit={(e) => { e.preventDefault(); post('/users', { forceFormData: true, onSuccess: () => reset() }); }} className="space-y-2">
                        <FieldLabel label="Foto profil" help="Upload foto pengguna. Disarankan gambar persegi agar tampil rapi di sidebar dan tabel pengguna.">
                            <input type="file" accept="image/*" onChange={(e) => setData('profile_photo', e.target.files?.[0] ?? null)} className="w-full rounded-lg border border-[var(--atk-border)] bg-white/70 px-2.5 py-2 text-sm text-slate-900 dark:bg-slate-950/70 dark:text-slate-100" />
                        </FieldLabel>
                        <FieldLabel label="Nama pengguna" help="Nama orang yang akan tampil di header aplikasi, audit log, dan riwayat transaksi.">
                            <TextInput placeholder="Nama" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Email login" help="Email yang dipakai pengguna untuk masuk ke aplikasi melalui halaman /admin. Harus unik.">
                            <TextInput type="email" placeholder="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Password" help="Password awal pengguna. Minimal 8 karakter, gunakan kombinasi yang mudah diingat tetapi tidak mudah ditebak.">
                            <TextInput type="password" placeholder="Password minimal 8 karakter" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        </FieldLabel>
                        <FieldLabel label="Role akses" help="Admin dapat mengakses semua menu. Kasir fokus POS dan riwayat transaksi. Operator disiapkan untuk akses operasional terbatas.">
                            <Select value={data.role} onChange={(e) => setData('role', e.target.value)}>
                                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                            </Select>
                        </FieldLabel>
                        {Object.values(errors).length ? <p className="text-[10px] text-rose-300">{Object.values(errors)[0]}</p> : null}
                        <Button disabled={processing} className="w-full">Simpan Akun</Button>
                    </form>
                </Card>
                <Card>
                    <DenseTable rows={users} columns={[
                        { key: 'photo', label: 'Foto', render: (user) => (
                            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-violet-600 text-xs font-bold text-white">
                                {user.profile_photo_url ? <img src={user.profile_photo_url} alt={user.name} className="h-full w-full object-cover" /> : user.name?.charAt(0)}
                            </div>
                        ) },
                        { key: 'name', label: 'Nama', render: (user) => editingUserId === user.id ? (
                            <TextInput value={editForm.data.name} onChange={(e) => editForm.setData('name', e.target.value)} />
                        ) : user.name },
                        { key: 'email', label: 'Email', render: (user) => editingUserId === user.id ? (
                            <TextInput type="email" value={editForm.data.email} onChange={(e) => editForm.setData('email', e.target.value)} />
                        ) : (
                            <span>
                                {user.email}
                                {user.email === primaryAdminEmail ? <span className="ml-2 rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">Admin utama</span> : null}
                            </span>
                        ) },
                        { key: 'role', label: 'Role', render: (user) => editingUserId === user.id ? (
                            <Select value={editForm.data.role} onChange={(e) => editForm.setData('role', e.target.value)}>
                                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
                            </Select>
                        ) : user.role },
                        { key: 'password', label: 'Password', className: 'w-44', tdClassName: 'w-44', render: (user) => editingUserId === user.id ? (
                            <TextInput className="w-44" type="password" placeholder="Kosongkan" value={editForm.data.password} onChange={(e) => editForm.setData('password', e.target.value)} />
                        ) : '********' },
                        { key: 'profile_upload', label: 'Foto baru', className: 'w-44', tdClassName: 'w-44', render: (user) => editingUserId === user.id ? (
                            <div className="w-44">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => editForm.setData('profile_photo', e.target.files?.[0] ?? null)}
                                    className="block w-full rounded border border-[var(--atk-border)] bg-white/70 px-2 py-1 text-[11px] text-slate-900 file:mr-2 file:rounded file:border-0 file:bg-violet-600 file:px-2 file:py-1 file:text-[11px] file:font-semibold file:text-white dark:bg-slate-950/70 dark:text-slate-100"
                                />
                            </div>
                        ) : '-' },
                        { key: 'created_at', label: 'Dibuat', render: (row) => dateTime(row.created_at) },
                        { key: 'actions', label: 'Aksi', render: (user) => editingUserId === user.id ? (
                            <div className="flex gap-1">
                                <Button type="button" disabled={editForm.processing} onClick={() => submitEdit(user.id)} className="px-2 py-1 text-xs">Simpan</Button>
                                <button type="button" onClick={cancelEdit} className="rounded border border-[var(--atk-border)] px-2 py-1 text-xs">Batal</button>
                            </div>
                        ) : (
                            <div className="flex gap-1">
                                <button type="button" onClick={() => startEdit(user)} className="rounded border border-violet-400/30 px-2 py-1 text-xs font-semibold text-violet-300">Edit</button>
                                {user.email !== primaryAdminEmail ? (
                                    <button type="button" onClick={() => deleteUser(user)} className="rounded border border-rose-400/30 px-2 py-1 text-xs font-semibold text-rose-300">Hapus</button>
                                ) : null}
                            </div>
                        ) },
                    ]} />
                    {Object.values(editForm.errors).length ? <p className="mt-2 text-[10px] text-rose-300">{Object.values(editForm.errors)[0]}</p> : null}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
