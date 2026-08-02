<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Queries\PendingApprovalReviewsQuery;
use App\Http\Requests\Procurement\ApprovalQueueIndexRequest;
use Inertia\Inertia;
use Inertia\Response;

final class ApprovalQueueController extends Controller
{
    public function __invoke(
        ApprovalQueueIndexRequest $request,
        PendingApprovalReviewsQuery $query,
    ): Response {
        return Inertia::render(
            'approvals/index',
            $query->for($request->actor(), $request->filters()),
        );
    }
}
