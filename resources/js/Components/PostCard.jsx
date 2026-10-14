import { useState, useMemo } from "react";
import { router, useForm } from "@inertiajs/react";
import {
    Heart,
    MessageCircle,
    Send,
    Trash2,
    MessageSquare,
    Reply,
} from "lucide-react";
import RelativeTime from "./RelativeTime";

// Sub-komponen Komentar terpisah untuk kerapihan & performa
function CommentItem({
    comment,
    repliesMap,
    isReply = false,
    authUser,
    isOwner,
    isGroup,
    isMember,
    replyingTo,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onDeleteComment,
    onLikeComment,
    onGoToProfile,
    processing,
}) {
    const [replyText, setReplyText] = useState("");
    const commentLikes = comment.likes_count ?? 0;
    const isCommentLiked = Boolean(comment.is_liked ?? false);
    const canDelete = comment.user_id === authUser?.id || isOwner;
    const children = repliesMap[comment.id] || comment.replies || [];

    const getCommentText = (c) => c?.body || c?.comment || c?.content || "";
    const getAvatarUrl = (user) => {
        if (!user?.avatar) return null;
        return user.avatar.startsWith("http")
            ? user.avatar
            : `/storage/${user.avatar}`;
    };
    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onSubmitReply(comment.id, replyText, () => setReplyText(""));
    };

    return (
        <div className={`flex gap-3 ${isReply ? "ml-6 mt-3" : ""}`}>
            <button
                type="button"
                onClick={() => onGoToProfile(comment.user)}
                className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-xs font-medium text-white shrink-0 overflow-hidden hover:ring-2 hover:ring-emerald-500/40 transition"
            >
                {getAvatarUrl(comment.user) ? (
                    <img
                        src={getAvatarUrl(comment.user)}
                        alt={comment.user?.name || "User"}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    getInitial(comment.user?.name)
                )}
            </button>

            <div className="flex-1 min-w-0">
                <div className="bg-[#0f172a] rounded-xl px-3 py-2">
                    <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                            <button
                                type="button"
                                onClick={() => onGoToProfile(comment.user)}
                                className="text-sm font-medium text-white hover:underline"
                            >
                                {comment.user?.name || "Unknown"}
                            </button>
                            <p className="text-sm text-gray-300 mt-0.5 whitespace-pre-line break-words">
                                {getCommentText(comment)}
                            </p>
                        </div>

                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-red-400 hover:text-red-300 shrink-0 mt-0.5"
                                title="Hapus komentar"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-1.5 px-1">
                    <button
                        type="button"
                        onClick={() => onLikeComment(comment)}
                        className={`flex items-center gap-1 text-xs transition ${
                            isCommentLiked
                                ? "text-red-400"
                                : "text-gray-500 hover:text-red-400"
                        }`}
                    >
                        <Heart
                            size={13}
                            fill={isCommentLiked ? "currentColor" : "none"}
                        />
                        {commentLikes > 0 && <span>{commentLikes}</span>}
                    </button>

                    {!isReply && (isGroup ? isMember : true) && (
                        <button
                            type="button"
                            onClick={() => onStartReply(comment)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 transition"
                        >
                            <Reply size={13} />
                            <span>Balas</span>
                        </button>
                    )}

                    <span className="text-xs text-gray-600">
                        <RelativeTime date={comment.created_at} />
                    </span>
                </div>

                {/* Form Balasan Inline */}
                {replyingTo === comment.id && (
                    <form
                        onSubmit={handleReplySubmit}
                        className="flex gap-2 mt-2 items-center"
                    >
                        <input
                            type="text"
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Balas ${comment.user?.name || ""}...`}
                            className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="text-xs text-gray-500 hover:text-gray-300 px-2 shrink-0"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing || !replyText.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2 rounded-xl transition shrink-0"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                )}

                {/* Render Balasan Berjenjang */}
                {children.map((reply) => (
                    <CommentItem
                        key={reply.id}
                        comment={reply}
                        repliesMap={repliesMap}
                        isReply={true}
                        authUser={authUser}
                        isOwner={isOwner}
                        isGroup={isGroup}
                        isMember={isMember}
                        replyingTo={replyingTo}
                        onStartReply={onStartReply}
                        onCancelReply={onCancelReply}
                        onSubmitReply={onSubmitReply}
                        onDeleteComment={onDeleteComment}
                        onLikeComment={onLikeComment}
                        onGoToProfile={onGoToProfile}
                        processing={processing}
                    />
                ))}
            </div>
        </div>
    );
}

export default function PostCard({
    post,
    group = null,
    isMember = true,
    isOwner = false,
    isAdmin,
    authUser,
    type = "group",
}) {
    const [showComments, setShowComments] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const isGroup = type === "group" && !!group;

    const {
        data,
        setData,
        post: submitComment,
        processing,
        reset,
    } = useForm(
        isGroup
            ? { body: "", parent_id: null }
            : { comment: "", parent_id: null },
    );

    const postBody = post.body || post.paragraph || post.description || "";
    const likesCount = post.likes_count ?? post.likes ?? 0;
    const isLiked = Boolean(post.is_liked ?? post.liked ?? false);
    const comments = post.comments || [];

    // Struktur Tree Komentar
    const { rootComments, repliesMap } = useMemo(() => {
        const map = {};
        const roots = [];

        comments.forEach((c) => {
            if (c.replies?.length) {
                c.replies.forEach((r) => {
                    if (!map[c.id]) map[c.id] = [];
                    if (!map[c.id].some((x) => x.id === r.id))
                        map[c.id].push(r);
                });
            }

            if (c.parent_id) {
                if (!map[c.parent_id]) map[c.parent_id] = [];
                if (!map[c.parent_id].some((x) => x.id === c.id))
                    map[c.parent_id].push(c);
            } else {
                roots.push(c);
            }
        });

        const uniqueRoots = roots.filter(
            (r, i, arr) => arr.findIndex((x) => x.id === r.id) === i,
        );
        return { rootComments: uniqueRoots, repliesMap: map };
    }, [comments]);

    const canDeletePost =
        isGroup &&
        (post.user_id === authUser?.id ||
            post.created_by === authUser?.id ||
            isOwner);

    const getAvatarUrl = (user) => {
        if (!user?.avatar) return null;
        return user.avatar.startsWith("http")
            ? user.avatar
            : `/storage/${user.avatar}`;
    };

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

    const goToProfile = (user) => {
        if (!user) return;
        const username = user.username || post.created_by_username || user.id;
        if (username) router.visit(route("profile.show", username));
    };

    const goToContent = () => {
        if (!post.slug || isGroup) return;
        router.visit(route("mycontent.show", post.slug));
    };

    const startChat = () => {
        if (post.user?.id) router.visit(route("chat.start", post.user.id));
    };

    const handleLike = () => {
        if (isGroup && !isMember) {
            alert("Join grup dulu untuk like.");
            return;
        }
        const routeName = isGroup ? "groups.posts.like" : "content.like";
        const routeParams = isGroup ? [group.id, post.id] : post.slug;
        const options = isGroup
            ? { preserveScroll: true }
            : { preserveScroll: true, only: ["contents"] };

        router.post(route(routeName, routeParams), {}, options);
    };

    const handleLikeComment = (comment) => {
        if (isGroup && !isMember) {
            alert("Join grup dulu untuk like komentar.");
            return;
        }
        const routeName = isGroup
            ? "groups.posts.comments.like"
            : "content.comment.like";
        const routeParams = isGroup
            ? [group.id, post.id, comment.id]
            : [post.slug, comment.id];
        const options = isGroup
            ? { preserveScroll: true }
            : { preserveScroll: true, only: ["contents"] };

        router.post(route(routeName, routeParams), {}, options);
    };

    const handleMainCommentSubmit = (e) => {
        e.preventDefault();
        const text = isGroup ? data.body : data.comment;
        if (!text?.trim()) return;

        const routeName = isGroup ? "groups.posts.comment" : "content.comment";
        const routeParams = isGroup ? [group.id, post.id] : post.slug;

        submitComment(route(routeName, routeParams), {
            preserveScroll: true,
            only: isGroup ? undefined : ["contents"],
            onSuccess: () => {
                reset();
                setShowComments(true);
            },
        });
    };

    const handleReplySubmit = (parentId, replyText, callback) => {
        const payload = isGroup
            ? { body: replyText, parent_id: parentId }
            : { comment: replyText, parent_id: parentId };

        const routeName = isGroup ? "groups.posts.comment" : "content.comment";
        const routeParams = isGroup ? [group.id, post.id] : post.slug;

        router.post(route(routeName, routeParams), payload, {
            preserveScroll: true,
            only: isGroup ? undefined : ["contents"],
            onSuccess: () => {
                setReplyingTo(null);
                if (callback) callback();
            },
        });
    };

    const handleDeleteComment = (commentId) => {
        if (!confirm("Hapus komentar ini?")) return;
        const routeName = isGroup
            ? "groups.posts.comments.destroy"
            : "content.comment.destroy";
        const routeParams = isGroup
            ? [group.id, post.id, commentId]
            : [post.slug, commentId];

        router.delete(route(routeName, routeParams), {
            preserveScroll: true,
            only: isGroup ? undefined : ["contents"],
        });
    };

    const handleDeletePost = () => {
        if (!confirm("Hapus post ini?")) return;
        const routeName = isGroup
            ? "groups.posts.destroy"
            : "mycontent.destroy";
        const routeParams = isGroup ? [group.id, post.id] : post.slug;

        router.delete(route(routeName, routeParams), {
            preserveScroll: true,
            only: isGroup ? undefined : ["contents"],
        });
    };

    return (
        <div className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => goToProfile(post.user)}
                        className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-medium text-white overflow-hidden shrink-0"
                    >
                        {getAvatarUrl(post.user) ? (
                            <img
                                src={getAvatarUrl(post.user)}
                                alt={post.user?.name || "User"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitial(post.user?.name)
                        )}
                    </button>

                    <div>
                        <button
                            type="button"
                            onClick={() => goToProfile(post.user)}
                            className="text-white font-medium text-sm hover:underline text-left"
                        >
                            {post.user?.name || "Unknown"}
                        </button>
                        <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-xs text-gray-500">
                                <RelativeTime date={post.created_at} />
                            </p>
                            {post.user?.id && post.user.id !== authUser?.id && (
                                <button
                                    type="button"
                                    onClick={startChat}
                                    title="Kirim pesan"
                                    className="text-gray-500 hover:text-emerald-400 transition"
                                >
                                    <MessageSquare size={13} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {canDeletePost && (
                    <button
                        type="button"
                        onClick={handleDeletePost}
                        className="text-red-400 hover:text-red-300"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {post.title && (
                <h4
                    onClick={goToContent}
                    className={`text-white font-semibold mb-2 ${
                        !isGroup && post.slug
                            ? "cursor-pointer hover:text-emerald-400 transition"
                            : ""
                    }`}
                >
                    {post.title}
                </h4>
            )}

            <p className="text-gray-300 text-sm whitespace-pre-line mb-4">
                {postBody}
            </p>

            {post.image && (
                <img
                    src={`/storage/${post.image}`}
                    alt={post.title || "post"}
                    className="w-full max-h-[420px] object-cover rounded-xl border border-gray-700 mb-4"
                />
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-5 pt-3 border-t border-gray-700">
                <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 text-sm transition ${
                        isLiked
                            ? "text-red-400"
                            : "text-gray-400 hover:text-red-400"
                    }`}
                >
                    <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
                    <span>{likesCount}</span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowComments(!showComments)}
                    className={`flex items-center gap-1.5 text-sm transition ${
                        showComments
                            ? "text-emerald-400"
                            : "text-gray-400 hover:text-emerald-400"
                    }`}
                >
                    <MessageCircle size={18} />
                    <span>{comments.length}</span>
                </button>
            </div>

            {/* Section Komentar */}
            {showComments && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    {rootComments.length > 0 ? (
                        rootComments.map((comment) => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                repliesMap={repliesMap}
                                authUser={authUser}
                                isOwner={isOwner}
                                isGroup={isGroup}
                                isMember={isMember}
                                replyingTo={replyingTo}
                                onStartReply={(c) => setReplyingTo(c.id)}
                                onCancelReply={() => setReplyingTo(null)}
                                onSubmitReply={handleReplySubmit}
                                onDeleteComment={handleDeleteComment}
                                onLikeComment={handleLikeComment}
                                onGoToProfile={goToProfile}
                                processing={processing}
                            />
                        ))
                    ) : (
                        <p className="text-gray-500 text-sm text-center py-2">
                            Belum ada komentar.
                        </p>
                    )}

                    {(isGroup ? isMember : true) && (
                        <form
                            onSubmit={handleMainCommentSubmit}
                            className="flex gap-2 mt-3"
                        >
                            <input
                                type="text"
                                value={isGroup ? data.body : data.comment}
                                onChange={(e) =>
                                    setData(
                                        isGroup ? "body" : "comment",
                                        e.target.value,
                                    )
                                }
                                placeholder="Tulis komentar..."
                                className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                            />
                            <button
                                type="submit"
                                disabled={
                                    processing ||
                                    !(
                                        isGroup ? data.body : data.comment
                                    )?.trim()
                                }
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
