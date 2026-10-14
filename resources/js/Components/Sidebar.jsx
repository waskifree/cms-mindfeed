import React from "react";
import {
    Home,
    Users,
    BookCopy,
    FileText,
    UsersRound,
    UserSearch,
    X,
    Tags, // ← tambahkan icon ini
} from "lucide-react";
import { Link, usePage } from "@inertiajs/react";

const Sidebar = ({ user, isOpen, setIsOpen }) => {
    const { url, props } = usePage();

    const authUser = props.auth?.user || user || {};
    const isAdmin =
        authUser?.isAdmin === true ||
        authUser?.roles?.includes?.("admin") ||
        false;

    const closeSidebar = () => setIsOpen(false);

    const isActive = (path, exact = false) => {
        if (exact) return url === path;
        return url.startsWith(path);
    };

    // Admin → content.index | User → mycontent.index
    const myContentRoute = isAdmin
        ? route("content.index")
        : route("mycontent.index");

    const myContentActive = isAdmin
        ? isActive("/content")
        : isActive("/mycontent") && !isActive("/mycontent/create");

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`
                    h-screen w-64 bg-[#0f172a] text-slate-300 flex flex-col border-r border-slate-700
                    fixed top-0 left-0 z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                {/* Logo */}
                <div className="p-6 flex items-center justify-between">
                    <span className="text-lg font-semibold text-white">
                        mindfeed.
                    </span>

                    <button
                        onClick={closeSidebar}
                        className="md:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                    <Link
                        href="/dashboard"
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/dashboard", true)
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <Home size={20} />
                        <span>for your page</span>
                    </Link>

                    <Link
                        href={route("dashboard.friends")}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/dashboard/friends")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <Users size={20} />
                        <span>friends</span>
                    </Link>

                    <Link
                        href={route("groups.index")}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/groups")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <UsersRound size={20} />
                        <span>groups</span>
                    </Link>

                    <Link
                        href={route("users.index")}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/users")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <UserSearch size={20} />
                        <span>users</span>
                    </Link>

                    <Link
                        href={route("notes.index")}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/notes")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <FileText size={20} />
                        <span>notes</span>
                    </Link>
                </nav>

                {/* ===== PROFILE & SETTINGS ===== */}
                <div className="px-3 mb-2">
                    <div className="text-xs text-slate-500 px-4 mb-2">
                        Account
                    </div>

                    <Link
                        href={route("profile.show", {
                            user: authUser?.username,
                        })}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/profile")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        {authUser?.avatar ? (
                            <img
                                src={
                                    authUser.avatar.startsWith("/") ||
                                    authUser.avatar.startsWith("http")
                                        ? authUser.avatar
                                        : `/storage/${authUser.avatar}`
                                }
                                alt={authUser.name}
                                className="w-5 h-5 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-5 h-5 bg-slate-600 rounded-full flex items-center justify-center text-[10px] font-semibold">
                                {authUser?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}
                        <span>your profile</span>
                    </Link>

                    {/* Admin → content | User → my content */}
                    <Link
                        href={myContentRoute}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            myContentActive
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50"
                        }`}
                    >
                        <BookCopy size={20} />
                        <span>{isAdmin ? "content" : "my content"}</span>
                    </Link>

                    {/* Category — hanya tampil jika admin */}
                    {isAdmin && (
                        <Link
                            href={route("category.index")}
                            onClick={closeSidebar}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                                isActive("/category")
                                    ? "bg-slate-800 text-white"
                                    : "hover:bg-slate-800/50"
                            }`}
                        >
                            <Tags size={20} />
                            <span>category</span>
                        </Link>
                    )}
                </div>

                {/* Bottom Section - Chat */}
                <div className="p-4 border-t border-slate-700">
                    <div className="text-xs text-slate-500 px-4 mb-2">
                        Your Chat
                    </div>

                    <Link
                        href={route("chat.index")}
                        onClick={closeSidebar}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive("/chat")
                                ? "bg-slate-800 text-white"
                                : "hover:bg-slate-800/50 text-slate-300"
                        }`}
                    >
                        {authUser?.avatar ? (
                            <img
                                src={
                                    authUser.avatar.startsWith("/") ||
                                    authUser.avatar.startsWith("http")
                                        ? authUser.avatar
                                        : `/storage/${authUser.avatar}`
                                }
                                alt={authUser.name}
                                className="w-8 h-8 rounded-lg object-cover shrink-0 border border-slate-600"
                            />
                        ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0">
                                {authUser?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                                {authUser?.name || "Chat"}
                            </p>
                            <p className="text-xs text-slate-500">
                                Direct messages
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #334155;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #475569;
                }
            `}</style>
        </>
    );
};

export default Sidebar;
