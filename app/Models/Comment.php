<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class Comment extends Model
{
    protected $fillable = [
        'user_id',
        'content_id',
        'parent_id',
        'comment',
        'is_approved',
    ];

    protected $appends = ['likes_count', 'is_liked'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function content()
    {
        return $this->belongsTo(Content::class);
    }

    public function parent()
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_id')
            ->with(['user:id,name,username,avatar'])
            ->withCount('likes')
            ->latest();
    }

    public function likes()
    {
        return $this->hasMany(CommentLike::class);
    }

    public function getLikesCountAttribute()
    {
        // pakai withCount kalau sudah di-eager load, fallback ke query
        if (array_key_exists('likes_count', $this->attributes)) {
            return (int) $this->attributes['likes_count'];
        }

        return $this->likes()->count();
    }

    public function getIsLikedAttribute()
    {
        if (!Auth::check()) {
            return false;
        }

        // kalau relasi likes sudah di-load
        if ($this->relationLoaded('likes')) {
            return $this->likes->contains('user_id', Auth::id());
        }

        return $this->likes()->where('user_id', Auth::id())->exists();
    }
}