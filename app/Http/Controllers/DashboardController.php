<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Queries\DashboardQuery;
use App\Http\Requests\Procurement\DashboardRequest;
use Inertia\Inertia;
use Inertia\Response;

final class DashboardController extends Controller
{
    public function __invoke(
        DashboardRequest $request,
        DashboardQuery $query,
    ): Response {
        return Inertia::render('dashboard', $query->for($request->actor()));
    }
}
