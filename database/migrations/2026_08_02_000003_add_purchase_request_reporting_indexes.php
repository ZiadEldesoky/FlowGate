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
            $table->index(
                ['department_id', 'created_at'],
                'purchase_requests_department_created_index',
            );
            $table->index(
                ['created_at', 'id'],
                'purchase_requests_created_id_index',
            );
        });
    }

    public function down(): void
    {
        Schema::table('purchase_requests', function (Blueprint $table): void {
            $table->dropIndex(
                'purchase_requests_department_created_index',
            );
            $table->dropIndex('purchase_requests_created_id_index');
        });
    }
};
