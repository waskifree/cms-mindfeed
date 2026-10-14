import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    Search,
    Menu,
    X,
    UserCheck,
    FileText,
    Send,
    Plus,
    Users,
    MessageCircle,
} from "lucide-react";
import Sidebar from "@/Components/Sidebar";
import PostCard from "@/Components/PostCard";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";

export default function DashFriends() {
    const { props, url } = usePage();

    const auth = props.auth || {};
    const user = auth.user || props.user || {};

    const {
        contents = [],
        filters = {},
        categories = [],
        mutuals = [],
    } = props;

    const isAdmin = auth.user?.isAdmin || false;

    const contentList = contents.data ?? contents;
    const nextPageUrl = contents.next_page_url ?? null;

    const { loaderRef } = useInfiniteScroll({
        nextPageUrl,
        only: ["contents"],
    });

    const [search, setSearch] = useState(filters.search || "");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [mutualSearch, setMutualSearch] = useState("");
    const [activeChat, setActiveChat] = useState(null);
    const [conversationId, setConversationId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatMessage, setChatMessage] = useState("");
    const [loadingChat, setLoadingChat] = useState(false);
    const [sendingChat, setSendingChat] = useState(false);

    const openChat = async (person) => {
        setActiveChat(person);
        setLoadingChat(true);
        setMessages([]);
        setConversationId(null);

        try {
            const res = await fetch(route("chat.open", person.id), {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });

            if (!res.ok) throw new Error("Gagal membuka chat");

            const data = await res.json();
            setConversationId(data.conversation_id);
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
            alert("Gagal membuka chat");
        } finally {
            setLoadingChat(false);
        }
    };

    const sendChat = async (e) => {
        e.preventDefault();
        if (!chatMessage.trim() || !conversationId || sendingChat) return;

        setSendingChat(true);
        const body = chatMessage.trim();
        setChatMessage("");

        try {
            const csrf = document
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute("content");

            const res = await fetch(route("chat.store", conversationId), {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": csrf,
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
                body: JSON.stringify({ body }),
            });

            if (!res.ok) throw new Error("Gagal kirim pesan");

            const openRes = await fetch(route("chat.open", activeChat.id), {
                headers: {
                    Accept: "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                },
                credentials: "same-origin",
            });
            const data = await openRes.json();
            setMessages(data.messages || []);
        } catch (e) {
            console.error(e);
            setChatMessage(body);
            alert("Gagal mengirim pesan");
        } finally {
            setSendingChat(false);
        }
    };

    const {
        data: postData,
        setData: setPostData,
        post: createPost,
        processing: posting,
        reset: resetPost,
        errors: postErrors,
    } = useForm({
        title: "",
        description: "",
        paragraph: "",
        category_id: "",
        visibility: "",
        type: "text",
    });

    const isDashFriendsPage =
        url.startsWith("/dashfriends") || url.startsWith("/dashboard/friends");

    useEffect(() => {
        setSearch(filters.search || "");
    }, [url, filters.search]);

    useEffect(() => {
        if (!isDashFriendsPage) return;

        const timeout = setTimeout(() => {
            if ((filters.search || "") === search) return;

            router.get(
                url.split("?")[0],
                { search: search.trim() || undefined },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [search, filters.search, isDashFriendsPage]);

    const filteredMutuals = mutuals.filter((person) => {
        const keyword = mutualSearch.toLowerCase().trim();
        if (!keyword) return true;
        return (
            person.name?.toLowerCase().includes(keyword) ||
            person.username?.toLowerCase().includes(keyword)
        );
    });

    const formatDateTime = (date) => {
        if (!date) return "";
        try {
            return new Date(date).toLocaleString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    const getInitial = (name) => name?.charAt(0)?.toUpperCase() || "U";

    const handleCreatePost = (e) => {
        e.preventDefault();
        createPost(route("mycontent.store"), {
            preserveScroll: true,
            onSuccess: () => {
                resetPost();
                setShowCreatePost(false);
                router.reload({ only: ["contents"] });
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200">
            <Head title="DashFriends" />

            <Sidebar
                user={user}
                isAdmin={isAdmin}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            {sidebarOpen && (
                <button
                    type="button"
                    aria-label="Tutup sidebar"
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/60 z-40 md:hidden"
                />
            )}

            <div className="md:ml-64 min-h-screen flex flex-col">
                {/* Navbar */}
                <nav className="sticky top-0 z-30 bg-[#0f172a]/80 backdrop-blur-md  border-gray-800">
                    <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        <div className="flex-1 max-w-xl relative">
                            <Search
                                size={16}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                            />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari konten teman..."
                                className="w-full bg-[#1e2937] text-white border border-gray-700 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 placeholder-gray-500 transition"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="md:hidden p-2.5 rounded-xl bg-[#1e2937] border border-gray-700 hover:bg-slate-700 transition"
                        >
                            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </nav>

                <main className="flex-1 py-6">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header */}
                        <div className=" mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                        <Users
                                            className="text-emerald-400"
                                            size={28}
                                        />
                                        Friends
                                    </h2>
                                    <p className="text-gray-400 mt-1 text-sm">
                                        Temukan konten dari teman-temanmu
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 flex-wrap">
                                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-gray-700 text-sm text-gray-300">
                                        <FileText
                                            size={15}
                                            className="text-gray-500"
                                        />
                                        {contentList.length} konten
                                    </div>
                                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                                        <UserCheck size={15} />
                                        {mutuals.length} Mutual
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* FEED */}
                            <div className="lg:col-span-2 space-y-5">
                                {/* CREATE POST */}
                                <div className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5">
                                    {!showCreatePost ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowCreatePost(true)
                                            }
                                            className="w-full flex items-center gap-3 text-left group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-emerald-500/20">
                                                {getInitial(user.name)}
                                            </div>
                                            <div className="flex-1 bg-[#0f172a] border border-gray-700 group-hover:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-500 transition">
                                                Apa yang ingin kamu bagikan?
                                            </div>
                                            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 flex items-center justify-center shrink-0">
                                                <Plus
                                                    size={18}
                                                    className="text-emerald-400"
                                                />
                                            </div>
                                        </button>
                                    ) : (
                                        <form
                                            onSubmit={handleCreatePost}
                                            className="space-y-4"
                                        >
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-white font-semibold">
                                                    Buat Post
                                                </h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowCreatePost(
                                                            false,
                                                        );
                                                        resetPost();
                                                    }}
                                                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-slate-700 transition"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>

                                            {/* Visibility */}
                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                                    Visibilitas
                                                </label>
                                                <div className="grid grid-cols-3 gap-2">
                                                    {[
                                                        {
                                                            value: "public",
                                                            label: "Public",
                                                            icon: "🌍",
                                                        },
                                                        {
                                                            value: "followers",
                                                            label: "Followers",
                                                            icon: "👥",
                                                        },
                                                        {
                                                            value: "private",
                                                            label: "Private",
                                                            icon: "🔒",
                                                        },
                                                    ].map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            onClick={() =>
                                                                setPostData(
                                                                    "visibility",
                                                                    opt.value,
                                                                )
                                                            }
                                                            className={`p-3 rounded-xl border text-left transition ${
                                                                postData.visibility ===
                                                                opt.value
                                                                    ? "border-emerald-500 bg-emerald-500/10 text-white"
                                                                    : "border-gray-700 bg-[#0f172a] text-gray-400 hover:border-gray-600"
                                                            }`}
                                                        >
                                                            <div className="text-lg mb-1">
                                                                {opt.icon}
                                                            </div>
                                                            <div className="text-xs font-medium">
                                                                {opt.label}
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                                {postErrors.visibility && (
                                                    <p className="text-red-400 text-xs mt-1.5">
                                                        {postErrors.visibility}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <input
                                                    type="text"
                                                    value={postData.title}
                                                    onChange={(e) =>
                                                        setPostData(
                                                            "title",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Judul post..."
                                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                                />
                                                {postErrors.title && (
                                                    <p className="text-red-400 text-xs mt-1.5">
                                                        {postErrors.title}
                                                    </p>
                                                )}
                                            </div>

                                            <input
                                                type="text"
                                                value={postData.description}
                                                onChange={(e) =>
                                                    setPostData(
                                                        "description",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Deskripsi singkat..."
                                                className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                            />

                                            <div>
                                                <textarea
                                                    value={postData.paragraph}
                                                    onChange={(e) =>
                                                        setPostData(
                                                            "paragraph",
                                                            e.target.value,
                                                        )
                                                    }
                                                    rows={4}
                                                    placeholder="Tulis isi post kamu..."
                                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                                />
                                                {postErrors.paragraph && (
                                                    <p className="text-red-400 text-xs mt-1.5">
                                                        {postErrors.paragraph}
                                                    </p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-400 mb-2">
                                                    Kategori
                                                </label>
                                                <select
                                                    value={postData.category_id}
                                                    onChange={(e) =>
                                                        setPostData(
                                                            "category_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full bg-[#0f172a] border border-gray-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                                    required
                                                >
                                                    <option value="">
                                                        -- Pilih Kategori --
                                                    </option>
                                                    {categories.map(
                                                        (category) => (
                                                            <option
                                                                key={
                                                                    category.id
                                                                }
                                                                value={
                                                                    category.id
                                                                }
                                                            >
                                                                {
                                                                    category.nametitle
                                                                }
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                {postErrors.category_id && (
                                                    <p className="text-red-400 text-xs mt-1.5">
                                                        {postErrors.category_id}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex justify-end pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={posting}
                                                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition shadow-lg shadow-emerald-600/20"
                                                >
                                                    <Send size={16} />
                                                    {posting
                                                        ? "Mengirim..."
                                                        : "Posting"}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>

                                {/* LIST POST */}
                                {contentList.length > 0 ? (
                                    contentList.map((content) => (
                                        <PostCard
                                            key={content.id || content.slug}
                                            post={content}
                                            authUser={user}
                                            type="content"
                                            isMember={true}
                                            isOwner={
                                                content.created_by ===
                                                    user?.id ||
                                                content.user_id === user?.id
                                            }
                                        />
                                    ))
                                ) : (
                                    <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-16 text-center">
                                        <div className="w-14 h-14 rounded-2xl bg-[#0f172a] border border-gray-700 flex items-center justify-center mx-auto mb-4">
                                            <FileText
                                                size={28}
                                                className="text-gray-600"
                                            />
                                        </div>
                                        <p className="text-gray-400 text-sm">
                                            Belum ada konten dari following /
                                            followers.
                                        </p>
                                    </div>
                                )}

                                {nextPageUrl && (
                                    <div
                                        ref={loaderRef}
                                        className="py-6 text-center text-gray-500 text-sm"
                                    >
                                        Memuat lebih banyak...
                                    </div>
                                )}
                            </div>

                            {/* SIDEBAR MUTUAL + CHAT */}
                            <div className="space-y-5">
                                {/* Mutual List */}
                                <div className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5">
                                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                                        <UserCheck
                                            size={18}
                                            className="text-emerald-400"
                                        />
                                        Mutual
                                        <span className="text-gray-500 font-normal text-sm">
                                            ({mutuals.length})
                                        </span>
                                    </h3>

                                    <div className="relative mb-4">
                                        <Search
                                            size={15}
                                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                                        />
                                        <input
                                            type="text"
                                            value={mutualSearch}
                                            onChange={(e) =>
                                                setMutualSearch(e.target.value)
                                            }
                                            placeholder="Cari mutual..."
                                            className="w-full bg-[#0f172a] border border-gray-700 rounded-xl pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                        />
                                    </div>

                                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                                        {filteredMutuals.length > 0 ? (
                                            filteredMutuals.map((person) => (
                                                <button
                                                    key={person.id}
                                                    type="button"
                                                    onClick={() =>
                                                        openChat(person)
                                                    }
                                                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition ${
                                                        activeChat?.id ===
                                                        person.id
                                                            ? "bg-emerald-600/15 border border-emerald-500/40"
                                                            : "hover:bg-slate-800/70 border border-transparent"
                                                    }`}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-semibold text-white shrink-0">
                                                        {getInitial(
                                                            person.name,
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-white text-sm font-medium truncate">
                                                            {person.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 truncate">
                                                            @{person.username}
                                                        </p>
                                                    </div>
                                                    <MessageCircle
                                                        size={16}
                                                        className={
                                                            activeChat?.id ===
                                                            person.id
                                                                ? "text-emerald-400"
                                                                : "text-gray-500"
                                                        }
                                                    />
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm py-4 text-center">
                                                {mutualSearch
                                                    ? "Tidak ditemukan."
                                                    : "Belum ada mutual."}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Chat Panel */}
                                {activeChat && (
                                    <div className="bg-[#1e2937] border border-gray-700 rounded-2xl overflow-hidden flex flex-col h-[420px] shadow-xl shadow-black/20">
                                        {/* Chat Header */}
                                        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-700 bg-[#1e2937]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-sm font-bold text-white">
                                                    {getInitial(
                                                        activeChat.name,
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white text-sm font-semibold">
                                                        {activeChat.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        @{activeChat.username}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setActiveChat(null);
                                                    setMessages([]);
                                                    setConversationId(null);
                                                }}
                                                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-slate-700 transition"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0f172a]/40">
                                            {loadingChat ? (
                                                <p className="text-center text-gray-500 text-sm py-10">
                                                    Memuat chat...
                                                </p>
                                            ) : messages.length > 0 ? (
                                                messages.map((msg) => {
                                                    const isMine =
                                                        msg.user_id === user.id;
                                                    return (
                                                        <div
                                                            key={msg.id}
                                                            className={`flex ${
                                                                isMine
                                                                    ? "justify-end"
                                                                    : "justify-start"
                                                            }`}
                                                        >
                                                            <div
                                                                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                                                                    isMine
                                                                        ? "bg-emerald-600 text-white rounded-br-md"
                                                                        : "bg-[#1e2937] border border-gray-700 text-gray-200 rounded-bl-md"
                                                                }`}
                                                            >
                                                                <p className="whitespace-pre-wrap leading-relaxed">
                                                                    {msg.body}
                                                                </p>
                                                                <p
                                                                    className={`text-[10px] mt-1.5 ${
                                                                        isMine
                                                                            ? "text-emerald-100/60"
                                                                            : "text-gray-500"
                                                                    }`}
                                                                >
                                                                    {formatDateTime(
                                                                        msg.created_at,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="text-center py-10">
                                                    <MessageCircle
                                                        size={28}
                                                        className="mx-auto text-gray-600 mb-3"
                                                    />
                                                    <p className="text-gray-500 text-sm">
                                                        Belum ada pesan.
                                                    </p>
                                                    <p className="text-gray-600 text-xs mt-1">
                                                        Mulai chat dengan{" "}
                                                        {activeChat.name}!
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Input */}
                                        <form
                                            onSubmit={sendChat}
                                            className="p-3 border-t border-gray-700 flex gap-2 bg-[#1e2937]"
                                        >
                                            <input
                                                type="text"
                                                value={chatMessage}
                                                onChange={(e) =>
                                                    setChatMessage(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Tulis pesan..."
                                                className="flex-1 bg-[#0f172a] border border-gray-700 rounded-xl px-3.5 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition"
                                            />
                                            <button
                                                type="submit"
                                                disabled={
                                                    !chatMessage.trim() ||
                                                    sendingChat ||
                                                    !conversationId
                                                }
                                                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition shadow-lg shadow-emerald-600/20"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
