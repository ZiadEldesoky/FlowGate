<?php

use App\Http\Controllers\ApprovalQueueController;
use App\Http\Controllers\DepartmentAdministrationController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\NotificationReadAllController;
use App\Http\Controllers\NotificationReadController;
use App\Http\Controllers\OrganizationActivityController;
use App\Http\Controllers\OrganizationUserAdministrationController;
use App\Http\Controllers\PurchaseRequestCancellationController;
use App\Http\Controllers\PurchaseRequestCompletionController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\PurchaseRequestManagerApprovalController;
use App\Http\Controllers\PurchaseRequestProcurementApprovalController;
use App\Http\Controllers\PurchaseRequestRejectionController;
use App\Http\Controllers\PurchaseRequestSubmissionController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::redirect('dashboard', 'purchase-requests')
        ->name('dashboard');

    Route::redirect('administration', '/administration/departments')
        ->middleware('can:viewAny,App\\Models\\Department')
        ->name('administration.index');

    Route::prefix('administration')
        ->name('administration.')
        ->group(function () {
            Route::get(
                'departments',
                [DepartmentAdministrationController::class, 'index'],
            )
                ->middleware('can:viewAny,App\\Models\\Department')
                ->name('departments.index');

            Route::post(
                'departments',
                [DepartmentAdministrationController::class, 'store'],
            )
                ->middleware('can:create,App\\Models\\Department')
                ->name('departments.store');

            Route::put(
                'departments/{departmentId}',
                [DepartmentAdministrationController::class, 'update'],
            )
                ->whereNumber('departmentId')
                ->name('departments.update');

            Route::get(
                'users',
                [OrganizationUserAdministrationController::class, 'index'],
            )
                ->middleware('can:viewAny,App\\Models\\User')
                ->name('users.index');

            Route::put(
                'users/{userId}',
                [OrganizationUserAdministrationController::class, 'update'],
            )
                ->whereNumber('userId')
                ->name('users.update');

            Route::get(
                'activity',
                OrganizationActivityController::class,
            )
                ->middleware(
                    'can:viewAny,App\\Models\\OrganizationActivityLog',
                )
                ->name('activity.index');
        });

    Route::get('approvals', ApprovalQueueController::class)
        ->middleware('can:viewApprovalQueue,App\\Models\\PurchaseRequest')
        ->name('approvals.index');

    Route::get('notifications', NotificationController::class)
        ->name('notifications.index');

    Route::patch(
        'notifications/read-all',
        NotificationReadAllController::class,
    )->name('notifications.read-all');

    Route::patch(
        'notifications/{notificationId}/read',
        NotificationReadController::class,
    )
        ->whereUuid('notificationId')
        ->name('notifications.read');

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

    Route::post(
        'purchase-requests/{purchaseRequestId}/approve-manager-review',
        PurchaseRequestManagerApprovalController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.approve-manager-review');

    Route::post(
        'purchase-requests/{purchaseRequestId}/approve-procurement-review',
        PurchaseRequestProcurementApprovalController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.approve-procurement-review');

    Route::post(
        'purchase-requests/{purchaseRequestId}/reject',
        PurchaseRequestRejectionController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.reject');

    Route::post(
        'purchase-requests/{purchaseRequestId}/complete',
        PurchaseRequestCompletionController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.complete');

    Route::post(
        'purchase-requests/{purchaseRequestId}/cancel',
        PurchaseRequestCancellationController::class,
    )
        ->whereNumber('purchaseRequestId')
        ->name('purchase-requests.cancel');
});

require __DIR__.'/settings.php';
