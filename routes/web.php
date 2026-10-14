    <?php

    use App\Http\Controllers\ProfileController;
    use App\Http\Controllers\ContentController;
    use App\Http\Controllers\MyContentController;
    use App\Http\Controllers\CategoryController;
    use Illuminate\Foundation\Application;
    use Illuminate\Support\Facades\Route;
    use App\Http\Controllers\DashboardController;
    use App\Http\Controllers\GroupController;
    use App\Http\Controllers\NoteController;
    use App\Http\Controllers\ChatController;
    use App\Http\Controllers\FollowController;
    use Inertia\Inertia;
    use Inertia\Response;
  

    Route::get('/', function () {
        return Inertia::render('Welcome', [
            'canLogin' => Route::has('login'),
            'canRegister' => Route::has('register'),
            'laravelVersion' => Application::VERSION,
            'phpVersion' => PHP_VERSION,
        ]);
    });



    // Dashboard dengan Controller
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware(['auth', 'verified'])
        ->name('dashboard');

    Route::middleware('auth')->group(function () {
        Route::get('/dashboard/friends', [DashboardController::class, 'DashFriends'])
            ->name('dashboard.friends');
        // Profil Publik
        Route::get('/profile/{user:username}', [ProfileController::class, 'show'])
            ->name('profile.show');

        // 2. Route Daftar User 
        Route::get('/users', [ProfileController::class, 'index'])
            ->name('users.index');

        // 3. Route Edit Profil Breeze 
        Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

        // 4. Route Follow/Unfollow
        Route::post('/profile/{user:username}/follow', [ProfileController::class, 'follow'])->name('profile.follow');
        Route::post('/profile/{user:username}/unfollow', [ProfileController::class, 'unfollow'])->name('profile.unfollow');
        Route::post('/profile/{user:username}/toggle-follow', [FollowController::class, 'toggleFollow'])
            ->name('profile.toggle-follow');

        Route::get('/profile/{user:username}/followers', [ProfileController::class, 'followers'])->name('profile.followers');
        Route::get('/profile/{user:username}/following', [ProfileController::class, 'following'])->name('profile.following');

        Route::post('/content/{content:slug}/like', [ContentController::class, 'like'])->name('content.like');
        Route::post('/content/{content:slug}/comment', [ContentController::class, 'comment'])->name('content.comment');

        // 5. Route notes
        Route::get('/notes', [NoteController::class, 'index'])
            ->name('notes.index');

        // 6. Route Group
    Route::resource('groups', GroupController::class);

        // Join / Leave
        Route::post('/groups/{group}/join', [GroupController::class, 'join'])->name('groups.join');
        Route::post('/groups/{group}/leave', [GroupController::class, 'leave'])->name('groups.leave');

        // Invite
        Route::post('/groups/{group}/invite', [GroupController::class, 'invite'])->name('groups.invite');
        Route::post('/groups/invitations/{invitation}/accept', [GroupController::class, 'acceptInvitation'])->name('groups.invitations.accept');
        Route::post('/groups/invitations/{invitation}/reject', [GroupController::class, 'rejectInvitation'])->name('groups.invitations.reject');

        // Group Posts
        Route::post('/groups/{group}/posts', [GroupController::class, 'storePost'])->name('groups.posts.store');
        Route::delete('/groups/{group}/posts/{post}', [GroupController::class, 'destroyPost'])->name('groups.posts.destroy');

        // Like & Comment Group Post
        Route::post('/groups/{group}/posts/{post}/like', [GroupController::class, 'likePost'])
            ->name('groups.posts.like');

        Route::post('/groups/{group}/posts/{post}/comment', [GroupController::class, 'commentPost'])
            ->name('groups.posts.comment');

        Route::delete('/groups/{group}/posts/{post}/comments/{comment}', [GroupController::class, 'destroyComment'])
        ->name('groups.posts.comments.destroy');
        // ========== CONTENT ==========
        // Like post
        Route::post('/content/{content}/like', [ContentController::class, 'like'])
            ->name('content.like');

        // Comment / Reply
        Route::post('/content/{content}/comment', [ContentController::class, 'comment'])
            ->name('content.comment');

        // Like Comment
        Route::post('/content/{content}/comment/{comment}/like', [ContentController::class, 'likeComment'])
            ->name('content.comment.like');

        // Delete Comment
        Route::delete('/content/{content}/comment/{comment}', [ContentController::class, 'destroyComment'])
            ->name('content.comment.destroy');


        // ========== GROUP ==========
        // Like post
        Route::post('/groups/{group}/posts/{post}/like', [GroupController::class, 'likePost'])
            ->name('groups.posts.like');

        // Comment / Reply
        Route::post('/groups/{group}/posts/{post}/comment', [GroupController::class, 'commentPost'])
            ->name('groups.posts.comment');

        // Like Comment
        Route::post('/groups/{group}/posts/{post}/comments/{comment}/like', [GroupController::class, 'likeComment'])
            ->name('groups.posts.comments.like');

        // Delete Comment
        Route::delete('/groups/{group}/posts/{post}/comments/{comment}', [GroupController::class, 'destroyComment'])
            ->name('groups.posts.comments.destroy');

    
    
       
        Route::middleware('auth')->prefix('chat')->name('chat.')->group(function () {
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('/start/{user}', [ChatController::class, 'start'])->name('start');
        Route::get('/{conversation}', [ChatController::class, 'show'])->name('show');
        Route::post('/{conversation}/messages', [ChatController::class, 'store'])
        ->name('store');

        Route::post('/{conversation}/toggle-hide', [ChatController::class, 'toggleHide'])
        ->name('toggle-hide');

        Route::post('/toggle-allow-non-follower', [ChatController::class, 'toggleAllowNonFollower'])
            ->name('toggle-allow-non-follower');

        Route::post('/toggle-dnd', [ChatController::class, 'toggleDnd'])
            ->name('toggle-dnd');
});


        Route::middleware(['auth', 'role:admin'])->group(function () {
            Route::resource('content', ContentController::class)->except(['show']); 
            Route::resource('category', CategoryController::class);
            Route::get('/category/{category:slug}', [CategoryController::class, 'show'])->name('category.show');
        });

        Route::get('/content/{slug}', [ContentController::class, 'show'])
                ->name('content.show');

       Route::middleware(['auth', 'role:user'])->group(function () {
       Route::resource('mycontent', MyContentController::class)
        ->parameters(['mycontent' => 'slug']);   // ← tambahkan ini
        });
    });

    require __DIR__.'/auth.php';
