<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupPostLike extends Model
{
    protected $fillable = ['group_post_id', 'user_id'];

    public function post()
    {
        return $this->belongsTo(GroupPost::class, 'group_post_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}