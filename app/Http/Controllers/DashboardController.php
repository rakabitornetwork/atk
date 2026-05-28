<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $today = Carbon::today();

        $salesToday = DB::table('sales')->whereDate('sold_at', $today);
        $serviceItemTotal = DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.item_type', 'service')
            ->whereDate('sales.sold_at', $today)
            ->sum('sale_items.total');

        $productItemTotal = DB::table('sale_items')
            ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
            ->where('sale_items.item_type', 'product')
            ->whereDate('sales.sold_at', $today)
            ->sum('sale_items.total');

        return Inertia::render('Dashboard', [
            'stats' => [
                'sales_count' => (clone $salesToday)->count(),
                'sales_total' => (int) (clone $salesToday)->sum('total'),
                'product_total' => (int) $productItemTotal,
                'service_total' => (int) $serviceItemTotal,
                'cash_in' => (int) DB::table('cash_movements')->where('type', 'in')->whereDate('created_at', $today)->sum('amount'),
                'cash_out' => (int) DB::table('cash_movements')->where('type', 'out')->whereDate('created_at', $today)->sum('amount'),
                'receivables' => (int) DB::table('sales')->sum('due_amount'),
                'low_stock' => DB::table('products')->whereColumn('stock', '<=', 'minimum_stock')->count(),
                'pending_services' => DB::table('service_orders')->whereIn('status', ['pending', 'process'])->count(),
            ],
            'recentSales' => DB::table('sales')
                ->leftJoin('customers', 'customers.id', '=', 'sales.customer_id')
                ->leftJoin('users', 'users.id', '=', 'sales.user_id')
                ->select('sales.*', 'customers.name as customer_name', 'users.name as cashier_name')
                ->latest('sales.sold_at')
                ->limit(12)
                ->get(),
            'lowStockProducts' => DB::table('products')
                ->whereColumn('stock', '<=', 'minimum_stock')
                ->orderBy('stock')
                ->limit(10)
                ->get(),
            'pendingServices' => DB::table('service_orders')
                ->leftJoin('customers', 'customers.id', '=', 'service_orders.customer_id')
                ->select('service_orders.*', 'customers.name as customer_name')
                ->latest('service_orders.created_at')
                ->limit(10)
                ->get(),
        ]);
    }
}
