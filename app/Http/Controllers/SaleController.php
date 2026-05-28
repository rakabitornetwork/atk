<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SaleController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Sales/Index', [
            'sales' => DB::table('sales')
                ->leftJoin('customers', 'customers.id', '=', 'sales.customer_id')
                ->leftJoin('users', 'users.id', '=', 'sales.user_id')
                ->select('sales.*', 'customers.name as customer_name', 'users.name as cashier_name')
                ->latest('sales.sold_at')
                ->paginate(80),
        ]);
    }

    public function show(int $sale): Response
    {
        return Inertia::render('Sales/Show', $this->payload($sale));
    }

    private function payload(int $sale): array
    {
        $record = DB::table('sales')
            ->leftJoin('customers', 'customers.id', '=', 'sales.customer_id')
            ->leftJoin('users', 'users.id', '=', 'sales.user_id')
            ->select('sales.*', 'customers.name as customer_name', 'customers.phone as customer_phone', 'customers.address as customer_address', 'users.name as cashier_name')
            ->where('sales.id', $sale)
            ->first();

        abort_unless($record, 404);

        return [
            'sale' => $record,
            'items' => DB::table('sale_items')->where('sale_id', $sale)->get(),
            'payments' => DB::table('payments')->where('sale_id', $sale)->get(),
            'settings' => DB::table('store_settings')->first(),
        ];
    }
}
