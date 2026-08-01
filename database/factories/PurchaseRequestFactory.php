<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Domain\Procurement\Enums\PurchaseRequestStatus;
use App\Models\Department;
use App\Models\PurchaseRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PurchaseRequest>
 */
final class PurchaseRequestFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reference' => 'PR-'.fake()->unique()->numerify('########'),
            'department_id' => Department::factory(),
            'requester_id' => User::factory(),
            'title' => fake()->sentence(4),
            'justification' => fake()->paragraph(),
            'needed_by' => fake()->optional()->dateTimeBetween('+1 week', '+2 months'),
            'status' => PurchaseRequestStatus::Draft,
            'currency' => 'EGP',
            'total_amount' => fake()->randomFloat(2, 100, 50000),
        ];
    }

    public function status(PurchaseRequestStatus $status): static
    {
        return $this->state(fn (): array => [
            'status' => $status,
        ]);
    }
}
