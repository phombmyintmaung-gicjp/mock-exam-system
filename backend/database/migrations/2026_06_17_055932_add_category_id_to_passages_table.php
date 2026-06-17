<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('passages', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete()->after('level');
        });
    }

    public function down(): void
    {
        Schema::table('passages', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\Category::class);
            $table->dropColumn('category_id');
        });
    }
};
