<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class GroupPostComment extends Model
{
    protected $fillable = [
        'group_post_id',
        'user_id',
        'parent_id',
        'body',
    ];

    protected $appends = ['likes_count', 'is_liked'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function post()
    {
        return $this->belongsTo(GroupPost::class, 'group_post_id');
    }

    public function parent()
    {
        return $this->belongsTo(GroupPostComment::class, 'parent_id');
    }

    public function replies()
    {
        return $this->hasMany(GroupPostComment::class, 'parent_id')
            ->with(['user:id,name,username,avatar'])
            ->withCount('likes')
            ->latest();
    }

    public function likes()
    {
        return $this->hasMany(GroupPostCommentLike::class);
    }

    public function getLikesCountAttribute()
    {
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

        if ($this->relationLoaded('likes')) {
            return $this->likes->contains('user_id', Auth::id());
        }

        return $this->likes()->where('user_id', Auth::id())->exists();
    }
    
}