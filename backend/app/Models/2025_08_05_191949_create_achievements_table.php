<?php
// database/migrations/2024_01_01_000005_create_achievements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('icon');
            $table->integer('xp_reward');
            $table->enum('category', ['flight', 'electronics', '3d', 'community', 'learning']);
            $table->json('requirements');
            $table->integer('tier')->default(1);
            $table->timestamps();
            
            $table->index('category');
        });
    }

    public function down()
    {
        Schema::dropIfExists('achievements');
    }
};