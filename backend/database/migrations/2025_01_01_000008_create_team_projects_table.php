<?php
// database/migrations/2024_01_01_000008_create_team_projects_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('team_projects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->foreignId('leader_id')->constrained('users')->onDelete('cascade');
            $table->integer('max_members')->default(5);
            $table->enum('status', ['recruiting', 'active', 'completed', 'paused'])->default('recruiting');
            $table->json('skills_needed')->nullable();
            $table->json('milestones')->nullable();
            $table->timestamps();
            
            $table->index('status');
            $table->index('leader_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_projects');
    }
};