<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Actions\ApproveManagerReview;
use App\Domain\Procurement\Actions\ApproveProcurementReview;
use App\Domain\Procurement\Actions\CompletePurchaseRequest;
use App\Domain\Procurement\Actions\RejectPurchaseRequest;
use App\Domain\Procurement\Actions\SubmitPurchaseRequest;
use App\Domain\Procurement\Enums\ApprovalDecision;
use App\Domain\Procurement\Enums\ApprovalStage;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Events\PurchaseRequestTransitioned;
use App\Domain\Procurement\Exceptions\InvalidPurchaseRequestTransition;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Support\Facades\Event;

it('persists the full approval path atomically', function (): void {
    Event::fake([PurchaseRequestTransitioned::class]);

    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);
    $department->update(['manager_id' => $manager->id]);

    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $purchaseRequest = app(SubmitPurchaseRequest::class)
        ->handle($purchaseRequest, $requester);
    $purchaseRequest = app(ApproveManagerReview::class)
        ->handle($purchaseRequest, $manager, 'Budget confirmed.');
    $purchaseRequest = app(ApproveProcurementReview::class)
        ->handle($purchaseRequest, $procurement, 'Supplier check complete.');
    $purchaseRequest = app(CompletePurchaseRequest::class)
        ->handle($purchaseRequest, $procurement);

    expect($purchaseRequest->status)->toBe(PurchaseRequestStatus::Completed)
        ->and($purchaseRequest->submitted_at)->not->toBeNull()
        ->and($purchaseRequest->completed_at)->not->toBeNull()
        ->and($purchaseRequest->approvals)->toHaveCount(2)
        ->and($purchaseRequest->approvals[0]->stage)->toBe(ApprovalStage::ManagerReview)
        ->and($purchaseRequest->approvals[0]->decision)->toBe(ApprovalDecision::Approved)
        ->and($purchaseRequest->approvals[1]->stage)->toBe(ApprovalStage::ProcurementReview)
        ->and($purchaseRequest->activityLogs)->toHaveCount(4);

    Event::assertDispatchedTimes(PurchaseRequestTransitioned::class, 4);
});

it('records a rejection and its reason in the same transaction', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $purchaseRequest = app(RejectPurchaseRequest::class)
        ->handle($purchaseRequest, $manager, '  Missing cost breakdown.  ');

    expect($purchaseRequest->status)->toBe(PurchaseRequestStatus::Rejected)
        ->and($purchaseRequest->rejected_at)->not->toBeNull()
        ->and($purchaseRequest->approvals)->toHaveCount(1)
        ->and($purchaseRequest->approvals->first()?->stage)
        ->toBe(ApprovalStage::ManagerReview)
        ->and($purchaseRequest->approvals->first()?->decision)
        ->toBe(ApprovalDecision::Rejected)
        ->and($purchaseRequest->approvals->first()?->comment)
        ->toBe('Missing cost breakdown.')
        ->and($purchaseRequest->activityLogs)->toHaveCount(1)
        ->and($purchaseRequest->activityLogs->first()?->action)
        ->toBe(PurchaseRequestAction::Reject);
});

it('does not write audit records for an invalid transition', function (): void {
    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $purchaseRequest = PurchaseRequest::factory()
        ->status(PurchaseRequestStatus::Draft)
        ->create(['department_id' => $department->id]);

    expect(fn (): PurchaseRequest => app(ApproveManagerReview::class)
        ->handle($purchaseRequest, $manager))
        ->toThrow(InvalidPurchaseRequestTransition::class);

    expect($purchaseRequest->refresh()->status)->toBe(PurchaseRequestStatus::Draft)
        ->and($purchaseRequest->approvals()->count())->toBe(0)
        ->and($purchaseRequest->activityLogs()->count())->toBe(0);
});
