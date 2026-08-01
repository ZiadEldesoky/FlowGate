<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Organization\Enums\UserRole;
use App\Domain\Procurement\Actions\ApproveManagerReview;
use App\Domain\Procurement\Actions\ApproveProcurementReview;
use App\Domain\Procurement\Actions\CreatePurchaseRequest;
use App\Domain\Procurement\Actions\SubmitPurchaseRequest;
use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

final class DatabaseSeeder extends Seeder
{
    public function run(
        CreatePurchaseRequest $create,
        SubmitPurchaseRequest $submit,
        ApproveManagerReview $approveManager,
        ApproveProcurementReview $approveProcurement,
    ): void {
        $operations = Department::query()->firstOrNew([
            'code' => 'OPS',
        ]);
        $operations->name = 'Operations';
        $operations->save();

        $requester = $this->user(
            email: 'test@example.com',
            name: 'Mariam Hassan',
            role: UserRole::Requester,
            department: $operations,
        );
        $manager = $this->user(
            email: 'manager@flowgate.test',
            name: 'Omar Nabil',
            role: UserRole::Manager,
            department: $operations,
        );
        $procurement = $this->user(
            email: 'procurement@flowgate.test',
            name: 'Nour Adel',
            role: UserRole::Procurement,
        );
        $this->user(
            email: 'admin@flowgate.test',
            name: 'FlowGate Admin',
            role: UserRole::Administrator,
        );

        $operations->manager_id = $manager->id;
        $operations->save();

        $this->purchaseRequest(
            create: $create,
            requester: $requester,
            title: 'Warehouse packaging supplies',
            justification: 'Packaging stock is below the reorder threshold.',
            neededBy: now()->addWeeks(2)->toDateString(),
            items: [
                [
                    'description' => 'Double-wall shipping cartons',
                    'sku' => 'CTN-DW-100',
                    'quantity' => '100.000',
                    'unit_price' => '18.50',
                ],
                [
                    'description' => 'Fragile handling labels',
                    'sku' => 'LBL-FRG',
                    'quantity' => '250.000',
                    'unit_price' => '1.20',
                ],
            ],
        );

        $pendingManager = $this->purchaseRequest(
            create: $create,
            requester: $requester,
            title: 'Office workstation accessories',
            justification: 'New joiners require complete workstation kits.',
            neededBy: now()->addWeeks(3)->toDateString(),
            items: [
                [
                    'description' => 'USB-C docking station',
                    'sku' => 'DOCK-USBC',
                    'quantity' => '4.000',
                    'unit_price' => '3200.00',
                ],
            ],
        );

        if ($pendingManager->status === PurchaseRequestStatus::Draft) {
            $submit->handle($pendingManager, $requester);
        }

        $pendingProcurement = $this->purchaseRequest(
            create: $create,
            requester: $requester,
            title: 'Facility safety equipment',
            justification: 'Quarterly safety inspection identified shortages.',
            neededBy: now()->addMonth()->toDateString(),
            items: [
                [
                    'description' => 'First aid cabinet refill',
                    'sku' => 'SAFE-AID',
                    'quantity' => '3.000',
                    'unit_price' => '1450.00',
                ],
                [
                    'description' => 'Reflective safety vest',
                    'sku' => 'SAFE-VEST',
                    'quantity' => '20.000',
                    'unit_price' => '185.00',
                ],
            ],
        );

        if ($pendingProcurement->status === PurchaseRequestStatus::Draft) {
            $pendingProcurement = $submit->handle(
                $pendingProcurement,
                $requester,
            );
        }

        if (
            $pendingProcurement->status
            === PurchaseRequestStatus::PendingManagerReview
        ) {
            $approveManager->handle(
                $pendingProcurement,
                $manager,
                'Operational budget confirmed.',
            );
        }

        $approved = $this->purchaseRequest(
            create: $create,
            requester: $requester,
            title: 'Annual maintenance toolkit',
            justification: 'Replacement tools are required before maintenance.',
            neededBy: now()->addWeeks(5)->toDateString(),
            items: [
                [
                    'description' => 'Industrial maintenance toolkit',
                    'sku' => 'MNT-KIT-24',
                    'quantity' => '2.000',
                    'unit_price' => '7800.00',
                ],
            ],
        );

        if ($approved->status === PurchaseRequestStatus::Draft) {
            $approved = $submit->handle($approved, $requester);
        }

        if (
            $approved->status
            === PurchaseRequestStatus::PendingManagerReview
        ) {
            $approved = $approveManager->handle(
                $approved,
                $manager,
                'Budget allocation approved.',
            );
        }

        if (
            $approved->status
            === PurchaseRequestStatus::PendingProcurementReview
        ) {
            $approveProcurement->handle(
                $approved,
                $procurement,
                'Supplier availability verified.',
            );
        }
    }

    private function user(
        string $email,
        string $name,
        UserRole $role,
        ?Department $department = null,
    ): User {
        $user = User::query()->firstOrNew(['email' => $email]);
        $user->name = $name;
        $user->password = 'password';
        $user->role = $role;
        $user->department_id = $department?->id;
        $user->email_verified_at ??= Carbon::now();
        $user->save();

        return $user;
    }

    /**
     * @param  list<array{
     *     description: string,
     *     sku: string|null,
     *     quantity: string,
     *     unit_price: string
     * }>  $items
     */
    private function purchaseRequest(
        CreatePurchaseRequest $create,
        User $requester,
        string $title,
        string $justification,
        string $neededBy,
        array $items,
    ): PurchaseRequest {
        $existing = PurchaseRequest::query()
            ->where('requester_id', $requester->id)
            ->where('title', $title)
            ->first();

        if ($existing !== null) {
            return $existing;
        }

        return $create->handle($requester, [
            'title' => $title,
            'justification' => $justification,
            'needed_by' => $neededBy,
            'currency' => 'EGP',
            'items' => $items,
        ]);
    }
}
