<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\SubmitPurchaseRequest;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestSubmissionController extends Controller
{
    public function __invoke(
        Request $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        SubmitPurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('submit', $purchaseRequest);

        $action->handle($purchaseRequest, $request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request submitted for manager review.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
