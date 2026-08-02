<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CollectionController extends Controller
{
    public function index()
    {
        $collections = Collection::where('is_active', true)->get();
        return response()->json([
            'status' => true,
            'data' => $collections,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $slug = Str::slug($request->name);
        $originalSlug = $slug;
        $count = 1;
        while (Collection::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $count++;
        }

        $collection = Collection::create([
            'name' => strtoupper($request->name),
            'slug' => $slug,
            'code' => $request->code ? strtoupper($request->code) : strtoupper($request->name),
            'description' => $request->description,
            'is_active' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Collection created successfully',
            'data' => $collection,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $collection = Collection::find($id);
        if (!$collection) {
            return response()->json([
                'status' => false,
                'message' => 'Collection not found',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $slug = Str::slug($request->name);
        if ($slug !== $collection->slug) {
            $originalSlug = $slug;
            $count = 1;
            while (Collection::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                $slug = $originalSlug . '-' . $count++;
            }
        }

        $collection->update([
            'name' => strtoupper($request->name),
            'slug' => $slug,
            'code' => $request->code ? strtoupper($request->code) : strtoupper($request->name),
            'description' => $request->description,
            'is_active' => $request->has('is_active') ? $request->is_active : $collection->is_active,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Collection updated successfully',
            'data' => $collection,
        ], 200);
    }

    public function destroy($id)
    {
        $collection = Collection::find($id);
        if (!$collection) {
            return response()->json([
                'status' => false,
                'message' => 'Collection not found',
            ], 404);
        }

        $collection->delete();

        return response()->json([
            'status' => true,
            'message' => 'Collection deleted successfully',
        ], 200);
    }
}
