<?php
// database/migrations/2024_01_01_000004_create_circuits_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('circuits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->json('circuit_data');
            $table->json('components')->nullable();
            $table->json('simulation_results')->nullable();
            $table->boolean('is_public')->default(true);
            $table->boolean('is_challenge')->default(false);
            $table->integer('difficulty_level')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('is_challenge');
        });
    }

    public function down()
    {
        Schema::dropIfExists('circuits');
    }
};