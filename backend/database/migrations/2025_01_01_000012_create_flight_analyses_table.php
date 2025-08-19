<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('flight_analyses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flight_video_id')->constrained()->onDelete('cascade');
            $table->json('flight_data')->nullable(); // Array of telemetry points
            $table->decimal('max_altitude', 10, 2)->nullable();
            $table->decimal('max_speed', 10, 2)->nullable();
            $table->decimal('avg_speed', 10, 2)->nullable();
            $table->decimal('total_distance', 10, 2)->nullable();
            $table->integer('flight_time')->nullable(); // seconds
            $table->integer('battery_used')->nullable(); // percentage
            $table->json('takeoff_location')->nullable(); // {lat, lng, address}
            $table->json('landing_location')->nullable(); // {lat, lng, address}
            $table->json('weather_conditions')->nullable();
            $table->decimal('wind_speed', 5, 2)->nullable();
            $table->decimal('temperature', 5, 2)->nullable();
            $table->timestamp('analyzed_at')->nullable();
            $table->json('telemetry_data')->nullable(); // Raw telemetry
            $table->json('waypoints')->nullable(); // Key points in flight
            $table->json('warnings')->nullable(); // Any flight warnings/alerts
            $table->integer('performance_score')->nullable();
            $table->timestamps();
            
            $table->index('flight_video_id');
            $table->index('performance_score');
        });
    }

    public function down()
    {
        Schema::dropIfExists('flight_analyses');
    }
};