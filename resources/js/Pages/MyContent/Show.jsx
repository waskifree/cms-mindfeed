import React, { useState, useMemo } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import RelativeTime from "@/Components/RelativeTime";
import { Heart, MessageCircle, Send, Reply, Trash2 } from "lucide-react";

// Sub-komponen Item Komentar & Balasan
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
            className={`flex gap-3 ${isReply ? "ml-8 mt-3 border-l-2 border-gray-700 pl-4" : ""}`}
        >
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                {comment.user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="flex-1 min-w-0">
                <div className="bg-gray-900 rounded-2xl px-4 py-3 border border-gray-700">
                    <div className="flex justify-between items-start gap-2">
                        <div>
                            <span className="font-semibold text-white text-sm">
                                {comment.user?.name || "User"}
                            </span>
                            <p className="text-gray-200 text-sm mt-1 whitespace-pre-line leading-relaxed">
                                {comment.comment || comment.body}
                            </p>
                        </div>
                        {canDelete && (
                            <button
                                type="button"
                                onClick={() => onDeleteComment(comment.id)}
                                className="text-gray-500 hover:text-red-400 transition shrink-0"
                                title="Hapus komentar"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Komentar */}
                <div className="flex items-center gap-4 mt-1.5 px-2">
                    <span className="text-xs text-gray-400">
                        <RelativeTime date={comment.created_at} />
                    </span>

                    {!isReply && (
                        <button
                            type="button"
                            onClick={() => onStartReply(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-400 transition"
                        >
                            <Reply size={13} />
                            <span>Balas</span>
                        </button>
                    )}
                </div>

                {/* Form Balasan Inline */}
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
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                        />
                        <button
                            type="button"
                            onClick={onCancelReply}
                            className="text-xs text-gray-400 hover:text-gray-200 px-2 shrink-0"
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
                    />
                ))}
            </div>
        </div>
    );
}

export default function Show({ contents, auth }) {
    const [replyingTo, setReplyingTo] = useState(null);

    const { data, setData, post, processing, reset } = useForm({
        comment: "",
        parent_id: null,
    });

    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.get(route("mycontent.index"));
        }
    };

    // Mapping Balasan Komentar
    const { rootComments, repliesMap } = useMemo(() => {
        if (!contents?.comments) return { rootComments: [], repliesMap: {} };

        const map = {};
        const roots = [];

        contents.comments.forEach((c) => {
            if (c.parent_id) {
                if (!map[c.parent_id]) map[c.parent_id] = [];
                map[c.parent_id].push(c);
            } else {
                roots.push(c);
            }
        });

        return { rootComments: roots, repliesMap: map };
    }, [contents?.comments]);

    if (!contents) {
        return (
            <AuthenticatedLayout>
                <div className="p-10 text-center text-gray-400">
                    Loading konten...
                </div>
            </AuthenticatedLayout>
        );
    }

    const isLiked = Boolean(contents.is_liked || contents.liked);

    const handleLike = () => {
        router.post(
            route("content.like", contents.slug),
            {},
            { preserveScroll: true },
        );
    };

    const handleMainComment = (e) => {
        e.preventDefault();
        if (!data.comment.trim()) return;

        post(route("content.comment", contents.slug), {
            preserveScroll: true,
            onSuccess: () => reset("comment"),
        });
    };

    const handleReplySubmit = (parentId, replyText, clearCallback) => {
        router.post(
            route("content.comment", contents.slug),
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
            route("content.comment.destroy", [contents.slug, commentId]),
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={contents.title} />

            <div className="py-10 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gray-900 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-700 flex justify-between items-center bg-warm-black">
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                {contents.title}
                            </h1>
                            <div className="flex gap-3">
                                <button
                                    onClick={goBack}
                                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-5 py-2.5 rounded-2xl transition font-medium"
                                >
                                    Kembali
                                </button>
                            </div>
                        </div>

                        {/* Konten Detail */}
                        <div className="p-8 space-y-8 bg-warm-black">
                            {/* Deskripsi */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                                    Deskripsi
                                </h3>
                                <p className="text-gray-200 leading-relaxed">
                                    {contents.description ||
                                        "Tidak ada deskripsi"}
                                </p>
                            </div>

                            {/* Kategori */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-2">
                                    Kategori
                                </h3>
                                <span className="inline-block bg-gray-900 text-emerald-400 px-4 py-1.5 rounded-2xl text-sm font-medium border border-gray-700">
                                    {contents.category?.name || "Uncategorized"}
                                </span>
                            </div>

                            {/* Isi Konten */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 mb-3">
                                    Isi Konten
                                </h3>
                                <div className="prose prose-invert max-w-none bg-gray-900 border border-gray-700 rounded-2xl p-8 text-gray-200 leading-relaxed">
                                    {contents.paragraph}
                                </div>
                            </div>

                            {/* Gambar */}
                            {contents.image && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-400 mb-3">
                                        Gambar
                                    </h3>
                                    <img
                                        src={`/storage/${contents.image}`}
                                        alt={contents.title}
                                        className="max-w-full rounded-2xl shadow-xl border border-gray-700"
                                    />
                                </div>
                            )}

                            {/* Metadata */}
                            <div className="pt-6 border-t border-gray-700 text-xs text-gray-400">
                                Dibuat pada{" "}
                                <RelativeTime date={contents.created_at} />{" "}
                                <br />
                                Terakhir diperbarui{" "}
                                <RelativeTime date={contents.updated_at} />
                            </div>

                            {/* Bar Action (Like & Comment Counts) */}
                            <div className="pt-6 border-t border-gray-700 flex items-center gap-6">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center gap-2 text-lg transition ${
                                        isLiked
                                            ? "text-red-500"
                                            : "text-gray-400 hover:text-red-400"
                                    }`}
                                >
                                    <Heart
                                        size={22}
                                        fill={isLiked ? "currentColor" : "none"}
                                    />
                                    <span className="font-semibold text-white">
                                        {contents.likes || 0}
                                    </span>
                                </button>

                                <div className="flex items-center gap-2 text-lg text-gray-400">
                                    <MessageCircle size={22} />
                                    <span className="font-semibold text-white">
                                        {contents.comments?.length || 0}
                                    </span>
                                </div>
                            </div>

                            {/* Section Komentar & Reply */}
                            <div className="pt-6 border-t border-gray-700">
                                <h3 className="text-xl font-semibold text-white mb-6">
                                    💬 Komentar (
                                    {contents.comments?.length || 0})
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
                                        className="w-full bg-gray-900 border border-gray-700 rounded-2xl p-4 text-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none text-sm"
                                        rows="3"
                                        placeholder="Tulis komentar Anda..."
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

                                {/* List Komentar & Balasan */}
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
                                            />
                                        ))
                                    ) : (
                                        <p className="text-gray-400 italic text-center py-6 text-sm">
                                            Belum ada komentar.
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
