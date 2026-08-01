<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Domain\Procurement\Queries\AllowedPurchaseRequestActionsQuery;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;

it('returns only workflow actions authorized by the policy', function (): void {
    $department = Department::factory()->create();
    $otherDepartment = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $otherManager = User::factory()->create([
        'department_id' => $otherDepartment->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    $otherDepartment->update(['manager_id' => $otherManager->id]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $query = app(AllowedPurchaseRequestActionsQuery::class);

    expect($query->for($requester, $purchaseRequest))
        ->toBe([PurchaseRequestAction::Cancel])
        ->and($query->for($manager, $purchaseRequest))
        ->toBe([
            PurchaseRequestAction::ApproveManagerReview,
            PurchaseRequestAction::Reject,
        ])
        ->and($query->for($otherManager, $purchaseRequest))
        ->toBe([]);
});
