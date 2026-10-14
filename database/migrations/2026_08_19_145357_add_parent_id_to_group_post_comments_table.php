<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('group_post_comments', function (Blueprint $table) {
            $table->foreignId('parent_id')
                ->nullable()
                ->after('group_post_id')
                ->constrained('group_post_comments')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('group_post_comments', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
        });
    }
};