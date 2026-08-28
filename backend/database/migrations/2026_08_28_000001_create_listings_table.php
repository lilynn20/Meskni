<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('property_type');
            $table->string('listing_type');
            $table->string('city');
            $table->string('neighborhood');
            $table->text('address')->nullable();
            $table->decimal('rent', 10, 2);
            $table->decimal('estimated_utilities', 10, 2)->default(0);
            $table->decimal('deposit', 10, 2)->default(0);
            $table->date('available_from')->nullable();
            $table->unsignedInteger('bedrooms')->default(0);
            $table->unsignedInteger('bathrooms')->default(0);
            $table->decimal('surface_area', 8, 2)->nullable();
            $table->boolean('furnished')->default(false);
            $table->boolean('internet_included')->default(false);
            $table->boolean('parking')->default(false);
            $table->string('gender_preference')->default('any');
            $table->unsignedInteger('current_occupants')->default(0);
            $table->unsignedInteger('available_spots')->default(0);
            $table->unsignedInteger('max_occupants')->default(1);
            $table->string('status')->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index('owner_id');
            $table->index('city');
            $table->index('neighborhood');
            $table->index('rent');
            $table->index('property_type');
            $table->index('listing_type');
            $table->index('status');
            $table->index('available_from');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
