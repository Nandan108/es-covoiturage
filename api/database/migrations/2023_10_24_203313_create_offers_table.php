<?php

use App\Models\Event;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('offers', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Event::class)->constrained();

            $table->string('name', 50);
            $table->string('address', 255);
            $table->decimal('lat', 9, 7)->comment('latitude');
            $table->decimal('lng', 10, 7)->comment('longitude');
            $table->dateTime('depart')->nullable();
            $table->string('notes', 512)->nullable(); // précisions
            $table->string('phone', 50)->nullable();
            $table->string('email', 50);
            $table->boolean('email_is_public')->default(true);
            // $table->set('role', ['driver', 'pasngr'])->default('');
            $table->unsignedTinyInteger('driver_seats'); // seats available
            $table->unsignedTinyInteger('pasngr_seats'); // seats desired
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('offers');
    }
};
