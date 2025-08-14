<?php
// database/migrations/2024_01_01_000001_add_fields_to_users_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->after('id');
            $table->string('avatar')->nullable()->after('email');
            $table->integer('xp')->default(0)->after('password');
            $table->integer('level')->default(1)->after('xp');
            $table->integer('credits')->default(0)->after('level');
            $table->enum('theme', ['dark', 'light', 'cyberpunk'])->default('cyberpunk')->after('credits');
            $table->json('preferences')->nullable()->after('theme');
            $table->enum('role', ['student', 'mentor', 'instructor', 'admin'])->default('student')->after('preferences');
            $table->timestamp('last_active')->nullable()->after('role');
        });
    }

    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'avatar', 'xp', 'level', 'credits', 'theme', 'preferences', 'role', 'last_active']);
        });
    }
};