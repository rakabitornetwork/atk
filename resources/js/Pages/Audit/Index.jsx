import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '../../Layouts/AuthenticatedLayout';
import { Card, DenseTable, PageHeader, dateTime } from '../../Components/UI';

export default function AuditIndex({ logs }) {
    return (
        <AuthenticatedLayout>
            <Head title="Audit Aktivitas" />
            <PageHeader title="Audit Aktivitas" description="Jejak aksi penting administrator dan kasir." />
            <Card>
                <DenseTable rows={logs.data} columns={[
                    { key: 'created_at', label: 'Waktu', render: (row) => dateTime(row.created_at) },
                    { key: 'user_name', label: 'User', render: (row) => row.user_name || row.user_email || '-' },
                    { key: 'action', label: 'Aksi' },
                    { key: 'subject_type', label: 'Subjek' },
                    { key: 'subject_id', label: 'ID' },
                    { key: 'ip_address', label: 'IP' },
                ]} />
            </Card>
        </AuthenticatedLayout>
    );
}
