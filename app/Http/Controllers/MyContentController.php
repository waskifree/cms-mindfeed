<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class MyContentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $search = $request->get('search');
        $user   = Auth::user();

        $contents = Content::with([
            'category',
            'user:id,name,username,avatar',
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
            ->visibleTo($user)
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'LIKE', "%{$search}%")
                        ->orWhere('description', 'LIKE', "%{$search}%")
                        ->orWhere('paragraph', 'LIKE', "%{$search}%")
                        ->orWhereHas('user', function ($u) use ($search) {
                            $u->where('name', 'LIKE', "%{$search}%")
                                ->orWhere('username', 'LIKE', "%{$search}%");
                        })
                        ->orWhereHas('category', function ($c) use ($search) {
                            $c->where('name', 'LIKE', "%{$search}%");
                        });
                });
            })
            ->withCount('likes')
            ->latest()
            ->get()
            ->map(function ($content) use ($user) {
                $content->is_liked = $content->likes()
                    ->where('user_id', $user->id)
                    ->exists();
                return $content;
            });

        return Inertia::render('MyContent/Index', [
            'contents'   => $contents,
            'visibleTo'  => [
                'public'    => 'Public',
                'followers' => 'Followers',
                'private'   => 'Private',
            ],
            'categories' => Category::all(),
            'filters'    => [
                'search' => $search,
            ],
        ]);
    }


    public function create()
    {
        return Inertia::render('MyContent/Create', [
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
            ->route('mycontent.index')
            ->with('success', 'Content created successfully.');
    }

    public function show($slug)
    {
        $user = Auth::user();
        $content = Content::with([
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
            ->where('slug', $slug)
            ->firstOrFail();

        if (!$content->canBeViewedBy($user)) {
            abort(403, 'Anda tidak memiliki akses untuk melihat konten ini.');
        }

        $content->is_liked    = $content->likes()->where('user_id', $user->id)->exists();
        $content->likes_count = $content->likes()->count();

        return Inertia::render('MyContent/Show', [
            'contents' => $content,
        ]);
    }

    public function edit($slug)
    {
        
        $content = Content::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();    
        return Inertia::render('MyContent/Edit', [
            'content'    => $content,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, $slug)
    {
        $content = Content::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->firstOrFail();

         $this->authorize('update', $content);

        $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'paragraph'   => 'required|string',
            'category_id' => 'nullable|exists:categories,id',
            'visibility'  => 'required|in:public,followers,private',
            'image'       => 'nullable|image|max:2048',
        ]);

        $content->title       = $request->title;
        $content->description = $request->description;
        $content->paragraph   = $request->paragraph;
        $content->category_id = $request->category_id;
        $content->visibility  = $request->visibility;

        if ($request->hasFile('image')) {
            if ($content->image && Storage::disk('public')->exists($content->image)) {
                Storage::disk('public')->delete($content->image);
            }

            $path = $request->file('image')->store('images', 'public');
            $content->image = $path;
        }

        $content->save();

        return redirect()
            ->route('mycontent.index')
            ->with('success', 'Konten berhasil diupdate');
    }

    public function destroy(Content $content, $slug)
    {
        $content = Content::where('slug', $slug)
            ->where('created_by', Auth::id())
            ->first();   // ← wajib ditambahkan

        // Jika tidak ditemukan
        if (!$content) {
            return redirect()
                ->back()
                ->with('error', 'Konten tidak ditemukan atau Anda tidak memiliki akses.');
        }

        // Hapus gambar jika ada
        if ($content->image && Storage::disk('public')->exists($content->image)) {
            Storage::disk('public')->delete($content->image);
        }

        $content->forceDelete();

        return redirect()
            ->back()
            ->with('success', 'Konten berhasil dihapus.');
    }
    
}