import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import {
    UsersRound,
    ArrowLeft,
    Pencil,
    Trash2,
    UserPlus,
    UserMinus,
    Send,
    Search,
} from "lucide-react";
import PostCard from "@/Components/PostCard";

export default function Show({
    group,
    members = [],
    posts = [],
    isMember,
    isOwner,
    filters = {},
}) {
    const { flash, auth } = usePage().props;

    const [memberSearch, setMemberSearch] = useState(
        filters.member_search || "",
    );
    const [postSearch, setPostSearch] = useState(filters.post_search || "");
    const [showInvite, setShowInvite] = useState(false);

    // Form Post
    const {
        data: postData,
        setData: setPostData,
        post: submitPost,
        processing: posting,
        reset: resetPost,
        errors: postErrors,
    } = useForm({
        title: "",
        body: "",
    });

    // Form Invite
    const {
        data: inviteData,
        setData: setInviteData,
        post: submitInvite,
        processing: inviting,
        reset: resetInvite,
        errors: inviteErrors,
    } = useForm({
        username: "",
    });

    const handleDeleteGroup = () => {
        if (confirm("Yakin ingin menghapus grup ini?")) {
            router.delete(route("groups.destroy", group.id));
        }
    };

    const handleJoin = () => router.post(route("groups.join", group.id));

    const handleLeave = () => {
        if (confirm("Yakin ingin keluar dari grup?")) {
            router.post(route("groups.leave", group.id));
        }
    };

    const handleCreatePost = (e) => {
        e.preventDefault();
        submitPost(route("groups.posts.store", group.id), {
            onSuccess: () => resetPost(),
            preserveScroll: true,
        });
    };

    const handleInvite = (e) => {
        e.preventDefault();
        submitInvite(route("groups.invite", group.id), {
            onSuccess: () => {
                resetInvite();
                setShowInvite(false);
            },
        });
    };

    const handleMemberSearch = (e) => {
        e.preventDefault();
        router.get(
            route("groups.show", group.id),
            { member_search: memberSearch, post_search: postSearch },
            { preserveState: true, replace: true },
        );
    };

    const handlePostSearch = (e) => {
        e.preventDefault();
        router.get(
            route("groups.show", group.id),
            { post_search: postSearch, member_search: memberSearch },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={group.name} />

            <div className="py-6">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back */}
                    <Link
                        href={route("groups.index")}
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Groups
                    </Link>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                            {flash.error}
                        </div>
                    )}

                    {/* ===== GROUP HEADER ===== */}
                    <div className="bg-[#1e2937] border border-gray-700 rounded-3xl p-6 sm:p-8 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
                                    {group.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                        {group.name}
                                    </h1>
                                    <p className="text-gray-400 text-sm mt-1">
                                        Dibuat oleh {group.owner?.name}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">
                                        {group.members_count} anggota
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {!isOwner &&
                                    (isMember ? (
                                        <button
                                            onClick={handleLeave}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm"
                                        >
                                            <UserMinus size={16} /> Keluar
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleJoin}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm"
                                        >
                                            <UserPlus size={16} /> Gabung
                                        </button>
                                    ))}

                                {isMember && (
                                    <button
                                        onClick={() =>
                                            setShowInvite(!showInvite)
                                        }
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-sm"
                                    >
                                        <UserPlus size={16} /> Invite
                                    </button>
                                )}

                                {isOwner && (
                                    <>
                                        <Link
                                            href={route(
                                                "groups.edit",
                                                group.id,
                                            )}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-sm"
                                        >
                                            <Pencil size={16} /> Edit
                                        </Link>
                                        <button
                                            onClick={handleDeleteGroup}
                                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm"
                                        >
                                            <Trash2 size={16} /> Hapus
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-gray-300 mt-5 leading-relaxed">
                            {group.description || "Tidak ada deskripsi."}
                        </p>

                        {/* Invite Form */}
                        {showInvite && (
                            <form
                                onSubmit={handleInvite}
                                className="mt-5 flex gap-3"
                            >
                                <input
                                    type="text"
                                    value={inviteData.username}
                                    onChange={(e) =>
                                        setInviteData(
                                            "username",
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Masukkan username..."
                                    className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                                />
                                <button
                                    type="submit"
                                    disabled={inviting}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                                >
                                    Kirim
                                </button>
                            </form>
                        )}
                        {inviteErrors.username && (
                            <p className="text-red-400 text-sm mt-2">
                                {inviteErrors.username}
                            </p>
                        )}
                    </div>

                    {/* ===== CONTENT GRID ===== */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ===== POSTS (kiri) ===== */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Search Post */}
                            <form
                                onSubmit={handlePostSearch}
                                className="relative"
                            >
                                <Search
                                    size={16}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                                <input
                                    type="text"
                                    value={postSearch}
                                    onChange={(e) =>
                                        setPostSearch(e.target.value)
                                    }
                                    placeholder="Cari post di grup ini..."
                                    className="w-full bg-[#1e2937] border border-gray-700 rounded-2xl pl-11 pr-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-500"
                                />
                            </form>

                            {/* Form Create Post (hanya member) */}
                            {isMember && (
                                <form
                                    onSubmit={handleCreatePost}
                                    className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5 space-y-4"
                                >
                                    <h3 className="text-white font-medium">
                                        Buat Post
                                    </h3>
                                    <input
                                        type="text"
                                        value={postData.title}
                                        onChange={(e) =>
                                            setPostData("title", e.target.value)
                                        }
                                        placeholder="Judul post..."
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                    {postErrors.title && (
                                        <p className="text-red-400 text-xs">
                                            {postErrors.title}
                                        </p>
                                    )}
                                    <textarea
                                        value={postData.body}
                                        onChange={(e) =>
                                            setPostData("body", e.target.value)
                                        }
                                        placeholder="Tulis sesuatu..."
                                        rows={3}
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 resize-none"
                                    />
                                    {postErrors.body && (
                                        <p className="text-red-400 text-xs">
                                            {postErrors.body}
                                        </p>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={posting}
                                        className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium disabled:opacity-50"
                                    >
                                        <Send size={16} />
                                        {posting ? "Mengirim..." : "Posting"}
                                    </button>
                                </form>
                            )}

                            {/* List Posts + Like & Comment */}
                            <div className="space-y-4">
                                {posts?.length > 0 ? (
                                    posts.map((post) => (
                                        <PostCard
                                            post={post}
                                            group={group}
                                            isMember={isMember}
                                            isOwner={isOwner}
                                            authUser={auth.user}
                                            type="group"
                                        />
                                    ))
                                ) : (
                                    <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-12 text-center text-gray-500">
                                        {postSearch
                                            ? "Tidak ada post yang cocok."
                                            : "Belum ada post di grup ini."}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ===== MEMBERS (kanan) ===== */}
                        <div className="space-y-4">
                            <div className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5">
                                <h3 className="text-white font-medium mb-4">
                                    Anggota ({group.members_count})
                                </h3>

                                {/* Search Member */}
                                <form
                                    onSubmit={handleMemberSearch}
                                    className="mb-4 relative"
                                >
                                    <Search
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    />
                                    <input
                                        type="text"
                                        value={memberSearch}
                                        onChange={(e) =>
                                            setMemberSearch(e.target.value)
                                        }
                                        placeholder="Cari anggota..."
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-xl pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </form>

                                <div className="space-y-3 max-h-80 overflow-y-auto">
                                    {members.length > 0 ? (
                                        members.map((member) => (
                                            <div
                                                key={member.id}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-sm font-medium text-white">
                                                    {member.name
                                                        ?.charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-medium">
                                                        {member.name}
                                                        {member.id ===
                                                            group.user_id && (
                                                            <span className="ml-1.5 text-xs text-emerald-400">
                                                                (Pemilik)
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        @{member.username}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-sm">
                                            Tidak ditemukan.
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
