<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Queries\AllowedPurchaseRequestActionsQuery;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;

it('lets procurement complete an approved request atomically', function (): void {
    $purchaseRequest = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::Approved,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $this
        ->actingAs($procurement)
        ->post(route('purchase-requests.complete', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Completed)
        ->and($purchaseRequest->completed_at)->not->toBeNull()
        ->and($purchaseRequest->activityLogs()->count())->toBe(1);

    $this->assertDatabaseHas('activity_logs', [
        'purchase_request_id' => $purchaseRequest->id,
        'actor_id' => $procurement->id,
        'action' => PurchaseRequestAction::Complete->value,
        'from_status' => PurchaseRequestStatus::Approved->value,
        'to_status' => PurchaseRequestStatus::Completed->value,
    ]);
});

it('rejects completion by a requester without mutating the request', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Approved,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.complete', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertForbidden();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Approved)
        ->and($purchaseRequest->completed_at)->toBeNull()
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});

it('lets the requester cancel an active request with a normalized reason', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.cancel', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => '  Requirements changed.  ',
        ])
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    $activity = $purchaseRequest->activityLogs()->first();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Cancelled)
        ->and($purchaseRequest->cancelled_at)->not->toBeNull()
        ->and($activity?->action)->toBe(PurchaseRequestAction::Cancel)
        ->and($activity?->metadata)->toBe([
            'comment' => 'Requirements changed.',
        ]);
});

it('allows an empty cancellation reason and stores no empty metadata', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.cancel', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => '   ',
        ])
        ->assertRedirect();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Cancelled)
        ->and($purchaseRequest->activityLogs()->first()?->metadata)->toBeNull();
});

it('does not let another user cancel the request', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $otherUser = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($otherUser)
        ->post(route('purchase-requests.cancel', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertForbidden();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Draft)
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});

it('validates cancellation comments before writing transition data', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.cancel', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => str_repeat('a', 2001),
        ])
        ->assertSessionHasErrors('comment');

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Draft)
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});

it('exposes completion and cancellation only through server allowed actions', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $draft = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);
    $approved = PurchaseRequest::factory()->create([
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Approved,
    ]);
    $query = app(AllowedPurchaseRequestActionsQuery::class);

    expect($query->for($requester, $draft))->toBe([
        PurchaseRequestAction::Submit,
        PurchaseRequestAction::Cancel,
    ])->and($query->for($procurement, $approved))->toBe([
        PurchaseRequestAction::Complete,
    ])->and($query->for($requester, $approved))->toBe([]);
});
