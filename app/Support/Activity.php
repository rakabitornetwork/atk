<?php

namespace App\Support;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Activity
{
    public static function log(Request $request, string $action, ?string $subjectType = null, ?int $subjectId = null, array $properties = []): void
    {
        DB::table('activity_logs')->insert([
            'user_id' => $request->user()?->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => $properties === [] ? null : json_encode($properties),
            'ip_address' => $request->ip(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
