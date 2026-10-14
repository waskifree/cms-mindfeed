<?php


namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'username'        => $this->username,
            'email'           => $this->email,
            'avatar'          => $this->avatar,
            'bio'             => $this->bio,
            'followers_count' => $this->when(isset($this->followers_count), $this->followers_count),
            'following_count' => $this->when(isset($this->following_count), $this->following_count),
            'is_following'    => (bool) ($this->is_following ?? false),

            // Waktu follow (dari pivot)
        'followed_at'     => $this->when(
            $this->pivot?->created_at,
            fn () => $this->pivot->created_at?->toISOString()
        ),
        
        
            ];
    }
}

