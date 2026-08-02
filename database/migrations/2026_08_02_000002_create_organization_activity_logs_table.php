<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organization_activity_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->enum('action', [
                'department_created',
                'department_updated',
                'user_assignment_updated',
            ]);
            $table->enum('subject_type', [
                'department',
                'user',
            ]);
            $table->unsignedBigInteger('subject_id');
            $table->string('subject_label', 190);
            $table->json('changes');
            $table->timestamps();

            $table->index(
                ['subject_type', 'subject_id', 'created_at'],
                'organization_activity_subject_index',
            );
            $table->index(
                ['actor_id', 'created_at'],
                'organization_activity_actor_index',
            );
            $table->index(
                ['action', 'created_at'],
                'organization_activity_action_index',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organization_activity_logs');
    }
};
