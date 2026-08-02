<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JournalController extends Controller
{
    /**
     * Get list of published journals.
     */
    public function index(Request $request)
    {
        $query = Journal::query();

        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        if ($request->has('featured') && $request->featured == 'true') {
            $query->where('featured', true);
        }

        $query->where('is_published', true)
              ->orderBy('sort_order', 'asc')
              ->orderBy('created_at', 'desc');

        return response()->json($query->get());
    }

    /**
     * Get single journal by slug or ID.
     */
    public function show($slug)
    {
        $journal = Journal::where('slug', $slug)
            ->orWhere('id', $slug)
            ->first();

        if (!$journal) {
            return response()->json(['message' => 'Journal article not found.'], 404);
        }

        return response()->json($journal);
    }

    /**
     * Admin: Store new journal.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:255',
            'issue' => 'nullable|string|max:255',
            'date' => 'nullable|string|max:255',
            'summary' => 'nullable|string',
            'image' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'content' => 'nullable',
            'quote' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        $validated['featured'] = $request->boolean('featured', false);
        $validated['is_published'] = $request->boolean('is_published', true);

        if (is_string($validated['content'])) {
            $validated['content'] = array_filter(array_map('trim', explode("\n", $validated['content'])));
        }

        $journal = Journal::create($validated);

        return response()->json($journal, 201);
    }

    /**
     * Admin: Update existing journal.
     */
    public function update(Request $request, $id)
    {
        $journal = Journal::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'sometimes|required|string|max:255',
            'issue' => 'nullable|string|max:255',
            'date' => 'nullable|string|max:255',
            'summary' => 'nullable|string',
            'image' => 'nullable|string',
            'featured' => 'nullable|boolean',
            'content' => 'nullable',
            'quote' => 'nullable|string',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
        ]);

        if (isset($validated['title']) && $validated['title'] !== $journal->title) {
            $validated['slug'] = Str::slug($validated['title']) . '-' . Str::random(5);
        }

        if (isset($validated['content']) && is_string($validated['content'])) {
            $validated['content'] = array_filter(array_map('trim', explode("\n", $validated['content'])));
        }

        $journal->update($validated);

        return response()->json($journal);
    }

    /**
     * Admin: Delete journal.
     */
    public function destroy($id)
    {
        $journal = Journal::findOrFail($id);
        $journal->delete();

        return response()->json(['message' => 'Journal deleted successfully.']);
    }
}
