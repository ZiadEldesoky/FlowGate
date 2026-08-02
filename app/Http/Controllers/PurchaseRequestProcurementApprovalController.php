<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\ApproveProcurementReview;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use App\Http\Requests\Procurement\ApprovePurchaseRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestProcurementApprovalController extends Controller
{
    public function __invoke(
        ApprovePurchaseRequestRequest $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        ApproveProcurementReview $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('approveProcurementReview', $purchaseRequest);

        $action->handle(
            $purchaseRequest,
            $request->actor(),
            $request->comment(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Procurement review approved.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
