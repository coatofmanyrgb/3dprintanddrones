<?php
// database/migrations/2024_01_01_000003_create_flight_videos_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('flight_videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('project_id')->nullable()->constrained()->onDelete('set null');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('video_url');
            $table->string('thumbnail_url')->nullable();
            $table->json('flight_data')->nullable();
            $table->json('annotations')->nullable();
            $table->integer('duration_seconds');
            $table->decimal('max_altitude', 8, 2)->nullable();
            $table->decimal('max_speed', 8, 2)->nullable();
            $table->decimal('flight_distance', 8, 2)->nullable();
            $table->enum('aircraft_type', ['drone', 'kite', 'plane', 'rocket', 'other']);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('project_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('flight_videos');
    }
};