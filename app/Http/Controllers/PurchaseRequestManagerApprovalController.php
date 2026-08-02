<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\ApproveManagerReview;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use App\Http\Requests\Procurement\ApprovePurchaseRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestManagerApprovalController extends Controller
{
    public function __invoke(
        ApprovePurchaseRequestRequest $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        ApproveManagerReview $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('approveManagerReview', $purchaseRequest);

        $action->handle(
            $purchaseRequest,
            $request->actor(),
            $request->comment(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Manager review approved.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
