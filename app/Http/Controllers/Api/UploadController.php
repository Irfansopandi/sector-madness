<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    /**
     * Handle image upload for admin panel.
     * Saves to public/storage/uploads and returns the public URL path.
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $file = $request->file('image');
        $folder = $request->input('folder', 'uploads');

        // Generate unique filename
        $extension = $file->getClientOriginalExtension();
        $filename = Str::uuid() . '.' . $extension;

        // Store in public disk under storage/app/public/{folder}/
        $path = $file->storeAs($folder, $filename, 'public');

        // Return the public URL path (accessible via /storage/{folder}/{filename})
        $publicPath = '/storage/' . $path;

        return response()->json([
            'status' => 'success',
            'message' => 'Image uploaded successfully.',
            'path' => $publicPath,
            'url' => url($publicPath),
        ], 201);
    }
}
