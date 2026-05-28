<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $adminEmail = (string) config('atk.admin_email');

        User::query()->updateOrCreate(
            ['email' => $adminEmail],
            [
                'name' => 'Amon Administrator',
                'password' => Hash::make((string) config('atk.admin_password')),
                'email_verified_at' => now(),
                'role' => User::ROLE_ADMIN,
            ]
        );

        DB::table('store_settings')->updateOrInsert(['id' => 1], [
            'store_name' => config('atk.store_name'),
            'phone' => '08xxxxxxxxxx',
            'address' => 'Alamat toko ATK',
            'receipt_footer' => 'Terima kasih sudah berbelanja.',
            'default_paper_size' => 'thermal_80',
            'invoice_prefix' => 'ATK',
            'theme' => 'dark',
            'payment_methods' => json_encode(['cash', 'transfer', 'qris']),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $categoryId = DB::table('product_categories')->insertGetId([
            'name' => 'Alat Tulis',
            'type' => 'product',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('product_categories')->insertOrIgnore([
            ['name' => 'Kertas & Cetak', 'type' => 'product', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Jasa Pengetikan', 'type' => 'service', 'created_at' => now(), 'updated_at' => now()],
        ]);

        DB::table('products')->insertOrIgnore([
            [
                'product_category_id' => $categoryId,
                'sku' => 'ATK-PULPEN-001',
                'barcode' => '899000001',
                'name' => 'Pulpen Standard',
                'unit' => 'pcs',
                'purchase_price' => 1500,
                'selling_price' => 2500,
                'stock' => 100,
                'minimum_stock' => 20,
                'rack_location' => 'Rak A1',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'product_category_id' => $categoryId,
                'sku' => 'ATK-BUKU-001',
                'barcode' => '899000002',
                'name' => 'Buku Tulis 38 Lembar',
                'unit' => 'pcs',
                'purchase_price' => 3000,
                'selling_price' => 5000,
                'stock' => 80,
                'minimum_stock' => 15,
                'rack_location' => 'Rak B1',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        DB::table('services')->insertOrIgnore([
            [
                'code' => 'JTK-001',
                'name' => 'Jasa Pengetikan Dokumen',
                'unit' => 'halaman',
                'price' => 3000,
                'estimated_minutes' => 15,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'code' => 'JTK-002',
                'name' => 'Cetak Dokumen Hitam Putih',
                'unit' => 'lembar',
                'price' => 1000,
                'estimated_minutes' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
