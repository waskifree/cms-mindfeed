import React, { useState, useEffect } from "react";
import { Link, usePage, router } from "@inertiajs/react";
import { Menu, X, Search } from "lucide-react";

import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import Sidebar from "@/Components/Sidebar";

export default function AuthenticatedLayout({ header, children }) {
    const { props, url } = usePage();
    const auth = props.auth || {};
    const user = auth.user || props.user || {};
    const { filters = {} } = props;

    // Cek admin dari isAdmin / is_admin / roles
    const isAdmin =
        user?.isAdmin === true ||
        user?.is_admin === true ||
        (Array.isArray(user?.roles) && user.roles.includes("admin"));

    const [search, setSearch] = useState(filters.search || "");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isUsersPage = url.startsWith("/users");
    const isProfilePage = url.match(/^\/profile\/[^\/]+$/);
    const isContentPage = url.startsWith("content.index");

    // Auto search dengan debounce
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (isUsersPage) {
                router.get(
                    "/users",
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (url.startsWith("/dashboard") || url === "/") {
                router.get(
                    "/dashboard",
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (
                url.startsWith("/groups") &&
                !url.match(/\/groups\/\d+/)
            ) {
                router.get(
                    "/groups",
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (url.startsWith("/notes")) {
                router.get(
                    "/notes",
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (isProfilePage) {
                const username = url.split("/")[2];
                router.get(
                    `/profile/${username}`,
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            } else if (isContentPage) {
                router.get(
                    route("content.index"),
                    { search },
                    {
                        preserveState: true,
                        preserveScroll: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    // Reset search saat pindah halaman
    useEffect(() => {
        setSearch(filters.search || "");
    }, [url]);

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-200">
            <Sidebar
                user={user}
                isAdmin={isAdmin}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
            />

            <div className="flex-1 md:ml-64 flex flex-col min-w-0">
                {/* Top Navbar */}
                <nav className="px-4 sm:px-6 py-3 sticky top-0 z-30">
                    <div className="flex items-center justify-between gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <Search
                                    size={16}
                                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={
                                        isUsersPage
                                            ? "Cari nama, username, atau email..."
                                            : url.startsWith("/groups")
                                              ? "Cari nama atau deskripsi grup..."
                                              : url.startsWith("/notes")
                                                ? "Cari judul, deskripsi, atau isi catatan..."
                                                : isProfilePage
                                                  ? "Cari konten di profil ini..."
                                                  : "Cari judul, deskripsi, atau isi konten..."
                                    }
                                    className="w-full bg-[#0f172a] text-white border border-slate-700 
                                             rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-emerald-500 
                                             focus:ring-1 focus:ring-emerald-500/30 transition-all
                                             placeholder-gray-500 text-sm"
                                />
                            </div>
                        </div>

                        {/* Right Side */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 rounded-xl hover:bg-slate-700 transition-colors"
                            >
                                {sidebarOpen ? (
                                    <X size={22} />
                                ) : (
                                    <Menu size={22} />
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Optional Header */}
                {header && (
                    <header className="bg-[#1e2937] border-b border-slate-700 py-4">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1 overflow-auto bg-[#0f172a]">
                    {children}
                </main>
            </div>
        </div>
    );
}
