<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

it('redirects guests from the dashboard to login', function (): void {
    $this
        ->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

it('shows a requester a server-owned dashboard for their requests only', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $otherRequester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);

    $draft = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
        'total_amount' => '100.00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Completed,
        'total_amount' => '200.00',
        'completed_at' => now(),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $otherRequester->id,
        'status' => PurchaseRequestStatus::Completed,
        'total_amount' => '900.00',
        'completed_at' => now(),
    ]);

    $this
        ->actingAs($requester)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('dashboard')
            ->where('scope', 'own_requests')
            ->where('summary.totalRequests', 2)
            ->where('summary.openRequests', 1)
            ->where('summary.actionRequiredCount', 1)
            ->where('summary.completedRequests', 1)
            ->where('summary.committedAmount', '200.00')
            ->where('summary.currency', 'EGP')
            ->where('attentionRequests.0.id', $draft->id)
            ->has('recentRequests', 2)
        );
});

it('scopes a manager dashboard to departments they manage', function (): void {
    $managedDepartment = Department::factory()->create();
    $otherDepartment = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $managedDepartment->id,
        'role' => UserRole::Manager,
    ]);
    $otherManager = User::factory()->create([
        'department_id' => $otherDepartment->id,
        'role' => UserRole::Manager,
    ]);
    $managedDepartment->update(['manager_id' => $manager->id]);
    $otherDepartment->update(['manager_id' => $otherManager->id]);

    $review = PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'total_amount' => '250.00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'status' => PurchaseRequestStatus::Approved,
        'total_amount' => '400.00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $otherDepartment->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'total_amount' => '800.00',
    ]);

    $this
        ->actingAs($manager)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('scope', 'managed_departments')
            ->where('summary.totalRequests', 2)
            ->where('summary.openRequests', 2)
            ->where('summary.actionRequiredCount', 1)
            ->where('summary.completedRequests', 0)
            ->where('summary.committedAmount', '400.00')
            ->where('attentionRequests.0.id', $review->id)
            ->has('recentRequests', 2)
        );
});

it('shows procurement an organization-wide action queue', function (): void {
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);
    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::Approved,
    ]);
    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($procurement)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('scope', 'all_requests')
            ->where('summary.totalRequests', 3)
            ->where('summary.actionRequiredCount', 2)
            ->has('attentionRequests', 2)
        );
});
