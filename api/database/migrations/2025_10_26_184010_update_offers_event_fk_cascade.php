<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        try {
            Schema::table('offers', function (Blueprint $table) {
                $table->dropForeign(['event_id']);
            });
        } catch (Illuminate\Database\QueryException $e) {
            // Foreign key might not exist, ignore
        }

        try {
            Schema::table('offers', function (Blueprint $table) {
                $table->foreign('event_id')
                    ->references('id')
                    ->on('events')
                    ->cascadeOnDelete();
            });
        } catch (Illuminate\Database\QueryException $e) {
            // Foreign key might exist, ignore
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
            $table->foreign('event_id')
                ->references('id')
                ->on('events');
        });
    }
};
