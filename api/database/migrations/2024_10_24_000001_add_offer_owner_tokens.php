<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('offers', function (Blueprint $table): void {
            $table->string('token_hash', 128)->nullable()->after('notes');
            $table->timestamp('token_expires_at')->nullable()->after('token_hash');
        });
    }

    public function down(): void
    {
        Schema::table('offers', function (Blueprint $table): void {
            $table->dropColumn(['token_hash', 'token_expires_at']);
        });
    }
};
