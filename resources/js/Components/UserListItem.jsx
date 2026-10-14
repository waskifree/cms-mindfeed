import { Link, router, usePage } from "@inertiajs/react";
import RelativeTime from "@/Components/RelativeTime"; // sesuaikan path-nya

export default function UserListItem({ user, type = "search" }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;
    const isOwnProfile = currentUserId === user.id;

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

    const handleToggleFollow = (e) => {
        e.preventDefault();
        e.stopPropagation();

        router.post(
            `/profile/${user.username}/toggle-follow`,
            {},
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const getButtonConfig = () => {
        if (type === "following") {
            return {
                text: "Unfollow",
                className:
                    "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
            };
        }

        if (type === "followers") {
            return user.is_following
                ? {
                      text: "✓ Following",
                      className:
                          "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
                  }
                : {
                      text: "Follow",
                      className: "bg-white hover:bg-gray-100 text-black",
                  };
        }

        // search / default
        return user.is_following
            ? {
                  text: "✓ Following",
                  className:
                      "bg-gray-700 hover:bg-gray-600 text-white border border-gray-600",
              }
            : {
                  text: "Follow",
                  className: "bg-white hover:bg-gray-100 text-black",
              };
    };

    const button = getButtonConfig();

    return (
        <div className="flex items-center justify-between gap-4 bg-[#1E2937] border border-gray-700 hover:border-emerald-500/50 rounded-2xl p-4 transition-all duration-300">
            {/* Kiri: Avatar + Info */}
            <Link
                href={route("profile.show", user.username)}
                className="flex items-center gap-4 flex-1 min-w-0"
            >
                {user.avatar ? (
                    <img
                        src={`/storage/${user.avatar}`}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white shrink-0">
                        {getInitial(user.name)}
                    </div>
                )}

                <div className="min-w-0">
                    <h3 className="font-semibold text-white truncate">
                        {user.name}
                    </h3>
                    <p className="text-gray-400 text-sm truncate">
                        @{user.username}
                    </p>

                    {/* Waktu follow */}
                    {user.followed_at && (
                        <p className="text-xs text-gray-500 mt-0.5">
                            <RelativeTime date={user.followed_at} />
                        </p>
                    )}
                </div>
            </Link>

            {/* Tombol Follow / Unfollow */}
            {!isOwnProfile && auth?.user && (
                <button
                    onClick={handleToggleFollow}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 shrink-0 ${button.className}`}
                >
                    {button.text}
                </button>
            )}
        </div>
    );
}
