<?php
// database/migrations/2024_01_01_000011_create_team_project_members_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('team_project_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_project_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('role')->default('member');
            $table->timestamp('joined_at');
            $table->timestamps();
            
            $table->unique(['team_project_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('team_project_members');
    }
};