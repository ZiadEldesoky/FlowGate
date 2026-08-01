<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

it('shows a designated manager only their pending manager reviews', function (): void {
    $department = Department::factory()->create(['name' => 'Operations']);
    $otherDepartment = Department::factory()->create(['name' => 'Finance']);
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

    $visible = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'title' => 'Visible manager review',
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'submitted_at' => now()->subDay(),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'title' => 'Already with procurement',
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $otherDepartment->id,
        'title' => 'Other manager review',
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($manager)
        ->get(route('approvals.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('approvals/index', false)
            ->where('stage', 'manager_review')
            ->has('reviews.data', 1)
            ->where('reviews.data.0.id', $visible->id)
            ->where('reviews.data.0.title', 'Visible manager review')
        );
});

it('shows procurement pending procurement reviews across departments', function (): void {
    $firstDepartment = Department::factory()->create();
    $secondDepartment = Department::factory()->create();
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    PurchaseRequest::factory()->create([
        'department_id' => $firstDepartment->id,
        'title' => 'Matching supplier review',
        'status' => PurchaseRequestStatus::PendingProcurementReview,
        'submitted_at' => now()->subDays(2),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $secondDepartment->id,
        'title' => 'Matching equipment review',
        'status' => PurchaseRequestStatus::PendingProcurementReview,
        'submitted_at' => now()->subDay(),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $firstDepartment->id,
        'title' => 'Matching manager review',
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);

    $this
        ->actingAs($procurement)
        ->get(route('approvals.index', ['search' => '  Matching  ']))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('approvals/index', false)
            ->where('stage', 'procurement_review')
            ->where('filters.search', 'Matching')
            ->has('reviews.data', 2)
            ->where('reviews.meta.total', 2)
        );
});

it('allows administrators to use the procurement review queue', function (): void {
    $administrator = User::factory()->create([
        'role' => UserRole::Administrator,
    ]);
    PurchaseRequest::factory()->create([
        'status' => PurchaseRequestStatus::PendingProcurementReview,
    ]);

    $this
        ->actingAs($administrator)
        ->get(route('approvals.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('approvals/index', false)
            ->where('stage', 'procurement_review')
            ->has('reviews.data', 1)
        );
});

it('forbids requesters and non-designated managers from the approval queue', function (): void {
    $department = Department::factory()->create();
    $designatedManager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $otherManager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $department->update(['manager_id' => $designatedManager->id]);

    $this->actingAs($requester)
        ->get(route('approvals.index'))
        ->assertForbidden();

    $this->actingAs($otherManager)
        ->get(route('approvals.index'))
        ->assertForbidden();
});

it('shares approval queue navigation permission from the policy', function (): void {
    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $department->update(['manager_id' => $manager->id]);

    $this
        ->actingAs($manager)
        ->get(route('purchase-requests.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('auth.can.viewApprovalQueue', true)
        );

    $this
        ->actingAs($requester)
        ->get(route('purchase-requests.index'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('auth.can.viewApprovalQueue', false)
        );
});

it('redirects guests away from the approval queue', function (): void {
    $this
        ->get(route('approvals.index'))
        ->assertRedirect(route('login'));
});
