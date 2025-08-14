<?php
// database/migrations/2024_01_01_000010_create_workshop_participants_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('workshop_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workshop_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            $table->unique(['workshop_id', 'user_id']);
        });
    }

    public function down()
    {
        Schema::dropIfExists('workshop_participants');
    }
};