<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupPost extends Model
{
    protected $fillable = ['group_id', 'user_id', 'title', 'body'];

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    //group post comments
    public function likes()
    {
        return $this->hasMany(GroupPostLike::class);
    }

    public function comments()
    {
        return $this->hasMany(GroupPostComment::class)->latest();
    }

    public function isLikedBy($userId)
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }
}