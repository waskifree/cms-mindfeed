import React, { useState, useMemo } from "react";
import { usePage, Head, Link, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import RelativeTime from "@/Components/RelativeTime";
import { Search, UsersRound, Heart, MessageCircle, Send } from "lucide-react";
import PostCard from "@/Components/PostCard";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function Dashboard() {
    const { auth, contents = [], joinedGroups = [] } = usePage().props;
    const user = auth?.user || {};

    // Ambil array yang benar (support pagination)
    const contentList = contents.data ?? contents;
    const nextPageUrl = contents.next_page_url ?? null;

    const [activeFilter, setActiveFilter] = useState("all");
    const [groupSearch, setGroupSearch] = useState("");
    const [openComments, setOpenComments] = useState({});
    const [commentInputs, setCommentInputs] = useState({});
    const [likingId, setLikingId] = useState(null);
    const [commentingId, setCommentingId] = useState(null);

    // === FILTER YANG BENAR ===
    const filteredContents = useMemo(() => {
        if (activeFilter === "all") return contentList;
        return contentList.filter((c) => c.visibility === activeFilter);
    }, [contentList, activeFilter]);

    // === COUNT YANG BENAR (pakai contentList) ===
    const filterButtons = [
        { key: "all", label: "Semua", count: contentList.length },
        {
            key: "public",
            label: "Public",
            count: contentList.filter((c) => c.visibility === "public").length,
        },
        {
            key: "followers",
            label: "Followers",
            count: contentList.filter((c) => c.visibility === "followers")
                .length,
        },
        {
            key: "private",
            label: "Private",
            count: contentList.filter((c) => c.visibility === "private").length,
        },
    ];

    const filteredGroups = useMemo(() => {
        const keyword = groupSearch.toLowerCase().trim();
        if (!keyword) return joinedGroups;
        return joinedGroups.filter(
            (g) =>
                g.name?.toLowerCase().includes(keyword) ||
                g.description?.toLowerCase().includes(keyword),
        );
    }, [joinedGroups, groupSearch]);

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";
    const getCommentText = (c) => c?.comment || c?.body || c?.content || "";

    const handleLike = (content) => {
        if (!content?.slug || likingId === content.id) return;
        setLikingId(content.id);

        router.post(
            route("content.like", content.slug),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["contents"],
                onFinish: () => setLikingId(null),
            },
        );
    };

    const toggleComments = (contentId) => {
        setOpenComments((prev) => ({
            ...prev,
            [contentId]: !prev[contentId],
        }));
    };

    const updateComment = (contentId, value) => {
        setCommentInputs((prev) => ({
            ...prev,
            [contentId]: value,
        }));
    };

    const handleComment = (e, content) => {
        e.preventDefault();
        const comment = (commentInputs[content.id] || "").trim();
        if (!comment || !content?.slug || commentingId === content.id) return;

        setCommentingId(content.id);

        router.post(
            route("content.comment", content.slug),
            { comment },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["contents"],
                onSuccess: () => {
                    setCommentInputs((prev) => ({
                        ...prev,
                        [content.id]: "",
                    }));
                    setOpenComments((prev) => ({
                        ...prev,
                        [content.id]: true,
                    }));
                },
                onFinish: () => setCommentingId(null),
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen py-6 sm:py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8 sm:mb-10">
                        <h1 className="text-2xl sm:text-3xl font-bold text-white">
                            Welcome back,{" "}
                            <span className="text-emerald-400">
                                {user?.username || user?.name}
                            </span>
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm sm:text-base">
                            Kelola konten kamu dengan mudah
                        </p>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 pb-3 border-b border-gray-700">
                        {filterButtons.map((filter) => {
                            const isActive = activeFilter === filter.key;
                            return (
                                <button
                                    key={filter.key}
                                    onClick={() => setActiveFilter(filter.key)}
                                    className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl text-sm font-medium transition-all flex items-center gap-2 ${
                                        isActive
                                            ? "bg-white text-black"
                                            : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                    }`}
                                >
                                    {filter.label}
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full ${
                                            isActive
                                                ? "bg-black/10 text-black"
                                                : "bg-gray-700 text-gray-300"
                                        }`}
                                    >
                                        {filter.count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* FEED */}
                        <div className="lg:col-span-2 space-y-5">
                            {filteredContents.length > 0 ? (
                                filteredContents.map((content) => (
                                    <PostCard
                                        key={content.id}
                                        post={content}
                                        authUser={user}
                                        type="content"
                                        isMember={true}
                                        isOwner={
                                            content.user_id === user?.id ||
                                            content.created_by === user?.id
                                        }
                                    />
                                ))
                            ) : (
                                <div className="bg-[#1E2937] border border-gray-700 rounded-3xl p-10 text-center">
                                    <p className="text-gray-400">
                                        {activeFilter === "all"
                                            ? "Belum ada konten..."
                                            : `Tidak ada konten dengan visibility "${activeFilter}"`}
                                    </p>
                                </div>
                            )}

                            {/* Loader / trigger infinite */}
                            {nextPageUrl && (
                                <div
                                    ref={loaderRef}
                                    className="py-6 text-center text-gray-500 text-sm"
                                >
                                    Memuat lebih banyak...
                                </div>
                            )}
                        </div>

                        {/* SIDEBAR GROUPS */}
                        <div className="space-y-5">
                            <div className="bg-[#1E2937] border border-gray-700 rounded-3xl p-5 sticky top-24">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-white font-semibold flex items-center gap-2">
                                        <UsersRound
                                            size={18}
                                            className="text-emerald-400"
                                        />
                                        Groups diikuti
                                    </h3>
                                    <span className="text-xs text-gray-500">
                                        {joinedGroups.length}
                                    </span>
                                </div>

                                <div className="relative mb-4">
                                    <Search
                                        size={15}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    />
                                    <input
                                        type="text"
                                        value={groupSearch}
                                        onChange={(e) =>
                                            setGroupSearch(e.target.value)
                                        }
                                        placeholder="Cari grup..."
                                        className="w-full bg-[#0f172a] border border-gray-700 rounded-2xl pl-9 pr-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500 placeholder-gray-500"
                                    />
                                </div>

                                <div className="space-y-3 max-h-[28rem] overflow-y-auto">
                                    {filteredGroups.length > 0 ? (
                                        filteredGroups.map((group) => (
                                            <Link
                                                key={group.id}
                                                href={route(
                                                    "groups.show",
                                                    group.id,
                                                )}
                                                className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/60 transition"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                                                    {group.name
                                                        ?.charAt(0)
                                                        .toUpperCase() || "G"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">
                                                        {group.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {group.members_count ??
                                                            0}{" "}
                                                        anggota
                                                    </p>
                                                </div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="text-center py-6">
                                            <p className="text-gray-500 text-sm">
                                                {groupSearch
                                                    ? "Grup tidak ditemukan."
                                                    : "Belum ikut grup mana pun."}
                                            </p>
                                            {!groupSearch && (
                                                <Link
                                                    href={route("groups.index")}
                                                    className="inline-block mt-3 text-sm text-emerald-400 hover:text-emerald-300"
                                                >
                                                    Jelajahi groups →
                                                </Link>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {joinedGroups.length > 0 && (
                                    <Link
                                        href={route("groups.index")}
                                        className="mt-4 block text-center text-sm text-emerald-400 hover:text-emerald-300 transition"
                                    >
                                        Lihat semua groups →
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
