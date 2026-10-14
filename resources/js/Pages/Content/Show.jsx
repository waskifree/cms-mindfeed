import React, { useState, useMemo } from "react";
import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GoBack from "@/Components/goBack";
import { Heart, MessageCircle, Send, Reply, Trash2 } from "lucide-react";
import RelativeTime from "@/Components/RelativeTime";

// Sub-komponen Komentar agar mendukung balasan berjenjang
function CommentItem({
    comment,
    repliesMap,
    isReply = false,
    authUser,
    replyingTo,
    onStartReply,
    onCancelReply,
    onSubmitReply,
    onDeleteComment,
    slug,
}) {
    const [replyText, setReplyText] = useState("");
    const children = repliesMap[comment.id] || comment.replies || [];
    const canDelete = comment.user_id === authUser?.id || authUser?.isAdmin;

    const handleReplySubmit = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        onSubmitReply(comment.id, replyText, () => setReplyText(""));
    };

    return (
        <div
            className={`flex gap-3 ${isReply ? "ml-8 mt-3 border-l-2 border-slate-700 pl-4" : ""}`}
        >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-[#0f172a] rounded-2xl px-4 py-3 border border-slate-800">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <span className="font-semibold text-white text-sm">
                                {comment.user?.name || "User"}
                            </span>
                            <p className="text-slate-300 text-sm mt-1 whitespace-pre-line leading-relaxed">
                                {comment.comment || comment.body}
                            </p>
                        </div>
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-slate-500 hover:text-red-400 transition shrink-0"
                                title="Hapus komentar"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Komentar */}
                <div className="flex items-center gap-4 mt-1.5 px-2">
                    <span className="text-xs text-slate-500">
                        <RelativeTime date={comment.created_at} />
                    </span>

                    {!isReply && (
                        <button
                            type="button"
                            onClick={() => onStartReply(comment.id)}
                            className="flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition"
                        >
                            <Reply size={13} />
                            <span>Balas</span>
                        </button>
                    )}
                </div>

                {/* Form Input Balasan Inline */}
                {replyingTo === comment.id && (
                    <form
                        onSubmit={handleReplySubmit}
                        className="flex gap-2 mt-3 items-center"
                    >
                        <input
                            type="text"
                            autoFocus
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={`Balas ${comment.user?.name || ""}...`}
                            className="flex-1 bg-[#0f172a] border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="text-xs text-slate-400 hover:text-slate-200 px-2 shrink-0"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white p-2 rounded-xl transition shrink-0"
                        >
                            <Send size={15} />
                        </button>
                    </form>
                )}

                {/* Render Balasan Rekursif */}
                {children.map((reply) => (
                    <CommentItem
                        key={reply.id}
                        comment={reply}
                        repliesMap={repliesMap}
                        isReply={true}
                        authUser={authUser}
                        replyingTo={replyingTo}
                        onStartReply={onStartReply}
                        onCancelReply={onCancelReply}
                        onSubmitReply={onSubmitReply}
                        onDeleteComment={onDeleteComment}
                        slug={slug}
                    />
                ))}
            </div>
        </div>
    );
}

