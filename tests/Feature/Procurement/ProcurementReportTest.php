<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    CarbonImmutable::setTestNow('2026-08-02 12:00:00');
    $this->withoutVite();
});

afterEach(function (): void {
    CarbonImmutable::setTestNow();
});

it('enforces the report policy across unauthenticated and non-reporting roles', function (): void {
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $unassignedManager = User::factory()->create([
        'role' => UserRole::Manager,
    ]);
    $administrator = User::factory()->create([
        'role' => UserRole::Administrator,
    ]);

    $this
        ->get(route('reports.procurement.index'))
        ->assertRedirect(route('login'));

    $this
        ->actingAs($requester)
        ->get(route('reports.procurement.index'))
        ->assertForbidden();

    $this
        ->actingAs($unassignedManager)
        ->get(route('reports.procurement.index'))
        ->assertForbidden();

    $this
        ->actingAs($administrator)
        ->get(route('reports.procurement.index'))
        ->assertOk();
});

it('scopes manager reporting metrics and options to managed departments', function (): void {
    $managedDepartment = Department::factory()->create([
        'name' => 'Operations',
        'code' => 'OPS',
    ]);
    $otherDepartment = Department::factory()->create([
        'name' => 'Finance',
        'code' => 'FIN',
    ]);
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

    PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'status' => PurchaseRequestStatus::Completed,
        'total_amount' => '100.00',
        'completed_at' => now()->subDays(5),
        'created_at' => now()->subDays(10),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'status' => PurchaseRequestStatus::PendingManagerReview,
        'total_amount' => '50.00',
        'created_at' => now()->subDays(2),
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $otherDepartment->id,
        'status' => PurchaseRequestStatus::Completed,
        'total_amount' => '900.00',
        'completed_at' => now()->subDay(),
        'created_at' => now()->subDay(),
    ]);

    $this
        ->actingAs($manager)
        ->get(route('reports.procurement.index'))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('reports/procurement', false)
            ->where('scope', 'managed_departments')
            ->where('filters.from', '2026-05-05')
            ->where('filters.to', '2026-08-02')
            ->where('summary.requestCount', 2)
            ->where('summary.totalAmount', '150.00')
            ->where('summary.averageAmount', '75.00')
            ->where('summary.completedCount', 1)
            ->where('summary.completionRate', '50.00')
            ->where('summary.currency', 'EGP')
            ->has('filterOptions.departments', 1)
            ->where(
                'filterOptions.departments.0.id',
                $managedDepartment->id,
            )
            ->has('departmentBreakdown', 1)
            ->has('purchaseRequests.data', 2)
        );
});

it('applies report date status and department filters for procurement', function (): void {
    $operations = Department::factory()->create();
    $finance = Department::factory()->create();
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $matching = PurchaseRequest::factory()->create([
        'department_id' => $operations->id,
        'status' => PurchaseRequestStatus::Completed,
        'total_amount' => '300.00',
        'created_at' => '2026-07-15 09:00:00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $operations->id,
        'status' => PurchaseRequestStatus::Approved,
        'created_at' => '2026-07-16 09:00:00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $finance->id,
        'status' => PurchaseRequestStatus::Completed,
        'created_at' => '2026-07-17 09:00:00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $operations->id,
        'status' => PurchaseRequestStatus::Completed,
        'created_at' => '2026-06-20 09:00:00',
    ]);

    $this
        ->actingAs($procurement)
        ->get(route('reports.procurement.index', [
            'from' => '2026-07-01',
            'to' => '2026-07-31',
            'status' => PurchaseRequestStatus::Completed->value,
            'department_id' => $operations->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('scope', 'all_requests')
            ->where('filters.from', '2026-07-01')
            ->where('filters.to', '2026-07-31')
            ->where('filters.status', 'completed')
            ->where('filters.departmentId', $operations->id)
            ->where('summary.requestCount', 1)
            ->where('summary.totalAmount', '300.00')
            ->where('purchaseRequests.data.0.id', $matching->id)
            ->has('filterOptions.departments', 2)
        );
});

it('rejects invalid or excessive report periods', function (): void {
    $procurement = User::factory()->create([
        'role' => UserRole::Procurement,
    ]);

    $this
        ->actingAs($procurement)
        ->get(route('reports.procurement.index', [
            'from' => '2025-08-01',
            'to' => '2026-08-02',
        ]))
        ->assertSessionHasErrors('to');

    $this
        ->actingAs($procurement)
        ->get(route('reports.procurement.index', [
            'from' => '2026-08-01',
            'to' => '2026-08-03',
        ]))
        ->assertSessionHasErrors('to');
});

it('streams the same manager-scoped report filters as utf-8 csv', function (): void {
    $managedDepartment = Department::factory()->create();
    $otherDepartment = Department::factory()->create();
    $manager = User::factory()->create([
        'role' => UserRole::Manager,
    ]);
    $managedDepartment->update(['manager_id' => $manager->id]);

    $visible = PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'reference' => 'PR-VISIBLE',
        'title' => '=HYPERLINK("https://example.test")',
        'status' => PurchaseRequestStatus::Completed,
        'created_at' => '2026-07-10 09:00:00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $managedDepartment->id,
        'reference' => 'PR-WRONG-STATUS',
        'status' => PurchaseRequestStatus::Approved,
        'created_at' => '2026-07-11 09:00:00',
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $otherDepartment->id,
        'reference' => 'PR-OTHER-DEPARTMENT',
        'status' => PurchaseRequestStatus::Completed,
        'created_at' => '2026-07-12 09:00:00',
    ]);

    $response = $this
        ->actingAs($manager)
        ->get(route('reports.procurement.export', [
            'from' => '2026-07-01',
            'to' => '2026-07-31',
            'status' => PurchaseRequestStatus::Completed->value,
        ]));

    $response
        ->assertOk()
        ->assertDownload(
            'procurement-report-2026-07-01-to-2026-07-31.csv',
        );

    $content = $response->streamedContent();

    expect($content)
        ->toStartWith("\xEF\xBB\xBF")
        ->toContain($visible->reference)
        ->toContain('\'=HYPERLINK')
        ->not->toContain('PR-WRONG-STATUS')
        ->not->toContain('PR-OTHER-DEPARTMENT');
});

it('shares report navigation permission from the purchase request policy', function (): void {
    $department = Department::factory()->create();
    $manager = User::factory()->create([
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'role' => UserRole::Requester,
    ]);
    $department->update(['manager_id' => $manager->id]);

    $this
        ->actingAs($manager)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('auth.can.viewProcurementReports', true)
        );

    $this
        ->actingAs($requester)
        ->get(route('dashboard'))
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->where('auth.can.viewProcurementReports', false)
        );
});
