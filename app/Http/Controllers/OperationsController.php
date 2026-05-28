<?php

namespace App\Http\Controllers;

use App\Support\Activity;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    public function users(): Response
    {
        return Inertia::render('Users/Index', [
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role', 'profile_photo_path', 'created_at'])
                ->map(fn (User $user): array => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'profile_photo_url' => $user->profile_photo_url,
                    'created_at' => $user->created_at,
                ]),
            'roles' => [User::ROLE_ADMIN, User::ROLE_CASHIER, User::ROLE_OPERATOR],
            'primaryAdminEmail' => config('atk.admin_email'),
        ]);
    }

    public function storeUser(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:160', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_CASHIER, User::ROLE_OPERATOR])],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $user = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $data['role'],
            'profile_photo_path' => $request->file('profile_photo')?->store('profile-photos', 'public'),
            'email_verified_at' => now(),
        ]);

        Activity::log($request, 'user.created', 'user', $user->id, ['email' => $user->email, 'role' => $user->role]);

        return back()->with('success', 'Akun pengguna ditambahkan.');
    }

    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'email' => ['required', 'email', 'max:160', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', Rule::in([User::ROLE_ADMIN, User::ROLE_CASHIER, User::ROLE_OPERATOR])],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
        ]);

        $payload = [
            'name' => $data['name'],
            'email' => $data['email'],
            'role' => $data['role'],
        ];

        if (! empty($data['password'])) {
            $payload['password'] = Hash::make($data['password']);
        }

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo_path) {
                Storage::disk('public')->delete($user->profile_photo_path);
            }
            $payload['profile_photo_path'] = $request->file('profile_photo')->store('profile-photos', 'public');
        }

        $user->update($payload);
        Activity::log($request, 'user.updated', 'user', $user->id, ['email' => $user->email, 'role' => $user->role]);

        return back()->with('success', 'Akun pengguna diperbarui.');
    }

    public function destroyUser(Request $request, User $user): RedirectResponse
    {
        if ($user->email === (string) config('atk.admin_email')) {
            return back()->with('error', 'Pengguna utama admin tidak boleh dihapus.');
        }

        if ($request->user()?->id === $user->id) {
            return back()->with('error', 'Akun yang sedang login tidak boleh menghapus dirinya sendiri.');
        }

        Activity::log($request, 'user.deleted', 'user', $user->id, ['email' => $user->email, 'role' => $user->role]);
        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }
        $user->delete();

        return back()->with('success', 'Akun pengguna dihapus.');
    }

    public function services(): Response
    {
        return Inertia::render('Services/Index', [
            'services' => DB::table('services')->orderBy('name')->get(),
            'orders' => DB::table('service_orders')
                ->leftJoin('customers', 'customers.id', '=', 'service_orders.customer_id')
                ->select('service_orders.*', 'customers.name as customer_name')
                ->latest('service_orders.created_at')
                ->limit(80)
                ->get(),
        ]);
    }

    public function storeService(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:services,code'],
            'name' => ['required', 'string', 'max:180'],
            'unit' => ['required', 'string', 'max:24'],
            'price' => ['required', 'integer', 'min:0'],
            'estimated_minutes' => ['nullable', 'integer', 'min:0'],
        ]);

        $id = DB::table('services')->insertGetId([
            ...$data,
            'estimated_minutes' => (int) ($data['estimated_minutes'] ?? 0),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        Activity::log($request, 'service.created', 'service', $id, ['code' => $data['code']]);

        return back()->with('success', 'Jasa ditambahkan.');
    }

    public function updateServiceOrder(Request $request, int $serviceOrder): RedirectResponse
    {
        $data = $request->validate(['status' => ['required', Rule::in(['pending', 'process', 'done', 'cancelled'])]]);
        DB::table('service_orders')->where('id', $serviceOrder)->update([...$data, 'updated_at' => now()]);
        Activity::log($request, 'service_order.updated', 'service_order', $serviceOrder, $data);

        return back()->with('success', 'Status pekerjaan jasa diperbarui.');
    }

    public function inventory(): Response
    {
        return Inertia::render('Inventory/Index', [
            'products' => DB::table('products')->orderBy('name')->get(),
            'movements' => DB::table('stock_movements')
                ->join('products', 'products.id', '=', 'stock_movements.product_id')
                ->leftJoin('users', 'users.id', '=', 'stock_movements.user_id')
                ->select('stock_movements.*', 'products.name as product_name', 'users.name as user_name')
                ->latest('stock_movements.created_at')
                ->limit(100)
                ->get(),
            'lowStock' => DB::table('products')->whereColumn('stock', '<=', 'minimum_stock')->orderBy('stock')->get(),
        ]);
    }

    public function adjustStock(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($request, $data): void {
            $product = DB::table('products')->where('id', $data['product_id'])->lockForUpdate()->first();
            $before = (int) $product->stock;
            $after = $data['type'] === 'adjustment' ? (int) $data['quantity'] : $before + (int) $data['quantity'];
            DB::table('products')->where('id', $data['product_id'])->update(['stock' => $after, 'updated_at' => now()]);
            DB::table('stock_movements')->insert([
                'product_id' => $data['product_id'],
                'user_id' => $request->user()->id,
                'type' => $data['type'],
                'quantity' => $data['type'] === 'adjustment' ? $after - $before : (int) $data['quantity'],
                'stock_before' => $before,
                'stock_after' => $after,
                'reference_type' => 'manual',
                'notes' => $data['notes'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        Activity::log($request, 'stock.adjusted', 'product', (int) $data['product_id'], $data);

        return back()->with('success', 'Stok diperbarui.');
    }

    public function purchases(): Response
    {
        return Inertia::render('Purchases/Index', [
            'suppliers' => DB::table('suppliers')->orderBy('name')->get(),
            'products' => DB::table('products')->orderBy('name')->get(),
            'purchases' => DB::table('purchases')
                ->leftJoin('suppliers', 'suppliers.id', '=', 'purchases.supplier_id')
                ->leftJoin('users', 'users.id', '=', 'purchases.user_id')
                ->select('purchases.*', 'suppliers.name as supplier_name', 'users.name as user_name')
                ->latest('purchases.purchased_at')
                ->limit(80)
                ->get(),
        ]);
    }

    public function storeSupplier(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);
        DB::table('suppliers')->insert([...$data, 'created_at' => now(), 'updated_at' => now()]);

        return back()->with('success', 'Supplier ditambahkan.');
    }

    public function storePurchase(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'supplier_id' => ['nullable', 'integer', 'exists:suppliers,id'],
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit_cost' => ['required', 'integer', 'min:0'],
            'extra_cost' => ['nullable', 'integer', 'min:0'],
            'paid_amount' => ['nullable', 'integer', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:120'],
        ]);

        $purchaseId = DB::transaction(function () use ($request, $data): int {
            $subtotal = (int) $data['quantity'] * (int) $data['unit_cost'];
            $total = $subtotal + (int) ($data['extra_cost'] ?? 0);
            $paid = (int) ($data['paid_amount'] ?? $total);
            $due = max(0, $total - $paid);
            $purchaseId = DB::table('purchases')->insertGetId([
                'supplier_id' => $data['supplier_id'] ?? null,
                'user_id' => $request->user()->id,
                'reference_number' => $data['reference_number'] ?? null,
                'status' => $due > 0 ? 'partial' : 'paid',
                'subtotal' => $subtotal,
                'extra_cost' => (int) ($data['extra_cost'] ?? 0),
                'total' => $total,
                'paid_amount' => $paid,
                'due_amount' => $due,
                'purchased_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('purchase_items')->insert([
                'purchase_id' => $purchaseId,
                'product_id' => $data['product_id'],
                'quantity' => $data['quantity'],
                'unit_cost' => $data['unit_cost'],
                'total' => $subtotal,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $product = DB::table('products')->where('id', $data['product_id'])->lockForUpdate()->first();
            $before = (int) $product->stock;
            $after = $before + (int) $data['quantity'];
            DB::table('products')->where('id', $data['product_id'])->update([
                'stock' => $after,
                'purchase_price' => $data['unit_cost'],
                'updated_at' => now(),
            ]);
            DB::table('stock_movements')->insert([
                'product_id' => $data['product_id'],
                'user_id' => $request->user()->id,
                'type' => 'purchase',
                'quantity' => $data['quantity'],
                'stock_before' => $before,
                'stock_after' => $after,
                'reference_type' => 'purchase',
                'reference_id' => $purchaseId,
                'notes' => $data['reference_number'] ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $purchaseId;
        });

        Activity::log($request, 'purchase.created', 'purchase', $purchaseId, ['total' => $data['quantity'] * $data['unit_cost']]);

        return back()->with('success', 'Pembelian disimpan dan stok bertambah.');
    }

    public function customers(): Response
    {
        return Inertia::render('Customers/Index', [
            'customers' => DB::table('customers')
                ->leftJoin('sales', 'sales.customer_id', '=', 'customers.id')
                ->select('customers.*', DB::raw('COALESCE(SUM(sales.total), 0) as sales_total'), DB::raw('COALESCE(SUM(sales.due_amount), 0) as due_total'))
                ->groupBy('customers.id')
                ->orderBy('customers.name')
                ->get(),
        ]);
    }

    public function storeCustomer(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);
        $id = DB::table('customers')->insertGetId([...$data, 'created_at' => now(), 'updated_at' => now()]);
        Activity::log($request, 'customer.created', 'customer', $id, ['name' => $data['name']]);

        return back()->with('success', 'Pelanggan ditambahkan.');
    }

    public function reports(): Response
    {
        $from = request('from', now()->startOfMonth()->toDateString());
        $to = request('to', now()->toDateString());

        return Inertia::render('Reports/Index', [
            'filters' => ['from' => $from, 'to' => $to],
            'summary' => [
                'sales_total' => (int) DB::table('sales')->whereBetween(DB::raw('date(sold_at)'), [$from, $to])->sum('total'),
                'sales_count' => DB::table('sales')->whereBetween(DB::raw('date(sold_at)'), [$from, $to])->count(),
                'purchase_total' => (int) DB::table('purchases')->whereBetween(DB::raw('date(purchased_at)'), [$from, $to])->sum('total'),
                'gross_profit' => (int) DB::table('sale_items')
                    ->leftJoin('products', function ($join): void {
                        $join->on('products.id', '=', 'sale_items.item_id')->where('sale_items.item_type', '=', 'product');
                    })
                    ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                    ->whereBetween(DB::raw('date(sales.sold_at)'), [$from, $to])
                    ->sum(DB::raw('sale_items.total - COALESCE(products.purchase_price, 0) * sale_items.quantity')),
                'receivables' => (int) DB::table('sales')->sum('due_amount'),
                'debts' => (int) DB::table('purchases')->sum('due_amount'),
            ],
            'topProducts' => DB::table('sale_items')
                ->join('sales', 'sales.id', '=', 'sale_items.sale_id')
                ->whereBetween(DB::raw('date(sales.sold_at)'), [$from, $to])
                ->groupBy('sale_items.name', 'sale_items.item_type')
                ->select('sale_items.name', 'sale_items.item_type', DB::raw('SUM(sale_items.quantity) as quantity'), DB::raw('SUM(sale_items.total) as total'))
                ->orderByDesc('total')
                ->limit(20)
                ->get(),
            'dailySales' => DB::table('sales')
                ->whereBetween(DB::raw('date(sold_at)'), [$from, $to])
                ->groupBy(DB::raw('date(sold_at)'))
                ->select(DB::raw('date(sold_at) as date'), DB::raw('COUNT(*) as count'), DB::raw('SUM(total) as total'))
                ->orderBy('date')
                ->get(),
        ]);
    }

    public function settings(): Response
    {
        $settings = DB::table('store_settings')->first();

        return Inertia::render('Settings/Index', [
            'settings' => $settings ? [
                ...((array) $settings),
                'logo_url' => $settings->logo_path ? Storage::disk('public')->url($settings->logo_path) : null,
                'logo_icon_url' => $settings->logo_icon_path ? Storage::disk('public')->url($settings->logo_icon_path) : null,
                'navbar_logo_url' => $settings->navbar_logo_path ? Storage::disk('public')->url($settings->navbar_logo_path) : null,
            ] : null,
        ]);
    }

    public function updateSettings(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'store_name' => ['required', 'string', 'max:160'],
            'phone' => ['nullable', 'string', 'max:40'],
            'address' => ['nullable', 'string', 'max:255'],
            'receipt_footer' => ['nullable', 'string', 'max:160'],
            'default_paper_size' => ['required', Rule::in(['thermal_58', 'thermal_80', 'a4'])],
            'invoice_prefix' => ['required', 'string', 'max:12'],
            'theme' => ['required', Rule::in(['dark', 'light'])],
            'logo' => ['nullable', 'image', 'max:2048'],
            'logo_icon' => ['nullable', 'image', 'max:1024'],
            'navbar_logo' => ['nullable', 'image', 'max:2048'],
        ]);

        $settings = DB::table('store_settings')->where('id', 1)->first();
        $payload = collect($data)->except(['logo', 'logo_icon', 'navbar_logo'])->all();

        foreach ([
            'logo' => 'logo_path',
            'logo_icon' => 'logo_icon_path',
            'navbar_logo' => 'navbar_logo_path',
        ] as $input => $column) {
            if ($request->hasFile($input)) {
                if ($settings?->{$column}) {
                    Storage::disk('public')->delete($settings->{$column});
                }
                $payload[$column] = $request->file($input)->store('branding', 'public');
            }
        }

        DB::table('store_settings')->updateOrInsert(['id' => 1], [...$payload, 'updated_at' => now(), 'created_at' => $settings?->created_at ?? now()]);
        Activity::log($request, 'settings.updated', 'store_settings', 1, collect($payload)->except(['logo_path', 'logo_icon_path', 'navbar_logo_path'])->all());

        return back()->with('success', 'Pengaturan toko disimpan.');
    }

    public function audit(): Response
    {
        abort_unless(request()->user()?->isAdmin(), 403);

        return Inertia::render('Audit/Index', [
            'logs' => DB::table('activity_logs')
                ->leftJoin('users', 'users.id', '=', 'activity_logs.user_id')
                ->select('activity_logs.*', 'users.name as user_name', 'users.email as user_email')
                ->latest('activity_logs.created_at')
                ->paginate(80),
        ]);
    }
}
