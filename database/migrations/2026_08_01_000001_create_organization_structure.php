<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 120);
            $table->string('code', 30)->unique();
            $table->foreignId('manager_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamps();

            $table->index('manager_id');
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->foreignId('department_id')
                ->nullable()
                ->after('id')
                ->constrained('departments')
                ->nullOnDelete();
            $table->enum('role', [
                'requester',
                'manager',
                'procurement',
                'administrator',
            ])->default('requester')->after('email');

            $table->index(['department_id', 'role']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropIndex(['department_id', 'role']);
            $table->dropConstrainedForeignId('department_id');
            $table->dropColumn('role');
        });

        Schema::dropIfExists('departments');
    }
};
