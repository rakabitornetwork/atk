<?php

namespace App\Http\Controllers;

use App\Support\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PosController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('POS/Index', [
            'products' => DB::table('products')
                ->leftJoin('product_categories', 'product_categories.id', '=', 'products.product_category_id')
                ->select('products.*', 'product_categories.name as category_name')
                ->where('products.is_active', true)
                ->orderBy('products.name')
                ->get(),
            'services' => DB::table('services')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(),
            'customers' => DB::table('customers')->orderBy('name')->get(['id', 'name', 'phone']),
            'settings' => DB::table('store_settings')->first(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.type' => ['required', Rule::in(['product', 'service'])],
            'items.*.id' => ['required', 'integer'],
            'items.*.name' => ['required', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:24'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.01'],
            'items.*.unit_price' => ['required', 'integer', 'min:0'],
            'items.*.discount' => ['nullable', 'integer', 'min:0'],
            'discount' => ['nullable', 'integer', 'min:0'],
            'paid_amount' => ['required', 'integer', 'min:0'],
            'payment_method' => ['required', 'string', 'max:32'],
            'payment_reference' => ['nullable', 'string', 'max:120'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $saleId = DB::transaction(function () use ($request, $data): int {
            $subtotal = collect($data['items'])->sum(function (array $item): int {
                $lineTotal = (int) round(((float) $item['quantity']) * (int) $item['unit_price']);
                return max(0, $lineTotal - (int) ($item['discount'] ?? 0));
            });
            $discount = min((int) ($data['discount'] ?? 0), $subtotal);
            $total = max(0, $subtotal - $discount);
            $paid = (int) $data['paid_amount'];
            $due = max(0, $total - $paid);
            $change = max(0, $paid - $total);
            $settings = DB::table('store_settings')->first();
            $invoice = sprintf('%s-%s-%04d', $settings?->invoice_prefix ?? 'ATK', now()->format('Ymd'), DB::table('sales')->whereDate('sold_at', today())->count() + 1);

            $saleId = DB::table('sales')->insertGetId([
                'invoice_number' => $invoice,
                'customer_id' => $data['customer_id'] ?? null,
                'user_id' => $request->user()->id,
                'status' => $due > 0 ? 'partial' : 'paid',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'paid_amount' => $paid,
                'change_amount' => $change,
                'due_amount' => $due,
                'notes' => $data['notes'] ?? null,
                'sold_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($data['items'] as $item) {
                $quantity = (float) $item['quantity'];
                $lineTotal = max(0, (int) round($quantity * (int) $item['unit_price']) - (int) ($item['discount'] ?? 0));

                DB::table('sale_items')->insert([
                    'sale_id' => $saleId,
                    'item_type' => $item['type'],
                    'item_id' => $item['id'],
                    'name' => $item['name'],
                    'unit' => $item['unit'] ?? null,
                    'quantity' => $quantity,
                    'unit_price' => (int) $item['unit_price'],
                    'discount' => (int) ($item['discount'] ?? 0),
                    'total' => $lineTotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($item['type'] === 'product') {
                    $product = DB::table('products')->where('id', $item['id'])->lockForUpdate()->first();
                    $stockBefore = (int) $product->stock;
                    $stockAfter = $stockBefore - (int) $quantity;
                    DB::table('products')->where('id', $item['id'])->update(['stock' => $stockAfter, 'updated_at' => now()]);
                    DB::table('stock_movements')->insert([
                        'product_id' => $item['id'],
                        'user_id' => $request->user()->id,
                        'type' => 'sale',
                        'quantity' => -1 * (int) $quantity,
                        'stock_before' => $stockBefore,
                        'stock_after' => $stockAfter,
                        'reference_type' => 'sale',
                        'reference_id' => $saleId,
                        'notes' => $invoice,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    $orderId = DB::table('service_orders')->insertGetId([
                        'sale_id' => $saleId,
                        'customer_id' => $data['customer_id'] ?? null,
                        'order_number' => $invoice.'-J'.$item['id'],
                        'title' => $item['name'],
                        'status' => 'pending',
                        'due_at' => now()->addMinutes(60),
                        'notes' => $data['notes'] ?? null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('service_order_items')->insert([
                        'service_order_id' => $orderId,
                        'service_id' => $item['id'],
                        'name' => $item['name'],
                        'quantity' => $quantity,
                        'unit_price' => (int) $item['unit_price'],
                        'total' => $lineTotal,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            DB::table('payments')->insert([
                'sale_id' => $saleId,
                'method' => $data['payment_method'],
                'amount' => min($paid, $total),
                'reference' => $data['payment_reference'] ?? null,
                'paid_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('cash_movements')->insert([
                'user_id' => $request->user()->id,
                'type' => 'in',
                'category' => 'sale',
                'amount' => min($paid, $total),
                'notes' => $invoice,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Activity::log($request, 'sale.created', 'sale', $saleId, ['invoice' => $invoice, 'total' => $total]);

            return $saleId;
        });

        return redirect()->route('sales.show', $saleId)->with('success', 'Transaksi berhasil disimpan.');
    }
}
