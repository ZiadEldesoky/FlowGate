<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;

it('lets the designated department manager approve manager review', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($manager)
        ->post(route('purchase-requests.approve-manager-review', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => '  Budget confirmed.  ',
        ])
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::PendingProcurementReview)
        ->and($purchaseRequest->approvals()->count())->toBe(1)
        ->and($purchaseRequest->activityLogs()->count())->toBe(1);

    $this->assertDatabaseHas('approvals', [
        'purchase_request_id' => $purchaseRequest->id,
        'actor_id' => $manager->id,
        'stage' => ApprovalStage::ManagerReview->value,
        'decision' => ApprovalDecision::Approved->value,
        'comment' => 'Budget confirmed.',
    ]);
    $this->assertDatabaseHas('activity_logs', [
        'purchase_request_id' => $purchaseRequest->id,
        'actor_id' => $manager->id,
        'action' => PurchaseRequestAction::ApproveManagerReview->value,
        'from_status' => PurchaseRequestStatus::PendingManagerReview->value,
        'to_status' => PurchaseRequestStatus::PendingProcurementReview->value,
    ]);
});

it('does not let another manager in the department approve the request', function (): void {
    $department = Department::factory()->create();
    $designatedManager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $otherManager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $designatedManager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($otherManager)
        ->post(route('purchase-requests.approve-manager-review', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertForbidden();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::PendingManagerReview)
        ->and($purchaseRequest->approvals()->count())->toBe(0)
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});

it('lets procurement approve procurement review', function (): void {
    $purchaseRequest = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $this
        ->actingAs($procurement)
        ->post(route('purchase-requests.approve-procurement-review', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => 'Supplier availability verified.',
        ])
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Approved);

    $this->assertDatabaseHas('approvals', [
        'purchase_request_id' => $purchaseRequest->id,
        'actor_id' => $procurement->id,
        'stage' => ApprovalStage::ProcurementReview->value,
        'decision' => ApprovalDecision::Approved->value,
        'comment' => 'Supplier availability verified.',
    ]);
});

it('rechecks the workflow state before every approval endpoint', function (): void {
    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($manager)
        ->post(route('purchase-requests.approve-manager-review', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertForbidden();

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Draft)
        ->and($purchaseRequest->approvals()->count())->toBe(0);
});

it('requires a localized rejection reason without writing transition data', function (): void {
    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->withCookie('locale', 'ar')
        ->actingAs($manager)
        ->post(route('purchase-requests.reject', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => '   ',
        ])
        ->assertSessionHasErrors([
            'comment' => 'حقل سبب الرفض مطلوب.',
        ]);

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::PendingManagerReview)
        ->and($purchaseRequest->approvals()->count())->toBe(0)
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});

it('records procurement rejection at the active review stage', function (): void {
    $purchaseRequest = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $this
        ->actingAs($procurement)
        ->post(route('purchase-requests.reject', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => 'Quoted price exceeds the approved budget.',
        ])
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::Rejected)
        ->and($purchaseRequest->rejected_at)->not->toBeNull();

    $this->assertDatabaseHas('approvals', [
        'purchase_request_id' => $purchaseRequest->id,
        'actor_id' => $procurement->id,
        'stage' => ApprovalStage::ProcurementReview->value,
        'decision' => ApprovalDecision::Rejected->value,
        'comment' => 'Quoted price exceeds the approved budget.',
    ]);
});

it('validates approval comments before mutating the request', function (): void {
    $purchaseRequest = PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $this
        ->actingAs($procurement)
        ->post(route('purchase-requests.approve-procurement-review', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), [
            'comment' => str_repeat('a', 2001),
        ])
        ->assertSessionHasErrors('comment');

    expect($purchaseRequest->refresh()->status)
        ->toBe(PurchaseRequestStatus::PendingProcurementReview)
        ->and($purchaseRequest->approvals()->count())->toBe(0);
});
