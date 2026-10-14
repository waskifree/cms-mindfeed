<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

#[Fillable([
    'name',
    'email',
    'username',
    'password',
    'avatar',
    'bio',
    'is_dnd',
    'allow_non_follower_chats',
])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;
    use HasRoles;

    protected $appends = ['is_admin'];

    protected function casts(): array
    {
        return [
            'email_verified_at'        => 'datetime',
            'password'                 => 'hashed',
            'is_dnd'                   => 'boolean',
            'allow_non_follower_chats' => 'boolean',
        ];
    }

    public function contents()
    {
        return $this->hasMany(Content::class, 'created_by');
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->isAdmin();
    }

    // ===================== FOLLOW =====================
    public function following()
    {
        return $this->belongsToMany(
            User::class,
            'follows',
            'follower_id',
            'followed_id'
        )->withTimestamps();
    }

    public function followers()
    {
        return $this->belongsToMany(
            User::class,
            'follows',
            'followed_id',
            'follower_id'
        )->withTimestamps();
    }

    public function isFollowing($user)
    {
        return $this->following()->where('followed_id', $user->id)->exists();
    }

    public function followCount()
    {
        return $this->following()->count();
    }

    public function followerCount()
    {
        return $this->followers()->count();
    }

    // ===================== GROUP =====================
    public function groups()
    {
        return $this->belongsToMany(Group::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function ownedGroups()
    {
        return $this->hasMany(Group::class);
    }

    // ===================== CHAT =====================
    public function conversations()
    {
        return $this->belongsToMany(Conversation::class)
            ->withPivot(['last_read_at', 'is_hidden'])
            ->withTimestamps();
    }
}