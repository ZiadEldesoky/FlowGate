<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var list<string>
     */
    private array $statuses = [
        'draft',
        'pending_manager_review',
        'pending_procurement_review',
        'approved',
        'rejected',
        'completed',
        'cancelled',
    ];

    public function up(): void
    {
        Schema::create('purchase_requests', function (Blueprint $table): void {
            $table->id();
            $table->string('reference', 24)->unique();
            $table->foreignId('department_id')
                ->constrained()
                ->restrictOnDelete();
            $table->foreignId('requester_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('title', 160);
            $table->text('justification');
            $table->date('needed_by')->nullable();
            $table->enum('status', $this->statuses)->default('draft');
            $table->char('currency', 3)->default('EGP');
            $table->decimal('total_amount', 16, 2)->unsigned()->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->index(['department_id', 'status']);
            $table->index(['requester_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        Schema::create('purchase_request_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_request_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('description', 255);
            $table->string('sku', 80)->nullable();
            $table->decimal('quantity', 12, 3)->unsigned();
            $table->decimal('unit_price', 16, 2)->unsigned();
            $table->decimal('line_total', 16, 2)->unsigned();
            $table->unsignedSmallInteger('position');
            $table->timestamps();

            $table->unique(['purchase_request_id', 'position']);
            $table->index('sku');
        });

        Schema::create('approvals', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_request_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('actor_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->enum('stage', [
                'manager_review',
                'procurement_review',
            ]);
            $table->enum('decision', [
                'approved',
                'rejected',
            ]);
            $table->text('comment')->nullable();
            $table->timestamp('decided_at');
            $table->timestamps();

            $table->unique(['purchase_request_id', 'stage']);
            $table->index(['actor_id', 'decided_at']);
        });

        Schema::create('activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_request_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->enum('action', [
                'submit',
                'approve_manager_review',
                'approve_procurement_review',
                'reject',
                'complete',
                'cancel',
            ]);
            $table->enum('from_status', $this->statuses)->nullable();
            $table->enum('to_status', $this->statuses);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['purchase_request_id', 'created_at']);
            $table->index(['actor_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('approvals');
        Schema::dropIfExists('purchase_request_items');
        Schema::dropIfExists('purchase_requests');
    }
};
