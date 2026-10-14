<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Group extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'description',
        'slug',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($group) {
            $group->slug = Str::slug($group->name) . '-' . Str::random(5);
        });
    }

    // Pembuat grup
    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Semua member (termasuk owner)
    public function members()
    {
        return $this->belongsToMany(User::class)
                    ->withPivot('role')
                    ->withTimestamps();
    }

    // Cek apakah user sudah join
    public function isMember($userId)
    {
        return $this->members()->where('user_id', $userId)->exists();
    }

    // Cek apakah user adalah owner
    public function isOwner($userId)
    {
        return $this->user_id === $userId;
    }

    //group posts
        public function posts()
    {
        return $this->hasMany(GroupPost::class)->latest();
    }

    public function invitations()
    {
        return $this->hasMany(GroupInvitation::class);
    }
}