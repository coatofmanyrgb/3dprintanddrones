<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAchievementsTable extends Migration
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
            $table->json('requirements'); // JSON conditions for unlocking
            $table->integer('tier')->default(1); // bronze, silver, gold
            $table->timestamps();
        });
    }
}
