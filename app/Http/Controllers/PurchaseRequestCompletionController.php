<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\CompletePurchaseRequest;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

final class PurchaseRequestCompletionController extends Controller
{
    public function __invoke(
        Request $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        CompletePurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('complete', $purchaseRequest);

        $action->handle($purchaseRequest, $request->user());

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request completed.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