export default function Show() {
    const { content, auth } = usePage().props;
    const [replyingTo, setReplyingTo] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        comment: "",
        parent_id: null,
    });

    // Memetakan balasan ke parent-nya masing-masing
    const { rootComments, repliesMap } = useMemo(() => {
        if (!content?.comments) return { rootComments: [], repliesMap: {} };

        const map = {};
        const roots = [];

        content.comments.forEach((c) => {
            if (c.parent_id) {
                if (!map[c.parent_id]) map[c.parent_id] = [];
                map[c.parent_id].push(c);
            } else {
                roots.push(c);
            }
        });

        return { rootComments: roots, repliesMap: map };
    }, [content?.comments]);

    if (!content) {
        return (
            <AuthenticatedLayout>
                <div className="p-10 text-center text-gray-400">
                    Loading konten...
                </div>
            </AuthenticatedLayout>
        );
    }

    const handleLike = () => {
        router.post(
            route("content.like", content.slug),
            {},
            { preserveScroll: true },
        );
    };

    const handleMainComment = (e) => {
        e.preventDefault();
        if (!data.comment.trim()) return;

        post(route("content.comment", content.slug), {
            preserveScroll: true,
            onSuccess: () => reset("comment"),
        });
    };

    const handleReplySubmit = (parentId, replyText, clearCallback) => {
        router.post(
            route("content.comment", content.slug),
            { comment: replyText, parent_id: parentId },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setReplyingTo(null);
                    if (clearCallback) clearCallback();
                },
            },
        );
    };

    const handleDeleteComment = (commentId) => {
        if (!confirm("Hapus komentar ini?")) return;
        router.delete(
            route("content.comment.destroy", [content.slug, commentId]),
            {
                preserveScroll: true,
            },
        );
    };

    const isLiked = Boolean(content.is_liked || content.liked);

    return (
        <AuthenticatedLayout>
            <Head title={content.title} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-6 lg:px-8">
                    <div className="bg-[#1e2937] border border-slate-700 rounded-3xl overflow-hidden shadow-xl">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-700 flex justify-between items-center">
                            <h1 className="text-3xl font-bold text-white">
                                {content.title}
                            </h1>
                            <div className="flex gap-3">
                                {auth?.user?.isAdmin && (
                                    <Link
                                        href={`/content/${content.slug}/edit`}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white m-auto px-6 py-3 rounded-xl transition"
                                    >
                                        Edit
                                    </Link>
                                )}
                                <GoBack />
                            </div>
                        </div>

                        {/* Detail Konten */}
                        <div className="p-8 space-y-8">
                            {/* Kategori */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-2">
                                    Kategori
                                </h3>
                                <span className="inline-block bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full text-sm font-medium">
                                    {content.category?.name || "Uncategorized"}
                                </span>
                            </div>

                            {/* Isi Konten */}
                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-3">
                                    Isi Konten
                                </h3>
                                <div className="prose prose-invert max-w-none bg-[#0f172a] border border-slate-700 rounded-2xl p-8 text-slate-200 leading-relaxed">
                                    {content.paragraph}
                                </div>
                            </div>

                            {/* Gambar */}
                            {content.image && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-400 mb-3">
                                        Gambar
                                    </h3>
                                    <img
                                        src={`/storage/${content.image}`}
                                        alt={content.title}
                                        className="max-w-full rounded-2xl shadow-2xl border border-slate-700"
                                    />
                                </div>
                            )}

                            {/* Action Bar (Like & Comment Bar) di Bawah Konten */}
                            <div className="pt-6 border-t border-slate-700 flex items-center gap-6">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 text-lg transition ${
                                        isLiked
                                            ? "text-red-500"
                                            : "text-slate-400 hover:text-red-400"
                                    }`}
                                >
                                    <Heart
                                        size={22}
                                        fill={isLiked ? "currentColor" : "none"}
                                    />
                                    <span className="font-semibold text-white">
                                        {content.likes || 0}
                                    </span>
                                </button>

                                <div className="flex items-center gap-2 text-lg text-slate-400">
                                    <MessageCircle size={22} />
                                    <span className="font-semibold text-white">
                                        {content.comments?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Section Komentar */}
                            <div className="pt-6 border-t border-slate-700">
                                <h3 className="text-xl font-semibold text-white mb-6">
                                    💬 Komentar ({content.comments?.length || 0}
                                    )
                                </h3>

                                {/* Form Komentar Utama */}
                                <form
                                    onSubmit={handleMainComment}
                                    className="mb-8"
                                >
                                    <textarea
                                        value={data.comment}
                                        onChange={(e) =>
                                            setData("comment", e.target.value)
                                        }
                                        className="w-full bg-[#0f172a] border border-slate-600 rounded-2xl p-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none text-sm"
                                        rows="3"
                                        placeholder="Tulis komentar anda..."
                                    />
                                    <button
                                        type="submit"
                                        disabled={
                                            processing || !data.comment.trim()
                                        }
                                        className="mt-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        <span>Kirim Komentar</span>
                                    </button>
                                </form>

                                {/* List Komentar */}
                                <div className="space-y-4">
                                    {rootComments.length > 0 ? (
                                        rootComments.map((comment) => (
                                            <CommentItem
                                                key={comment.id}
                                                comment={comment}
                                                repliesMap={repliesMap}
                                                authUser={auth?.user}
                                                replyingTo={replyingTo}
                                                onStartReply={(id) =>
                                                    setReplyingTo(id)
                                                }
                                                onCancelReply={() =>
                                                    setReplyingTo(null)
                                                }
                                                onSubmitReply={
                                                    handleReplySubmit
                                                }
                                                onDeleteComment={
                                                    handleDeleteComment
                                                }
                                                slug={content.slug}
                                            />
                                        ))
                                    ) : (
                                        <p className="text-slate-400 italic text-center py-6 text-sm">
                                            Belum ada komentar. Jadilah yang
                                            pertama!
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
