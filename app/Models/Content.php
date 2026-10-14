<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Spatie\Sluggable\HasSlug;
use Spatie\Sluggable\SlugOptions;

class Content extends Model
{
    use HasFactory;
    use HasSlug;

    protected $fillable = [
        'title',
        'slug',
        'visibility',
        'description',
        'paragraph',
        'image',
        'created_by',
        'category_id',
        'type',
        'is_published',
        'order',
        'likes', // denormalized counter (optional)
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'order'        => 'integer',
        'likes'        => 'integer',
    ];

    public function getSlugOptions(): SlugOptions
    {
        return SlugOptions::create()
            ->generateSlugsFrom('title')
            ->saveSlugsTo('slug');
    }

    /**
     * Pakai slug untuk route model binding
     * Contoh: /content/{content} → resolve by slug
     */
    public function getRouteKeyName()
    {
        return 'slug';
    }

    // ======================
    // RELATIONS
    // ======================

    public function user()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Semua komentar (termasuk reply)
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Hanya komentar level-1 (parent)
     */
    public function rootComments()
    {
        return $this->hasMany(Comment::class)
            ->whereNull('parent_id')
            ->with([
                'user:id,name,username,avatar',
                'replies.user:id,name,username,avatar',
                'likes',
                'replies.likes',
            ])
            ->withCount('likes')
            ->latest();
    }

    public function likes()
    {
        return $this->hasMany(Like::class);
    }

    // ======================
    // HELPERS
    // ======================

    public function isLikedBy(?int $userId): bool
    {
        if (!$userId) {
            return false;
        }

        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function isOwnedBy(?int $userId): bool
    {
        return $userId && (int) $this->created_by === (int) $userId;
    }

    /**
     * Cek apakah user boleh melihat konten ini
     */
    public function canBeViewedBy(?User $viewer): bool
    {
        // Owner selalu boleh
        if ($viewer && $this->isOwnedBy($viewer->id)) {
            return true;
        }

        if ($this->visibility === 'public') {
            return true;
        }

        if ($this->visibility === 'private') {
            return false;
        }

        // followers
        if ($this->visibility === 'followers' && $viewer) {
            return $this->user
                ->followers()
                ->where('follower_id', $viewer->id)
                ->exists();
        }

        return false;
    }

    // ======================
    // SCOPES
    // ======================

    /**
     * Scope: konten yang boleh dilihat oleh $viewer
     */
    public function scopeVisibleTo($query, $viewer = null)
    {
        if (!$viewer) {
            return $query->where('visibility', 'public');
        }

        return $query->where(function ($q) use ($viewer) {
            $q->where('visibility', 'public')
                ->orWhere('created_by', $viewer->id)
                ->orWhere(function ($q2) use ($viewer) {
                    $q2->where('visibility', 'followers')
                        ->whereHas('user.followers', function ($f) use ($viewer) {
                            $f->where('follower_id', $viewer->id);
                        });
                });
        });
    }

    /**
     * Scope: hanya konten milik user
     */
    public function scopeOwnedBy($query, $userId)
    {
        return $query->where('created_by', $userId);
    }
}