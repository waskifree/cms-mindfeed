import { Head, Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PostCard from "@/Components/PostCard";
import { MessageCircle } from "lucide-react";

export default function Show() {
    const { user, contents = [], isOwnProfile, auth } = usePage().props;

    const handleToggleFollow = () => {
        // Optimistic update dulu biar tombol langsung berubah
        const newIsFollowing = !user.is_following;

        router.post(
            `/profile/${user.username}/toggle-follow`,
            {},
            {
                preserveScroll: true,
                // Jangan pakai preserveState: true kalau ingin props terupdate
                onSuccess: () => {
                    // Biar lebih aman, bisa force update
                },
                // Optional: rollback kalau gagal
                onError: () => {
                    // bisa kasih toast error
                },
            },
        );
    };

    const handleStartChat = () => {
        router.get(route("chat.start", user.id));
    };

    const isAdmin = auth?.user?.isAdmin === true;

    return (
        <AuthenticatedLayout>
            <Head title={`Profil ${user.name}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Profil Header */}
                    <div className="bg-[#1e2937] shadow-sm rounded-2xl p-8 mb-8 border border-gray-700">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-28 h-28 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-5xl shadow overflow-hidden">
                                    {user.avatar ? (
                                        <img
                                            src={`/storage/${user.avatar}`}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        "👤"
                                    )}
                                </div>

                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-bold text-white">
                                        {user.name}
                                    </h1>

                                    {user.username && (
                                        <p className="text-emerald-400 mt-1">
                                            @{user.username}
                                        </p>
                                    )}

                                    <p className="text-gray-400 mt-1">
                                        {user.email}
                                    </p>

                                    {/* Bio */}
                                    {user.bio && (
                                        <p className="text-gray-300 mt-3 max-w-xl leading-relaxed">
                                            {user.bio}
                                        </p>
                                    )}

                                    {/* Stats */}
                                    <div className="flex gap-6 mt-4 text-sm justify-center md:justify-start">
                                        <div
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        "profile.followers",
                                                        user.username,
                                                    ),
                                                )
                                            }
                                        >
                                            <a
                                                href={`/profile/${user.username}/followers`}
                                                className="font-semibold text-white text-lg hover:text-blue-400 transition"
                                            >
                                                {user.followers_count || 0}
                                            </a>
                                            <span className="text-gray-400 ml-1">
                                                Followers
                                            </span>
                                        </div>
                                        <div
                                            onClick={() =>
                                                router.get(
                                                    route(
                                                        "profile.following",
                                                        user.username,
                                                    ),
                                                )
                                            }
                                        >
                                            <a
                                                href={`/profile/${user.username}/following`}
                                                className="font-semibold text-white text-lg hover:text-blue-400 transition"
                                            >
                                                {user.following_count || 0}
                                            </a>
                                            <span className="text-gray-400 ml-1">
                                                Following
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                {!isOwnProfile && auth?.user && (
                                    <>
                                        <button
                                            onClick={handleToggleFollow}
                                            className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 text-sm uppercase tracking-wider ${
                                                user.is_following
                                                    ? "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                                    : "bg-white hover:bg-gray-100 text-black"
                                            }`}
                                        >
                                            {user.is_following
                                                ? "✓ Following"
                                                : "Follow"}
                                        </button>

                                        <button
                                            onClick={handleStartChat}
                                            className="px-6 py-3 rounded-full font-semibold transition-all duration-200 text-sm uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2"
                                        >
                                            <MessageCircle size={18} />
                                            Chat
                                        </button>
                                    </>
                                )}

                                {isOwnProfile && (
                                    <Link
                                        href={route("profile.edit")}
                                        className="px-6 py-3 bg-slate-700 hover:bg-slate-900 text-white rounded-full transition"
                                    >
                                        ✏️ Edit Profil
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Konten pakai PostCard */}
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-200">
                                Konten {user.name} ({contents.length})
                            </h2>

                            {isOwnProfile && (
                                <Link
                                    href={route(
                                        isAdmin
                                            ? "content.create"
                                            : "mycontent.create",
                                    )}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition text-sm font-medium"
                                >
                                    + Create Content
                                </Link>
                            )}
                        </div>

                        {contents.length > 0 ? (
                            <div className="grid grid-cols-1 gap-5">
                                {contents.map((content) => (
                                    <PostCard
                                        key={content.id || content.slug}
                                        post={content}
                                        authUser={auth?.user}
                                        type="content"
                                        isAdmin={isAdmin}
                                        isMember={true}
                                        isOwner={
                                            content.user_id ===
                                                auth?.user?.id ||
                                            content.created_by ===
                                                auth?.user?.id
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-16 text-center text-gray-500">
                                {user.name} belum membuat konten apapun.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
