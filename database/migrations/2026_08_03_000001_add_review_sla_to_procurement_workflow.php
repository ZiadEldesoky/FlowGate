<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table): void {
            $table->timestamp('review_due_at')
                ->nullable()
                ->after('submitted_at');
            $table->index(['status', 'review_due_at']);
        });

        Schema::create('approval_reminders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_request_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->enum('stage', [
                'manager_review',
                'procurement_review',
            ]);
            $table->date('reminder_on');
            $table->unsignedSmallInteger('recipient_count')->default(0);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique([
                'purchase_request_id',
                'stage',
                'reminder_on',
            ]);
            $table->index(['processed_at', 'reminder_on']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_reminders');

        Schema::table('purchase_requests', function (Blueprint $table): void {
            $table->dropIndex([
                'status',
                'review_due_at',
            ]);
            $table->dropColumn('review_due_at');
        });
    }
};
