<?php
// database/migrations/2024_01_01_000007_create_workshops_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workshops', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->datetime('start_time');
            $table->integer('duration_minutes');
            $table->string('stream_url')->nullable();
            $table->integer('max_participants')->nullable();
            $table->enum('status', ['scheduled', 'live', 'completed', 'cancelled'])->default('scheduled');
            $table->json('topics')->nullable();
            $table->json('materials')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'start_time']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workshops');
    }
};