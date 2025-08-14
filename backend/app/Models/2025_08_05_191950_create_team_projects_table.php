<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTeamProjectsTable extends Migration
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
        });
    }
}
