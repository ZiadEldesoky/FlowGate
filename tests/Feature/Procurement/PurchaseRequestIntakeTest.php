<?php

declare(strict_types=1);

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Actions\SubmitPurchaseRequest;
use App\Domain\Procurement\Enums\PurchaseRequestAction;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Inertia\Testing\AssertableInertia;

beforeEach(function (): void {
    $this->withoutVite();
});

/**
 * @return array{
 *     title: string,
 *     justification: string,
 *     needed_by: string,
 *     currency: string,
 *     items: list<array{
 *         description: string,
 *         sku: string|null,
 *         quantity: string,
 *         unit_price: string
 *     }>
 * }
 */
function validPurchaseRequestPayload(): array
{
    return [
        'title' => 'Warehouse packaging supplies',
        'justification' => 'Required for the next outbound order cycle.',
        'needed_by' => now()->addWeeks(2)->toDateString(),
        'currency' => 'egp',
        'items' => [
            [
                'description' => '  Shipping cartons  ',
                'sku' => ' CTN-100 ',
                'quantity' => '2.500',
                'unit_price' => '19.99',
            ],
            [
                'description' => 'Safety labels',
                'sku' => '',
                'quantity' => '3',
                'unit_price' => '10',
            ],
        ],
    ];
}

it('creates a draft with server-calculated item totals', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);

    $response = $this
        ->actingAs($requester)
        ->post(route('purchase-requests.store'), validPurchaseRequestPayload());

    $purchaseRequest = PurchaseRequest::query()->sole();

    $response->assertRedirect(route('purchase-requests.show', [
        'purchaseRequestId' => $purchaseRequest->id,
    ]));

    expect($purchaseRequest->reference)
        ->toMatch('/^PR-\d{4}-\d{6}$/')
        ->and($purchaseRequest->department_id)->toBe($department->id)
        ->and($purchaseRequest->requester_id)->toBe($requester->id)
        ->and($purchaseRequest->status)->toBe(PurchaseRequestStatus::Draft)
        ->and($purchaseRequest->currency)->toBe('EGP')
        ->and($purchaseRequest->total_amount)->toBe('79.98')
        ->and($purchaseRequest->items)->toHaveCount(2)
        ->and($purchaseRequest->items[0]->description)
        ->toBe('Shipping cartons')
        ->and($purchaseRequest->items[0]->sku)->toBe('CTN-100')
        ->and($purchaseRequest->items[0]->line_total)->toBe('49.98')
        ->and($purchaseRequest->items[1]->line_total)->toBe('30.00');
});

it('validates nested items before creating a request', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $payload = validPurchaseRequestPayload();
    $payload['items'][0]['description'] = '';
    $payload['items'][0]['quantity'] = '0';
    $payload['items'][0]['unit_price'] = '-1';

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.store'), $payload)
        ->assertSessionHasErrors([
            'items.0.description',
            'items.0.quantity',
            'items.0.unit_price',
        ]);

    expect(PurchaseRequest::query()->count())->toBe(0);
});

it('forbids creating a request without a department', function (): void {
    $requester = User::factory()->create([
        'department_id' => null,
        'role' => UserRole::Requester,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.store'), validPurchaseRequestPayload())
        ->assertForbidden();
});

it('updates a draft and replaces its items atomically', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.store'), validPurchaseRequestPayload());

    $purchaseRequest = PurchaseRequest::query()->sole();
    $payload = validPurchaseRequestPayload();
    $payload['title'] = 'Updated packaging request';
    $payload['items'] = [
        [
            'description' => 'Replacement item',
            'sku' => null,
            'quantity' => '1.250',
            'unit_price' => '8.40',
        ],
    ];

    $this
        ->actingAs($requester)
        ->put(route('purchase-requests.update', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), $payload)
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    $purchaseRequest->refresh();

    expect($purchaseRequest->title)->toBe('Updated packaging request')
        ->and($purchaseRequest->total_amount)->toBe('10.50')
        ->and($purchaseRequest->items)->toHaveCount(1)
        ->and($purchaseRequest->items->sole()->position)->toBe(1)
        ->and($purchaseRequest->items->sole()->line_total)->toBe('10.50');
});

it('allows only the owner to edit a draft', function (): void {
    $department = Department::factory()->create();
    $owner = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $otherRequester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $owner->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($otherRequester)
        ->put(route('purchase-requests.update', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), validPurchaseRequestPayload())
        ->assertForbidden();
});

it('submits an owned draft through the workflow action', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($requester)
        ->post(route('purchase-requests.submit', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertRedirect(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]));

    $purchaseRequest->refresh();

    expect($purchaseRequest->status)
        ->toBe(PurchaseRequestStatus::PendingManagerReview)
        ->and($purchaseRequest->submitted_at)->not->toBeNull()
        ->and($purchaseRequest->activityLogs)->toHaveCount(1)
        ->and($purchaseRequest->activityLogs->sole()->action)
        ->toBe(PurchaseRequestAction::Submit);
});

it('renders details from the server with allowed actions', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);
    $purchaseRequest->items()->create([
        'description' => 'Demo line',
        'sku' => null,
        'quantity' => '2.000',
        'unit_price' => '4.50',
        'line_total' => '9.00',
        'position' => 1,
    ]);

    $this
        ->actingAs($requester)
        ->get(route('purchase-requests.show', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('purchase-requests/show', false)
            ->where('purchaseRequest.id', $purchaseRequest->id)
            ->where('purchaseRequest.items.0.lineTotal', '9.00')
            ->where('allowedActions', ['submit', 'cancel'])
            ->where('can.update', true)
        );
});

it('scopes the request index and applies server filters', function (): void {
    $department = Department::factory()->create();
    $otherDepartment = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $otherRequester = User::factory()->create([
        'department_id' => $otherDepartment->id,
        'role' => UserRole::Requester,
    ]);

    PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'title' => 'Matching warehouse request',
        'status' => PurchaseRequestStatus::Draft,
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'title' => 'Submitted request',
        'status' => PurchaseRequestStatus::PendingManagerReview,
    ]);
    PurchaseRequest::factory()->create([
        'department_id' => $otherDepartment->id,
        'requester_id' => $otherRequester->id,
        'title' => 'Hidden warehouse request',
        'status' => PurchaseRequestStatus::Draft,
    ]);

    $this
        ->actingAs($requester)
        ->get(route('purchase-requests.index', [
            'search' => 'warehouse',
            'status' => 'draft',
        ]))
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $page): AssertableInertia => $page
            ->component('purchase-requests/index', false)
            ->has('purchaseRequests.data', 1)
            ->where(
                'purchaseRequests.data.0.title',
                'Matching warehouse request',
            )
            ->where('filters.search', 'warehouse')
            ->where('filters.status', 'draft')
        );
});

it('does not allow editing after submission', function (): void {
    $department = Department::factory()->create();
    $requester = User::factory()->create([
        'department_id' => $department->id,
        'role' => UserRole::Requester,
    ]);
    $purchaseRequest = PurchaseRequest::factory()->create([
        'department_id' => $department->id,
        'requester_id' => $requester->id,
        'status' => PurchaseRequestStatus::Draft,
    ]);

    app(SubmitPurchaseRequest::class)->handle(
        $purchaseRequest,
        $requester,
    );

    $this
        ->actingAs($requester)
        ->put(route('purchase-requests.update', [
            'purchaseRequestId' => $purchaseRequest->id,
        ]), validPurchaseRequestPayload())
        ->assertForbidden();
});
