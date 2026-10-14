<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GroupPostCommentLike extends Model
{
    protected $fillable = [
        'user_id',
        'group_post_comment_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comment()
    {
        return $this->belongsTo(GroupPostComment::class, 'group_post_comment_id');
    }
}