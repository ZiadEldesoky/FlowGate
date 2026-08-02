<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\CancelPurchaseRequest;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use App\Http\Requests\Procurement\CancelPurchaseRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestCancellationController extends Controller
{
    public function __invoke(
        CancelPurchaseRequestRequest $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        CancelPurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('cancel', $purchaseRequest);

        $action->handle(
            $purchaseRequest,
            $request->actor(),
            $request->comment(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request cancelled.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
