<?php
// database/migrations/2024_01_01_000002_create_projects_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('category', ['3d', 'flight', 'electronics', 'robotics', 'other']);
            $table->string('model_url')->nullable();
            $table->json('model_data')->nullable();
            $table->json('evolution_timeline')->nullable();
            $table->integer('votes')->default(0);
            $table->integer('views')->default(0);
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->json('tags')->nullable();
            $table->json('materials')->nullable();
            $table->json('specifications')->nullable();
            $table->timestamps();
            
            $table->index(['category', 'featured']);
            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('projects');
    }
};