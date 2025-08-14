<?php
// database/migrations/2025_01_02_000001_add_fields_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('name');
            $table->string('avatar')->nullable()->after('email');
            $table->integer('xp')->default(0);
            $table->integer('level')->default(1);
            $table->integer('credits')->default(0);
            $table->enum('theme', ['dark', 'light', 'cyberpunk'])->default('cyberpunk');
            $table->json('preferences')->nullable();
            $table->enum('role', ['student', 'mentor', 'instructor', 'admin'])->default('student');
            $table->timestamp('last_active')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'avatar', 'xp', 'level', 'credits', 'theme', 'preferences', 'role', 'last_active']);
        });
    }
};