import { Head, Link, router } from "@inertiajs/react";
import { useState, useMemo, useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Search,
    Plus,
    X,
    MessageSquare,
    ChevronLeft,
    ChevronRight,
    BellOff,
    EyeOff,
    Eye,
    ShieldAlert,
    Settings,
    Inbox,
    UserCheck,
} from "lucide-react";

export default function Index({
    primaryConversations = [],
    requestConversations = [],
    hiddenConversations = [],
    users,
    auth,
}) {
    const isPaginated = users && !Array.isArray(users) && users.data;
    const userList = isPaginated ? users.data : users || [];
    const pagination = isPaginated ? users : null;

    const [activeTab, setActiveTab] = useState("primary");
    const [search, setSearch] = useState("");
    const [showNewChat, setShowNewChat] = useState(false);
    const [showDndModal, setShowDndModal] = useState(false);
    const [userSearch, setUserSearch] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const [allowNonFollowerState, setAllowNonFollowerState] = useState(
        Boolean(auth?.user?.allow_non_follower_chats),
    );
    const [isDndState, setIsDndState] = useState(Boolean(auth?.user?.is_dnd));

    // Local state untuk optimistic update
    const [localPrimary, setLocalPrimary] = useState(primaryConversations);
    const [localRequests, setLocalRequests] = useState(requestConversations);
    const [localHidden, setLocalHidden] = useState(hiddenConversations);

    const dndLoading = useRef(false);
    const allowLoading = useRef(false);
    const hideLoading = useRef(false);

    // Hanya sync saat props benar-benar berubah dari server
    // (bukan setiap render)
    const primaryKey = JSON.stringify(primaryConversations.map((c) => c.id));
    const requestsKey = JSON.stringify(requestConversations.map((c) => c.id));
    const hiddenKey = JSON.stringify(hiddenConversations.map((c) => c.id));

    useEffect(() => {
        setLocalPrimary(primaryConversations);
    }, [primaryKey]);

    useEffect(() => {
        setLocalRequests(requestConversations);
    }, [requestsKey]);

    useEffect(() => {
        setLocalHidden(hiddenConversations);
    }, [hiddenKey]);

    const rawConversations =
        activeTab === "primary" ? localPrimary : localRequests;

    const filteredConversations = useMemo(() => {
        if (!search.trim()) return rawConversations;
        const q = search.toLowerCase();
        return rawConversations.filter((conv) =>
            conv.otherUser?.name?.toLowerCase().includes(q),
        );
    }, [rawConversations, search]);

    // Search user di modal New Chat
    useEffect(() => {
        if (!showNewChat) return;

        const timer = setTimeout(() => {
            setIsSearching(true);
            router.get(
                route("chat.index"),
                { user_search: userSearch || undefined, page: 1 },
                {
                    preserveState: true,
                    preserveScroll: true,
                    only: ["users"],
                    onFinish: () => setIsSearching(false),
                },
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [userSearch, showNewChat]);

    const startChat = (userId) => {
        router.get(route("chat.start", userId));
        setShowNewChat(false);
        setUserSearch("");
    };

    const goToPage = (url) => {
        if (!url) return;
        setIsSearching(true);
        router.get(
            url,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ["users"],
                onFinish: () => setIsSearching(false),
            },
        );
    };

    // ========== TOGGLE HIDE ==========
    const toggleHideChat = (e, conversationId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!conversationId || hideLoading.current) return;

        hideLoading.current = true;

        const fromHidden = localHidden.find((c) => c.id === conversationId);
        const fromPrimary = localPrimary.find((c) => c.id === conversationId);
        const fromRequests = localRequests.find((c) => c.id === conversationId);
        const conv = fromHidden || fromPrimary || fromRequests;

        if (!conv) {
            hideLoading.current = false;
            return;
        }

        const snapshot = {
            primary: localPrimary,
            requests: localRequests,
            hidden: localHidden,
        };

        // Optimistic
        if (fromHidden) {
            setLocalHidden((prev) =>
                prev.filter((c) => c.id !== conversationId),
            );
            if (conv.is_mutual) {
                setLocalPrimary((prev) => [conv, ...prev]);
            } else {
                setLocalRequests((prev) => [conv, ...prev]);
            }
        } else {
            setLocalPrimary((prev) =>
                prev.filter((c) => c.id !== conversationId),
            );
            setLocalRequests((prev) =>
                prev.filter((c) => c.id !== conversationId),
            );
            setLocalHidden((prev) => [conv, ...prev]);
        }

        router.post(
            route("chat.toggle-hide", conversationId),
            {},
            {
                preserveScroll: true,
                only: [
                    "primaryConversations",
                    "requestConversations",
                    "hiddenConversations",
                ],
                onError: () => {
                    setLocalPrimary(snapshot.primary);
                    setLocalRequests(snapshot.requests);
                    setLocalHidden(snapshot.hidden);
                },
                onFinish: () => {
                    hideLoading.current = false;
                },
            },
        );
    };

    // ========== TOGGLE ALLOW NON-FOLLOWER ==========
    const handleToggleAllowNonFollower = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (allowLoading.current) return;

        allowLoading.current = true;
        const nextState = !allowNonFollowerState;
        setAllowNonFollowerState(nextState);

        router.post(
            route("chat.toggle-allow-non-follower"),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["auth"],
                onError: () => setAllowNonFollowerState(!nextState),
                onFinish: () => {
                    allowLoading.current = false;
                },
            },
        );
    };

    // ========== TOGGLE DND ==========
    const handleToggleDnd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dndLoading.current) return;

        dndLoading.current = true;
        const nextState = !isDndState;
        setIsDndState(nextState);

        router.post(
            route("chat.toggle-dnd"),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["auth"],
                onError: () => setIsDndState(!nextState),
                onFinish: () => {
                    dndLoading.current = false;
                },
            },
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Messages" />

            <div className="p-6 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-semibold text-white">
                            Messages
                        </h1>
                        {isDndState && (
                            <span className="flex items-center gap-1 bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/30 font-medium">
                                <BellOff size={12} /> DND Active
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowDndModal(true)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition border border-slate-700 relative cursor-pointer"
                            title="Settings & Hidden Chats"
                        >
                            <Settings size={18} />
                            {localHidden.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-indigo-500 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowNewChat(true)}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-lg shadow-indigo-600/20 cursor-pointer"
                        >
                            <Plus size={18} />
                            New Chat
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-slate-800/60 p-1 rounded-xl mb-4 border border-slate-700/60">
                    <button
                        type="button"
                        onClick={() => setActiveTab("primary")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                            activeTab === "primary"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <Inbox size={16} />
                        Primary
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("requests")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition relative cursor-pointer ${
                            activeTab === "requests"
                                ? "bg-indigo-600 text-white shadow-md"
                                : "text-slate-400 hover:text-white"
                        }`}
                    >
                        <ShieldAlert size={16} />
                        Requests
                        {localRequests.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                                {localRequests.length}
                            </span>
                        )}
                    </button>
                </div>

                {activeTab === "requests" && (
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3 mb-4 text-xs text-slate-400 flex justify-between items-center gap-3">
                        <span>Pesan dari non-follower berada di sini.</span>
                        <button
                            type="button"
                            onClick={handleToggleAllowNonFollower}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition border cursor-pointer shrink-0 ${
                                allowNonFollowerState
                                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                    : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600"
                            }`}
                        >
                            {allowNonFollowerState
                                ? "Izinkan Non-Follower: AKTIF"
                                : "Izinkan Non-Follower: NONAKTIF"}
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-5">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari percakapan..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                    />
                </div>

                {/* List percakapan */}
                <div className="space-y-2">
                    {filteredConversations.length === 0 && (
                        <p className="text-slate-500 text-center py-8 text-sm">
                            {search
                                ? "Tidak ada percakapan yang cocok."
                                : activeTab === "requests"
                                  ? "Tidak ada permintaan pesan."
                                  : "Belum ada percakapan."}
                        </p>
                    )}

                    {filteredConversations.map((conv) => (
                        <div key={conv.id} className="relative group">
                            <Link
                                href={route("chat.show", conv.id)}
                                className="flex items-center bg-slate-800/80 border border-slate-700/50 gap-4 p-4 rounded-xl hover:bg-slate-700/80 transition"
                            >
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                                    {conv.otherUser?.name?.[0]?.toUpperCase() ||
                                        "?"}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-medium truncate text-white flex items-center gap-1.5">
                                            {conv.otherUser?.name}
                                            {conv.is_mutual && (
                                                <UserCheck
                                                    size={14}
                                                    className="text-indigo-400"
                                                    title="Mutual Follower"
                                                />
                                            )}
                                        </p>
                                        {conv.unread_count > 0 && (
                                            <span className="bg-indigo-600 text-xs px-2 py-0.5 rounded-full text-white font-semibold">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-400 truncate">
                                        {conv.latestMessage?.body ||
                                            conv.latest_message?.body ||
                                            "Belum ada pesan"}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => toggleHideChat(e, conv.id)}
                                    className="p-2 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition rounded-lg hover:bg-slate-600/50 cursor-pointer"
                                    title="Sembunyikan pesan"
                                >
                                    <EyeOff size={16} />
                                </button>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Settings */}
            {showDndModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowDndModal(false)}
                    />

                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Settings size={20} /> Status & Privasi Chat
                            </h2>
                            <button
                                type="button"
                                onClick={() => setShowDndModal(false)}
                                className="text-slate-400 hover:text-white cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* DND Toggle */}
                        <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
                            <div>
                                <p className="font-medium text-white text-sm">
                                    Do Not Disturb (DND)
                                </p>
                                <p className="text-xs text-slate-400">
                                    Sembunyikan notifikasi saat diaktifkan.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleToggleDnd}
                                className={`w-12 h-6 rounded-full transition-colors p-1 relative flex items-center cursor-pointer ${
                                    isDndState
                                        ? "bg-indigo-600"
                                        : "bg-slate-700"
                                }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                        isDndState
                                            ? "translate-x-6"
                                            : "translate-x-0"
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Hidden chats */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-1.5">
                                <EyeOff size={16} /> Chat Disembunyikan (
                                {localHidden.length})
                            </h3>

                            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                                {localHidden.length === 0 ? (
                                    <p className="text-slate-500 text-xs py-4 text-center">
                                        Tidak ada chat yang disembunyikan.
                                    </p>
                                ) : (
                                    localHidden.map((conv) => (
                                        <div
                                            key={conv.id}
                                            className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                                                    {conv.otherUser?.name?.[0]?.toUpperCase() ||
                                                        "?"}
                                                </div>
                                                <p className="text-sm text-white font-medium truncate">
                                                    {conv.otherUser?.name}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) =>
                                                    toggleHideChat(e, conv.id)
                                                }
                                                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 cursor-pointer"
                                            >
                                                <Eye size={14} /> Tampilkan
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal New Chat */}
            {showNewChat && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => {
                            setShowNewChat(false);
                            setUserSearch("");
                        }}
                    />

                    <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div>
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <MessageSquare size={20} /> New Chat
                                </h2>
                                <p className="text-xs text-slate-400">
                                    Hanya menampilkan pengikut (Followers) Anda
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowNewChat(false);
                                    setUserSearch("");
                                }}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4 border-b border-slate-700">
                            <div className="relative">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />
                                <input
                                    type="text"
                                    value={userSearch}
                                    onChange={(e) =>
                                        setUserSearch(e.target.value)
                                    }
                                    placeholder="Cari nama follower..."
                                    autoFocus
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 p-2 min-h-[200px]">
                            {isSearching ? (
                                <p className="text-slate-500 text-center py-8 text-sm">
                                    Mencari...
                                </p>
                            ) : userList.length === 0 ? (
                                <p className="text-slate-500 text-center py-8 text-sm">
                                    {userSearch
                                        ? "Follower tidak ditemukan."
                                        : "Belum ada follower yang ditemukan."}
                                </p>
                            ) : (
                                userList.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() => startChat(user.id)}
                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800 transition text-left cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
                                            {user.name?.[0]?.toUpperCase() ||
                                                "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-white truncate">
                                                {user.name}
                                            </p>
                                            {user.email && (
                                                <p className="text-xs text-slate-400 truncate">
                                                    {user.email}
                                                </p>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>

                        {pagination && pagination.last_page > 1 && (
                            <div className="flex items-center justify-between p-3 border-t border-slate-700 text-sm">
                                <button
                                    type="button"
                                    disabled={!pagination.prev_page_url}
                                    onClick={() =>
                                        goToPage(pagination.prev_page_url)
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} /> Prev
                                </button>
                                <span className="text-slate-400 text-xs">
                                    {pagination.current_page} /{" "}
                                    {pagination.last_page}
                                </span>
                                <button
                                    type="button"
                                    disabled={!pagination.next_page_url}
                                    onClick={() =>
                                        goToPage(pagination.next_page_url)
                                    }
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
