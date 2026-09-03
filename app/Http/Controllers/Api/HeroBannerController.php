<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HeroBanner;
use Illuminate\Http\Request;

class HeroBannerController extends Controller
{
    /**
     * Display active hero banners for public frontend.
     */
    public function index()
    {
        $banners = HeroBanner::where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $banners,
        ]);
    }

    /**
     * Display all hero banners for Admin management.
     */
    public function adminIndex()
    {
        $banners = HeroBanner::orderBy('sort_order', 'asc')->orderBy('id', 'asc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $banners,
        ]);
    }

    /**
     * Store a newly created hero banner in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'image_path' => 'sometimes|required|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'link_url' => 'nullable|string',
        ]);

        $banner = HeroBanner::create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Hero banner created successfully.',
            'data' => $banner,
        ], 201);
    }

    /**
     * Update the specified hero banner in storage.
     */
    public function update(Request $request, $id)
    {
        $banner = HeroBanner::findOrFail($id);

        $validated = $request->validate([
            'image_path' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'link_url' => 'nullable|string',
        ]);

        $banner->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Hero banner updated successfully.',
            'data' => $banner,
        ]);
    }

    /**
     * Remove the specified hero banner from storage.
     */
    public function destroy($id)
    {
        $banner = HeroBanner::findOrFail($id);
        $banner->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Hero banner deleted successfully.',
        ]);
    }
}
