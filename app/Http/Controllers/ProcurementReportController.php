<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Queries\ProcurementReportQuery;
use App\Http\Requests\Procurement\ProcurementReportRequest;
use Inertia\Inertia;
use Inertia\Response;

final class ProcurementReportController extends Controller
{
    public function __invoke(
        ProcurementReportRequest $request,
        ProcurementReportQuery $query,
    ): Response {
        return Inertia::render(
            'reports/procurement',
            $query->for($request->actor(), $request->filters()),
        );
    }
}
