<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Organization\Queries\OrganizationActivityIndexQuery;
use App\Http\Requests\Organization\OrganizationActivityIndexRequest;
use Inertia\Inertia;
use Inertia\Response;

final class OrganizationActivityController extends Controller
{
    public function __invoke(
        OrganizationActivityIndexRequest $request,
        OrganizationActivityIndexQuery $query,
    ): Response {
        return Inertia::render(
            'administration/activity/index',
            $query->for($request->filters()),
        );
    }
}
