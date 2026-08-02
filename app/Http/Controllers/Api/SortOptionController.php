<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SortOption;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SortOptionController extends Controller
{
    public function index()
    {
        $options = SortOption::where('is_active', true)->orderBy('sort_order', 'asc')->get();
        return response()->json([
            'status' => true,
            'data' => $options,
        ], 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $code = $request->code ? strtoupper($request->code) : strtoupper(Str::slug($request->name, '_'));

        $option = SortOption::create([
            'name' => strtoupper($request->name),
            'code' => $code,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => true,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Sort option created successfully',
            'data' => $option,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $option = SortOption::find($id);
        if (!$option) {
            return response()->json([
                'status' => false,
                'message' => 'Sort option not found',
            ], 404);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $code = $request->code ? strtoupper($request->code) : strtoupper(Str::slug($request->name, '_'));

        $option->update([
            'name' => strtoupper($request->name),
            'code' => $code,
            'sort_order' => $request->sort_order ?? $option->sort_order,
            'is_active' => $request->has('is_active') ? $request->is_active : $option->is_active,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Sort option updated successfully',
            'data' => $option,
        ], 200);
    }

    public function destroy($id)
    {
        $option = SortOption::find($id);
        if (!$option) {
            return response()->json([
                'status' => false,
                'message' => 'Sort option not found',
            ], 404);
        }

        $option->delete();

        return response()->json([
            'status' => true,
            'message' => 'Sort option deleted successfully',
        ], 200);
    }
}
