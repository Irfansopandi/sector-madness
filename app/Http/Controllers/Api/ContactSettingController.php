<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactSetting;
use Illuminate\Http\Request;

class ContactSettingController extends Controller
{
    public function index()
    {
        $settings = ContactSetting::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $settings
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string|in:channel,warehouse',
            'code' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'value' => 'required|string',
            'link' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $setting = ContactSetting::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Contact setting created successfully.',
            'data' => $setting
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $setting = ContactSetting::findOrFail($id);

        $validated = $request->validate([
            'type' => 'sometimes|string|in:channel,warehouse',
            'code' => 'nullable|string|max:50',
            'title' => 'sometimes|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'value' => 'sometimes|string',
            'link' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $setting->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Contact setting updated successfully.',
            'data' => $setting
        ]);
    }

    public function destroy($id)
    {
        $setting = ContactSetting::findOrFail($id);
        $setting->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Contact setting deleted successfully.'
        ]);
    }
}
