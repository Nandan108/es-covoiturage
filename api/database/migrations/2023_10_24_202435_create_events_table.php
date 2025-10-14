<?php

use App\Models\Image;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->enum('type', ['retreat', 'seminar', 'silent-retreat']);
            $table->date('start_date');
            $table->unsignedTinyInteger('days');
            $table->foreignIdFor(Image::class)->constrained();
            $table->unsignedSmallInteger('original_event_id')
                ->index('idx_org_evt_id')
                ->comment('ID of event on original site. Used to construct link to original event page');
            $table->string('loc_name', 64);
            $table->string('loc_address', 255);
            $table->decimal('loc_lat', 9, 7)->comment('latitude');
            $table->decimal('loc_lng', 10, 7)->comment('longitude');
            $table->string('loc_original_link');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
