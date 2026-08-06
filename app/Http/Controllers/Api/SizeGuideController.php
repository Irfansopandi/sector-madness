<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SizeGuide;
use Illuminate\Http\Request;

class SizeGuideController extends Controller
{
    public function index()
    {
        $sizeGuides = SizeGuide::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $sizeGuides
        ]);
    }

    public function adminIndex()
    {
        $sizeGuides = SizeGuide::orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $sizeGuides
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category' => 'required|string|max:255',
            'category_code' => 'required|string|max:50',
            'fit_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'columns' => 'required|array',
            'rows' => 'required|array',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $sizeGuide = SizeGuide::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'General size guide category created successfully.',
            'data' => $sizeGuide
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $sizeGuide = SizeGuide::findOrFail($id);

        $validated = $request->validate([
            'category' => 'sometimes|string|max:255',
            'category_code' => 'sometimes|string|max:50',
            'fit_description' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'columns' => 'sometimes|array',
            'rows' => 'sometimes|array',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $sizeGuide->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'General size guide category updated successfully.',
            'data' => $sizeGuide
        ]);
    }

    public function destroy($id)
    {
        $sizeGuide = SizeGuide::findOrFail($id);
        $sizeGuide->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'General size guide category deleted successfully.'
        ]);
    }
}
