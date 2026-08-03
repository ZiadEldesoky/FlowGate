<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\OrganizationActivityAction;
use App\Domain\Organization\Enums\OrganizationSubjectType;
use App\Domain\Organization\Enums\UserRole;
use App\Models\Department;
use App\Models\OrganizationActivityLog;
use App\Models\PurchaseRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function organizationAdministrator(): User
{
    return User::factory()->create([
        'role' => UserRole::Administrator,
    ]);
}

it('exposes organization administration only to administrators', function (): void {
    $administrator = organizationAdministrator();
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);

    $this
        ->actingAs($administrator)
        ->get(route('administration.departments.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('administration/departments/index')
            ->where('auth.can.manageOrganization', true)
        );

    $this
        ->actingAs($requester)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('auth.can.manageOrganization', false)
        );

    $this
        ->actingAs($requester)
        ->get(route('administration.departments.index'))
        ->assertForbidden();

    $this
        ->actingAs($requester)
        ->post(route('administration.departments.store'), [
            'name' => 'Finance',
            'code' => 'FIN',
        ])
        ->assertForbidden();

    $this
        ->actingAs($requester)
        ->put(route('administration.departments.update', [
            'departmentId' => $department->id,
        ]), [
            'name' => 'Unauthorized update',
            'code' => 'NOPE',
            'manager_id' => null,
        ])
        ->assertForbidden();

    $this
        ->actingAs($requester)
        ->put(route('administration.users.update', [
            'userId' => $requester->id,
        ]), [
            'role' => UserRole::Administrator->value,
            'department_id' => $department->id,
        ])
        ->assertForbidden();

    expect($department->refresh()->name)->not->toBe('Unauthorized update')
        ->and($requester->refresh()->role)->toBe(UserRole::Requester);
});

it('creates a normalized department and audit entry atomically', function (): void {
    $administrator = organizationAdministrator();

    $this
        ->actingAs($administrator)
        ->post(route('administration.departments.store'), [
            'name' => '  Finance Operations  ',
            'code' => ' fin_ops ',
        ])
        ->assertRedirect(route('administration.departments.index'))
        ->assertSessionHasNoErrors();

    $department = Department::query()->sole();
    $activity = OrganizationActivityLog::query()->sole();

    expect($department->name)->toBe('Finance Operations')
        ->and($department->code)->toBe('FIN_OPS')
        ->and($department->manager_id)->toBeNull()
        ->and($activity->actor_id)->toBe($administrator->id)
        ->and($activity->action)
        ->toBe(OrganizationActivityAction::DepartmentCreated)
        ->and($activity->subject_type)
        ->toBe(OrganizationSubjectType::Department)
        ->and($activity->subject_id)->toBe($department->id)
        ->and($activity->changes)->toEqual([
            [
                'field' => 'name',
                'from' => null,
                'to' => 'Finance Operations',
            ],
            [
                'field' => 'code',
                'from' => null,
                'to' => 'FIN_OPS',
            ],
        ]);
});

