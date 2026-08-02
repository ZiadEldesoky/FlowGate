<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Actions\CreateDepartment;
use App\Domain\Organization\Actions\UpdateDepartment;
use App\Domain\Organization\Queries\DepartmentsIndexQuery;
use App\Domain\Organization\Queries\FindDepartmentQuery;
use App\Http\Requests\Organization\CreateDepartmentRequest;
use App\Http\Requests\Organization\DepartmentIndexRequest;
use App\Http\Requests\Organization\UpdateDepartmentRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class DepartmentAdministrationController extends Controller
{
    public function index(
        DepartmentIndexRequest $request,
        DepartmentsIndexQuery $query,
    ): Response {
        return Inertia::render(
            'administration/departments/index',
            $query->for($request->filters()),
        );
    }

    public function store(
        CreateDepartmentRequest $request,
        CreateDepartment $action,
    ): RedirectResponse {
        $action->handle($request->actor(), $request->payload());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Department created.'),
        ]);

        return to_route('administration.departments.index');
    }

    public function update(
        UpdateDepartmentRequest $request,
        string $departmentId,
        FindDepartmentQuery $find,
        UpdateDepartment $action,
    ): RedirectResponse {
        $department = $find->byId((int) $departmentId);

        Gate::authorize('update', $department);

        $action->handle(
            $department,
            $request->actor(),
            $request->payload(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Department updated.'),
        ]);

        return back();
    }
}
