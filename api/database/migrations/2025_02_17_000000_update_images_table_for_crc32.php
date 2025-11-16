<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->unsignedBigInteger('crc32')->default(0)->index()->after('name');
        });

        DB::table('images')->select(['id', 'file'])->orderBy('id')
            ->chunkById(200, static function ($rows): void {
                foreach ($rows as $row) {
                    if (!isset($row->file)) {
                        continue;
                    }
                    $binary = base64_decode($row->file, true) ?: '';
                    $crc = '' === $binary ? 0 :
                        // Calculate unsigned CRC32 checksum
                        (int) sprintf('%u', crc32($binary));
                    DB::table('images')->where('id', $row->id)->update(['crc32' => $crc]);
                }
            });

        Schema::table('images', function (Blueprint $table) {
            $table->dropColumn('file');
        });
    }

    public function down(): void
    {
        Schema::table('images', function (Blueprint $table) {
            $table->mediumText('file')->nullable();
        });

        DB::table('images')->update(['file' => null]);

        Schema::table('images', function (Blueprint $table) {
            $table->dropIndex(['crc32']);
            $table->dropColumn('crc32');
        });
    }
};
