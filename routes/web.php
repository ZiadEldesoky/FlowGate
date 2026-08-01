<?php

use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\PurchaseRequestSubmissionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', 'purchase-requests')
        ->name('dashboard');

    Route::get(
        'purchase-requests',
        [PurchaseRequestController::class, 'index'],
    )
        ->middleware('can:viewAny,App\Models\PurchaseRequest')
        ->name('purchase-requests.index');

    Route::get(
        'purchase-requests/create',
        [PurchaseRequestController::class, 'create'],
    )
        ->middleware('can:create,App\Models\PurchaseRequest')
        ->name('purchase-requests.create');

    Route::post(
        'purchase-requests',
        [PurchaseRequestController::class, 'store'],
    )
        ->middleware('can:create,App\Models\PurchaseRequest')
        ->name('purchase-requests.store');

    Route::get(
        'purchase-requests/{purchaseRequestId}',
        [PurchaseRequestController::class, 'show'],
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.show');

    Route::get(
        'purchase-requests/{purchaseRequestId}/edit',
        [PurchaseRequestController::class, 'edit'],
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.edit');

    Route::put(
        'purchase-requests/{purchaseRequestId}',
        [PurchaseRequestController::class, 'update'],
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.update');

    Route::post(
        'purchase-requests/{purchaseRequestId}/submit',
        PurchaseRequestSubmissionController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.submit');
});

require __DIR__.'/settings.php';
