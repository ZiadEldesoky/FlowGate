<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Actions\UpdateUserOrganizationAssignment;
use App\Domain\Organization\Queries\FindOrganizationUserQuery;
use App\Domain\Organization\Queries\OrganizationUsersIndexQuery;
use App\Http\Requests\Organization\OrganizationUserIndexRequest;
use App\Http\Requests\Organization\UpdateUserOrganizationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class OrganizationUserAdministrationController extends Controller
{
    public function index(
        OrganizationUserIndexRequest $request,
        OrganizationUsersIndexQuery $query,
    ): Response {
        return Inertia::render(
            'administration/users/index',
            $query->for($request->filters()),
        );
    }

    public function update(
        UpdateUserOrganizationRequest $request,
        string $userId,
        FindOrganizationUserQuery $find,
        UpdateUserOrganizationAssignment $action,
    ): RedirectResponse {
        $subject = $find->byId((int) $userId);

        Gate::authorize('update', $subject);

        $action->handle(
            $subject,
            $request->actor(),
            $request->role(),
            $request->departmentId(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('User organization assignment updated.'),
        ]);

        return back();
    }
}
