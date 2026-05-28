<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->string('profile_photo_path')->nullable()->after('role');
        });

        Schema::table('store_settings', function (Blueprint $table): void {
            $table->string('logo_path')->nullable()->after('theme');
            $table->string('logo_icon_path')->nullable()->after('logo_path');
            $table->string('navbar_logo_path')->nullable()->after('logo_icon_path');
        });
    }

    public function down(): void
    {
        Schema::table('store_settings', function (Blueprint $table): void {
            $table->dropColumn(['logo_path', 'logo_icon_path', 'navbar_logo_path']);
        });

        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn('profile_photo_path');
        });
    }
};
