<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Category;
use App\Models\Comment;
use App\Models\CommentLike;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class ContentController extends Controller
{
   public function index(Request $request)
    {
        $search = $request->get('search');
        $viewer = Auth::user();

        $contents = Content::query()
            ->visibleTo($viewer) // hormati visibility
            ->with([
                'user:id,name,username,avatar',
                'category',
                'comments' => function ($q) {
                    $q->whereNull('parent_id')
                        ->with([
                            'user:id,name,username,avatar',
                            'replies' => function ($r) {
                                $r->with('user:id,name,username,avatar')
                                    ->withCount('likes')
                                    ->latest();
                            },
                        ])
                        ->withCount('likes')
                        ->latest();
                },
            ])
            ->withCount('likes')
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('paragraph', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->get()
            ->map(function ($content) {
                $content->is_liked = $content->likes()
                    ->where('user_id', Auth::id())
                    ->exists();
                return $content;
            });

        return Inertia::render('Content/Index', [
            'contents'   => $contents,
            'categories' => Category::all(),
            'filters'    => [
                'search' => $search,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Content/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title'        => 'required|string|max:255',
            'category_id'  => 'nullable|exists:categories,id',
            'visibility'   => 'required|in:public,followers,private',
            'description'  => 'nullable|string',
            'paragraph'    => 'nullable|string',
            'image'        => 'nullable|image|max:2048',
            'type'         => 'required|string|in:video,text,quiz,pdf',
            'is_published' => 'boolean',
            'order'        => 'integer',
        ]);

        
        $content               = new Content();
        $content->title        = $request->title;
        $content->category_id  = $request->category_id;
        $content->visibility   = $request->visibility;
        $content->description  = $request->description;
        $content->paragraph    = $request->paragraph;
        $content->created_by   = Auth::id();
        $content->type         = $request->type;
        $content->is_published = $request->boolean('is_published');
        $content->order        = $request->order ?? 0;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('images', 'public');
            $content->image = $path;
        }

        $content->save();

        return redirect()
            ->route('content.index')
            ->with('success', 'Content created successfully.');
    }

   

    public function edit(Content $content)
    {
        $content->load('category');

        return Inertia::render('Content/Edit', [
            'content' => $content,
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Content $content)
    {
        $request->validate([
            'title'       => 'required|string|max:255',
            'visibility'  => 'required|in:public,followers,private',
            'description' => 'nullable|string',
            'paragraph'   => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
        ]);

        $content->title       = $request->title;
        $content->visibility  = $request->visibility;
        $content->category_id = $request->category_id;
        $content->description = $request->description;
        $content->paragraph   = $request->paragraph;
        $content->save();

        return redirect()
            ->route('content.index')
            ->with('success', 'Konten berhasil diupdate!');
    }

    public function destroy(Content $content)
    {
        if ($content->image && Storage::disk('public')->exists($content->image)) {
            Storage::disk('public')->delete($content->image);
        }

        $content->forceDelete();

        return redirect()->back()->with('success', 'Konten berhasil dihapus');
    }

    /**
     * Toggle Like Post
     */
    public function like(Content $content)
    {
        $userId = Auth::id();
        $existingLike = $content->likes()->where('user_id', $userId)->first();

        if ($existingLike) {
            $existingLike->delete();
            $content->decrement('likes');
        } else {
            $content->likes()->create(['user_id' => $userId]);
            $content->increment('likes');
        }

        return back();
    }

    /**
     * Simpan Komentar / Reply
     */
    public function comment(Request $request, Content $content)
    {
        $request->validate([
            'comment'   => 'required|string|max:500',
            'parent_id' => 'nullable|exists:comments,id',
        ]);

        if ($request->parent_id) {
            Comment::where('id', $request->parent_id)
                ->where('content_id', $content->id)
                ->firstOrFail();
        }

        $content->comments()->create([
            'user_id'   => Auth::id(),
            'parent_id' => $request->parent_id,
            'comment'   => $request->comment,
        ]);

        return back()->with('success', 'Komentar berhasil ditambahkan');
    }

    /**
     * Like / Unlike Comment
     */
    public function likeComment(Content $content, Comment $comment)
    {
        if ($comment->content_id !== $content->id) {
            abort(404);
        }

        $existing = CommentLike::where('user_id', Auth::id())
            ->where('comment_id', $comment->id)
            ->first();

        if ($existing) {
            $existing->delete();
        } else {
            CommentLike::create([
                'user_id'    => Auth::id(),
                'comment_id' => $comment->id,
            ]);
        }

        return back();
    }

    /**
     * Hapus Comment
     */
    public function destroyComment(Content $content, Comment $comment)
    {
        if ($comment->content_id !== $content->id) {
            abort(404);
        }

        $isCommentOwner = $comment->user_id === Auth::id();
        $isContentOwner = $content->created_by === Auth::id();

        if (!$isCommentOwner && !$isContentOwner) {
            abort(403);
        }

        $comment->delete();

        return back()->with('success', 'Komentar dihapus');
    }
}