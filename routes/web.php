<?php

use App\Http\Controllers\ApplicationDeployController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\PosController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\SaleController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware('guest')->group(function (): void {
    Route::get('/admin', [AuthController::class, 'create'])->name('login');
    Route::post('/admin', [AuthController::class, 'store'])->name('login.store');
});

Route::middleware('auth')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', DashboardController::class)->name('dashboard');
    Route::get('/pos', [PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/sales', [PosController::class, 'store'])->name('pos.sales.store');

    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');

    Route::middleware('admin')->group(function (): void {
        Route::get('/users', [OperationsController::class, 'users'])->name('users.index');
        Route::post('/users', [OperationsController::class, 'storeUser'])->name('users.store');
        Route::put('/users/{user}', [OperationsController::class, 'updateUser'])->name('users.update');
        Route::post('/users/{user}/update', [OperationsController::class, 'updateUser'])->name('users.update.upload');
        Route::delete('/users/{user}', [OperationsController::class, 'destroyUser'])->name('users.destroy');

        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::post('/products/categories', [ProductController::class, 'storeCategory'])->name('products.categories.store');

        Route::get('/services', [OperationsController::class, 'services'])->name('services.index');
        Route::post('/services', [OperationsController::class, 'storeService'])->name('services.store');
        Route::put('/service-orders/{serviceOrder}', [OperationsController::class, 'updateServiceOrder'])->name('service-orders.update');

        Route::get('/inventory', [OperationsController::class, 'inventory'])->name('inventory.index');
        Route::post('/inventory/adjust', [OperationsController::class, 'adjustStock'])->name('inventory.adjust');

        Route::get('/purchases', [OperationsController::class, 'purchases'])->name('purchases.index');
        Route::post('/purchases', [OperationsController::class, 'storePurchase'])->name('purchases.store');
        Route::post('/suppliers', [OperationsController::class, 'storeSupplier'])->name('suppliers.store');

        Route::get('/customers', [OperationsController::class, 'customers'])->name('customers.index');
        Route::post('/customers', [OperationsController::class, 'storeCustomer'])->name('customers.store');

        Route::get('/reports', [OperationsController::class, 'reports'])->name('reports.index');
        Route::get('/settings', [OperationsController::class, 'settings'])->name('settings.index');
        Route::post('/settings', [OperationsController::class, 'updateSettings'])->name('settings.update');
        Route::get('/audit', [OperationsController::class, 'audit'])->name('audit.index');

        Route::get('/settings/deployment', [ApplicationDeployController::class, 'index'])->name('settings.deployment');
        Route::post('/settings/deployment/sync', [ApplicationDeployController::class, 'sync'])
            ->middleware('throttle:5,1')
            ->name('settings.deployment.sync');
    });
});
