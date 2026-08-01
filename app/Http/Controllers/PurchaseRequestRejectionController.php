<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\RejectPurchaseRequest;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use App\Http\Requests\Procurement\RejectPurchaseRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestRejectionController extends Controller
{
    public function __invoke(
        RejectPurchaseRequestRequest $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        RejectPurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('reject', $purchaseRequest);

        $action->handle(
            $purchaseRequest,
            $request->actor(),
            $request->comment(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request rejected.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
