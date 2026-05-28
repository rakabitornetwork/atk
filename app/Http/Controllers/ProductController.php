<?php

namespace App\Http\Controllers;

use App\Support\Activity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Products/Index', [
            'products' => DB::table('products')
                ->leftJoin('product_categories', 'product_categories.id', '=', 'products.product_category_id')
                ->select('products.*', 'product_categories.name as category_name')
                ->orderBy('products.name')
                ->paginate(50),
            'categories' => DB::table('product_categories')->where('type', 'product')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'sku' => ['required', 'string', 'max:80', 'unique:products,sku'],
            'barcode' => ['nullable', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:180'],
            'unit' => ['required', 'string', 'max:24'],
            'purchase_price' => ['nullable', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'stock' => ['nullable', 'integer'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'rack_location' => ['nullable', 'string', 'max:80'],
        ]);

        $id = DB::table('products')->insertGetId([
            ...$data,
            'purchase_price' => (int) ($data['purchase_price'] ?? 0),
            'stock' => (int) ($data['stock'] ?? 0),
            'minimum_stock' => (int) ($data['minimum_stock'] ?? 0),
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Activity::log($request, 'product.created', 'product', $id, ['sku' => $data['sku']]);

        return back()->with('success', 'Produk ditambahkan.');
    }

    public function update(Request $request, int $product): RedirectResponse
    {
        $data = $request->validate([
            'product_category_id' => ['nullable', 'integer', 'exists:product_categories,id'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($product)],
            'barcode' => ['nullable', 'string', 'max:80'],
            'name' => ['required', 'string', 'max:180'],
            'unit' => ['required', 'string', 'max:24'],
            'purchase_price' => ['nullable', 'integer', 'min:0'],
            'selling_price' => ['required', 'integer', 'min:0'],
            'minimum_stock' => ['nullable', 'integer', 'min:0'],
            'rack_location' => ['nullable', 'string', 'max:80'],
            'is_active' => ['required', 'boolean'],
        ]);

        DB::table('products')->where('id', $product)->update([...$data, 'updated_at' => now()]);
        Activity::log($request, 'product.updated', 'product', $product, ['sku' => $data['sku']]);

        return back()->with('success', 'Produk diperbarui.');
    }

    public function storeCategory(Request $request): RedirectResponse
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:120']]);
        DB::table('product_categories')->insert([
            'name' => $data['name'],
            'type' => 'product',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return back()->with('success', 'Kategori produk ditambahkan.');
    }
}
