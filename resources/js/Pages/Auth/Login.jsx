import { Head, useForm, usePage } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import { Button, Card, FieldLabel, TextInput } from '../../Components/UI';
import ThemeToggle from '../../Components/ThemeToggle';

export default function Login() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        email: 'amon@teslatech.my.id',
        password: '',
        remember: true,
    });

    function submit(e) {
        e.preventDefault();
        post('/admin');
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <Head title="Login Administrator" />
            <Card className="w-full max-w-sm">
                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                            <LockKeyhole className="h-5 w-5" />
                        </div>
                        <h1 className="text-lg font-bold">ATK Premium POS</h1>
                        <p className="text-[11px] text-[var(--atk-muted)]">Masuk ke panel kasir dan administrator.</p>
                    </div>
                    <ThemeToggle />
                </div>
                {flash?.error ? <div className="mb-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{flash.error}</div> : null}
                <form onSubmit={submit} className="space-y-3">
                    <FieldLabel label="Email" help="Masukkan email akun admin, kasir, atau operator yang sudah dibuat di sistem.">
                        <TextInput type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} autoFocus />
                        {errors.email ? <p className="mt-1 text-[10px] text-rose-300">{errors.email}</p> : null}
                    </FieldLabel>
                    <FieldLabel label="Password" help="Masukkan password akun. Jika lupa, minta admin utama membuat ulang akun atau mengganti password.">
                        <TextInput type="password" value={data.password} onChange={(e) => setData('password', e.target.value)} />
                        {errors.password ? <p className="mt-1 text-[10px] text-rose-300">{errors.password}</p> : null}
                    </FieldLabel>
                    <div className="flex items-center gap-2 text-[11px] text-[var(--atk-muted)]">
                        <input type="checkbox" checked={data.remember} onChange={(e) => setData('remember', e.target.checked)} />
                        <FieldLabel label="Ingat sesi login" help="Aktifkan jika komputer ini aman dipakai sendiri. Sesi login akan disimpan lebih lama sehingga tidak perlu sering masuk ulang.">
                            <span className="sr-only">Ingat sesi login</span>
                        </FieldLabel>
                    </div>
                    <Button disabled={processing} className="w-full">{processing ? 'Masuk...' : 'Masuk'}</Button>
                </form>
            </Card>
        </div>
    );
}
