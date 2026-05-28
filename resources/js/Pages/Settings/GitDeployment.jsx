import { Head, router, usePage } from '@inertiajs/react';
import { GitBranch, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, DenseTable, PageHeader } from '../../Components/UI';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';

export default function GitDeployment({ status }) {
    const { flash } = usePage().props;
    const [options, setOptions] = useState({ run_composer: true, run_npm: true, run_migrate: true, run_optimize: true });

    function sync() {
        if (!confirm('Jalankan update dari GitHub?')) return;
        router.post('/settings/deployment/sync', options, { preserveScroll: true });
    }

    return (
        <AuthenticatedLayout>
            <Head title="Update dari GitHub" />
            <PageHeader title="Update dari GitHub" description="Perbarui aplikasi dari repository GitHub dengan mode fast-forward." action={<Button type="button" onClick={() => router.reload()}><RefreshCw className="mr-1 h-3.5 w-3.5" />Refresh</Button>} />
            <div className="grid gap-3 xl:grid-cols-2">
                <Card>
                    <div className="mb-3 flex items-center gap-2">
                        <GitBranch className="h-5 w-5 text-violet-300" />
                        <h2 className="text-sm font-semibold">Status Repository</h2>
                    </div>
                    <dl className="grid grid-cols-2 gap-2 text-xs">
                        <dt className="text-[var(--atk-muted)]">UI update</dt><dd>{status.ui_enabled ? 'Aktif' : 'Nonaktif'}</dd>
                        <dt className="text-[var(--atk-muted)]">Git repo</dt><dd>{status.is_git_repo ? 'Ya' : 'Tidak'}</dd>
                        <dt className="text-[var(--atk-muted)]">Ada update</dt><dd>{status.has_update ? 'Ya' : 'Tidak'}</dd>
                        <dt className="text-[var(--atk-muted)]">Perubahan lokal</dt><dd>{status.dirty ? `${status.dirty_count || 1} file` : 'Bersih'}</dd>
                        <dt className="text-[var(--atk-muted)]">Local</dt><dd>{status.local_version || '-'}</dd>
                        <dt className="text-[var(--atk-muted)]">Remote</dt><dd>{status.remote_version || '-'}</dd>
                    </dl>
                    <div className="mt-4 grid gap-2 text-xs">
                        {Object.keys(options).map((key) => (
                            <label key={key} className="flex items-center gap-2">
                                <input type="checkbox" checked={options[key]} onChange={(e) => setOptions((current) => ({ ...current, [key]: e.target.checked }))} />
                                {key.replace('run_', '').replace('_', ' ')}
                            </label>
                        ))}
                    </div>
                    <Button type="button" disabled={!status.can_sync} onClick={sync} className="mt-4 w-full">Update dari GitHub</Button>
                    {!status.can_sync ? <p className="mt-2 text-[11px] text-[var(--atk-muted)]">Tombol aktif jika server adalah git repo, UI update aktif, dan origin memiliki update.</p> : null}
                </Card>
                <Card>
                    <h2 className="mb-2 text-sm font-semibold">Ringkasan Proses</h2>
                    <DenseTable
                        rows={flash?.deploy_logs || []}
                        keyField="step"
                        empty="Belum ada proses update pada sesi ini."
                        columns={[
                            { key: 'step', label: 'Step' },
                            { key: 'success', label: 'Status', render: (row) => row.success ? 'OK' : 'Gagal' },
                            { key: 'message', label: 'Pesan', tdClassName: 'max-w-md truncate' },
                        ]}
                    />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
