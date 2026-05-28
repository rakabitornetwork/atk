<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AtkPosFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_open_core_pages(): void
    {
        $admin = User::factory()->create(['role' => User::ROLE_ADMIN]);
        DB::table('store_settings')->insert([
            'store_name' => 'Teslatech ATK',
            'invoice_prefix' => 'ATK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach (['dashboard', 'pos.index', 'users.index', 'products.index', 'reports.index', 'settings.index'] as $route) {
            $this->actingAs($admin)->get(route($route))->assertOk();
        }
    }

    public function test_cashier_can_create_sale_with_product_and_service(): void
    {
        $cashier = User::factory()->create(['role' => User::ROLE_CASHIER]);
        DB::table('store_settings')->insert([
            'store_name' => 'Teslatech ATK',
            'invoice_prefix' => 'ATK',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $productId = DB::table('products')->insertGetId([
            'sku' => 'PEN-001',
            'name' => 'Pulpen',
            'unit' => 'pcs',
            'selling_price' => 2500,
            'stock' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $serviceId = DB::table('services')->insertGetId([
            'code' => 'JTK-001',
            'name' => 'Jasa Ketik',
            'unit' => 'halaman',
            'price' => 3000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->actingAs($cashier)->post(route('pos.sales.store'), [
            'items' => [
                ['type' => 'product', 'id' => $productId, 'name' => 'Pulpen', 'unit' => 'pcs', 'quantity' => 2, 'unit_price' => 2500, 'discount' => 0],
                ['type' => 'service', 'id' => $serviceId, 'name' => 'Jasa Ketik', 'unit' => 'halaman', 'quantity' => 1, 'unit_price' => 3000, 'discount' => 0],
            ],
            'discount' => 0,
            'paid_amount' => 8000,
            'payment_method' => 'cash',
        ])->assertRedirect();

        $this->assertDatabaseHas('sales', ['total' => 8000, 'status' => 'paid']);
        $this->assertDatabaseHas('products', ['id' => $productId, 'stock' => 8]);
        $this->assertDatabaseHas('service_orders', ['title' => 'Jasa Ketik', 'status' => 'pending']);
    }

    public function test_admin_can_update_user_but_cannot_delete_primary_admin(): void
    {
        config(['atk.admin_email' => 'primary@example.test']);
        $admin = User::factory()->create(['email' => 'primary@example.test', 'role' => User::ROLE_ADMIN]);
        $cashier = User::factory()->create(['role' => User::ROLE_CASHIER]);

        $this->actingAs($admin)->put(route('users.update', $cashier), [
            'name' => 'Kasir Baru',
            'email' => 'kasir-baru@example.test',
            'password' => '',
            'role' => User::ROLE_OPERATOR,
        ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $cashier->id,
            'name' => 'Kasir Baru',
            'email' => 'kasir-baru@example.test',
            'role' => User::ROLE_OPERATOR,
        ]);

        $this->actingAs($admin)->delete(route('users.destroy', $admin))->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
