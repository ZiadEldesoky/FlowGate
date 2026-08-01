<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Domain\Procurement\Actions\CreatePurchaseRequest;
use App\Domain\Procurement\Actions\UpdateDraftPurchaseRequest;
use App\Domain\Procurement\Queries\FindPurchaseRequestQuery;
use App\Domain\Procurement\Queries\PurchaseRequestDetailsQuery;
use App\Domain\Procurement\Queries\PurchaseRequestFormQuery;
use App\Domain\Procurement\Queries\PurchaseRequestsIndexQuery;
use App\Http\Requests\Procurement\PurchaseRequestIndexRequest;
use App\Http\Requests\Procurement\SavePurchaseRequestRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

final class PurchaseRequestController extends Controller
{
    public function index(
        PurchaseRequestIndexRequest $request,
        PurchaseRequestsIndexQuery $query,
    ): Response {
        return Inertia::render(
            'purchase-requests/index',
            $query->for($request->actor(), $request->filters()),
        );
    }

    public function create(
        Request $request,
        PurchaseRequestFormQuery $query,
    ): Response {
        return Inertia::render(
            'purchase-requests/create',
            $query->defaultsFor($request->user()),
        );
    }

    public function store(
        SavePurchaseRequestRequest $request,
        CreatePurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $action->handle(
            $request->actor(),
            $request->payload(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request created.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }

    public function show(
        Request $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        PurchaseRequestDetailsQuery $query,
    ): Response {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('view', $purchaseRequest);

        return Inertia::render(
            'purchase-requests/show',
            $query->for($request->user(), $purchaseRequest),
        );
    }

    public function edit(
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        PurchaseRequestFormQuery $query,
    ): Response {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('update', $purchaseRequest);

        return Inertia::render(
            'purchase-requests/edit',
            $query->forEdit($purchaseRequest),
        );
    }

    public function update(
        SavePurchaseRequestRequest $request,
        string $purchaseRequestId,
        FindPurchaseRequestQuery $find,
        UpdateDraftPurchaseRequest $action,
    ): RedirectResponse {
        $purchaseRequest = $find->byId((int) $purchaseRequestId);

        Gate::authorize('update', $purchaseRequest);

        $purchaseRequest = $action->handle(
            $purchaseRequest,
            $request->payload(),
        );

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Purchase request updated.'),
        ]);

        return to_route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]);
    }
}