it('lists departments with server filters counts and manager candidates', function (): void {
    $administrator = organizationAdministrator();
    $finance = Department::factory()->create([
        'name' => 'Finance',
        'code' => 'FIN',
    ]);
    Department::factory()->create([
        'name' => 'Operations',
        'code' => 'OPS',
    ]);
    $manager = User::factory()->create([
        'name' => 'Finance Manager',
        'email' => 'finance-manager@example.com',
        'department_id' => $finance->id,
        'role' => UserRole::Manager,
    ]);
    $requester = User::factory()->create([
        'department_id' => $finance->id,
        'role' => UserRole::Requester,
    ]);
    $finance->update(['manager_id' => $manager->id]);
    PurchaseRequest::factory()->create([
        'department_id' => $finance->id,
        'requester_id' => $requester->id,
    ]);

    $this
        ->actingAs($administrator)
        ->get(route('administration.departments.index', [
            'search' => 'fin',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('administration/departments/index')
            ->has('departments.data', 1)
            ->where('departments.data.0.id', $finance->id)
            ->where('departments.data.0.manager.id', $manager->id)
            ->where('departments.data.0.usersCount', 2)
            ->where('departments.data.0.purchaseRequestsCount', 1)
            ->has('departments.data.0.managerCandidates', 1)
            ->where(
                'departments.data.0.managerCandidates.0.id',
                $manager->id,
            )
            ->where('filters.search', 'fin')
        );
});

it('assigns only an eligible manager and audits the department update', function (): void {
    $administrator = organizationAdministrator();
    $department = Department::factory()->create([
        'name' => 'Operations',
        'code' => 'OPS',
    ]);
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $otherDepartment = Department::factory()->create();
    $otherManager = User::factory()->create([
        'department_id' => $otherDepartment->id,
        'role' => UserRole::Manager,
    ]);

    $this
        ->actingAs($administrator)
        ->put(route('administration.departments.update', [
            'departmentId' => $department->id,
        ]), [
            'name' => ' Operations ',
            'code' => ' ops ',
            'manager_id' => $manager->id,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($department->refresh()->manager_id)->toBe($manager->id)
        ->and(OrganizationActivityLog::query()->count())->toBe(1)
        ->and(OrganizationActivityLog::query()->sole()->action)
        ->toBe(OrganizationActivityAction::DepartmentUpdated);

    $this
        ->actingAs($administrator)
        ->put(route('administration.departments.update', [
            'departmentId' => $department->id,
        ]), [
            'name' => 'Operations',
            'code' => 'OPS',
            'manager_id' => $otherManager->id,
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('manager_id');

    expect($department->refresh()->manager_id)->toBe($manager->id)
        ->and(OrganizationActivityLog::query()->count())->toBe(1);
});

it('updates a user organization assignment and records its changes', function (): void {
    $administrator = organizationAdministrator();
    $department = Department::factory()->create([
        'name' => 'Operations',
        'code' => 'OPS',
    ]);
    $subject = User::factory()->create([
        'department_id' => null,
        'role' => UserRole::Requester,
    ]);

    $this
        ->actingAs($administrator)
        ->put(route('administration.users.update', [
            'userId' => $subject->id,
        ]), [
            'role' => UserRole::Manager->value,
            'department_id' => $department->id,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $subject->refresh();
    $activity = OrganizationActivityLog::query()->sole();

    expect($subject->role)->toBe(UserRole::Manager)
        ->and($subject->department_id)->toBe($department->id)
        ->and($activity->action)
        ->toBe(OrganizationActivityAction::UserAssignmentUpdated)
        ->and($activity->changes)->toEqual([
            [
                'field' => 'role',
                'from' => UserRole::Requester->value,
                'to' => UserRole::Manager->value,
            ],
            [
                'field' => 'department',
                'from' => null,
                'to' => 'Operations',
            ],
        ]);
});

it('does not demote the final administrator', function (): void {
    $administrator = organizationAdministrator();

    $this
        ->actingAs($administrator)
        ->put(route('administration.users.update', [
            'userId' => $administrator->id,
        ]), [
            'role' => UserRole::Procurement->value,
            'department_id' => null,
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('role');

    expect($administrator->refresh()->role)
        ->toBe(UserRole::Administrator)
        ->and(OrganizationActivityLog::query()->count())->toBe(0);
});

it('requires a manager responsibility to be reassigned before membership changes', function (): void {
    $administrator = organizationAdministrator();
    $department = Department::factory()->create();
    $otherDepartment = Department::factory()->create();
    $manager = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);

    $this
        ->actingAs($administrator)
        ->put(route('administration.users.update', [
            'userId' => $manager->id,
        ]), [
            'role' => UserRole::Requester->value,
            'department_id' => $department->id,
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('role');

    $this
        ->actingAs($administrator)
        ->put(route('administration.users.update', [
            'userId' => $manager->id,
        ]), [
            'role' => UserRole::Manager->value,
            'department_id' => $otherDepartment->id,
        ])
        ->assertRedirect()
        ->assertSessionHasErrors('role');

    expect($manager->refresh()->role)->toBe(UserRole::Manager)
        ->and($manager->department_id)->toBe($department->id)
        ->and(OrganizationActivityLog::query()->count())->toBe(0);
});

it('lists users with server-owned role and department filters', function (): void {
    $administrator = organizationAdministrator();
    $department = Department::factory()->create([
        'name' => 'Operations',
        'code' => 'OPS',
    ]);
    $manager = User::factory()->create([
        'name' => 'Nour Manager',
        'email' => 'nour.manager@example.com',
        'department_id' => $department->id,
        'role' => UserRole::Manager,
    ]);
    $department->update(['manager_id' => $manager->id]);
    User::factory()->create([
        'name' => 'Other Requester',
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);

    $this
        ->actingAs($administrator)
        ->get(route('administration.users.index', [
            'search' => 'nour',
            'role' => UserRole::Manager->value,
            'department_id' => $department->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('administration/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $manager->id)
            ->where(
                'users.data.0.role',
                UserRole::Manager->value,
            )
            ->has('users.data.0.managedDepartments', 1)
            ->where('filters.search', 'nour')
            ->where('filters.role', UserRole::Manager->value)
            ->where('filters.departmentId', $department->id)
            ->has('departmentOptions', 1)
            ->has('roleOptions', 4)
        );
});

it('shows the administrator an immutable organization activity feed', function (): void {
    $administrator = organizationAdministrator();

    $this
        ->actingAs($administrator)
        ->post(route('administration.departments.store'), [
            'name' => 'Finance',
            'code' => 'FIN',
        ])
        ->assertRedirect();

    $this
        ->actingAs($administrator)
        ->get(route('administration.activity.index', [
            'search' => 'finance',
            'action' => OrganizationActivityAction::DepartmentCreated->value,
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('administration/activity/index')
            ->has('activities.data', 1)
            ->where(
                'activities.data.0.action',
                OrganizationActivityAction::DepartmentCreated->value,
            )
            ->where('activities.data.0.actor.id', $administrator->id)
            ->where(
                'activities.data.0.subjectType',
                OrganizationSubjectType::Department->value,
            )
            ->where('filters.search', 'finance')
            ->where(
                'filters.action',
                OrganizationActivityAction::DepartmentCreated->value,
            )
            ->has('actionOptions', 3)
        );

    $this
        ->actingAs(User::factory()->create())
        ->get(route('administration.activity.index'))
        ->assertForbidden();
});
