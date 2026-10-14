import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useState, useEffect } from "react";

export default function Index() {
    const { contents, flash, auth } = usePage().props;
    const { filters = {} } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    const handleDelete = (slug) => {
        console.log("Slug yang akan dihapus:", slug);
        if (confirm("Yakin ingin menghapus konten ini?")) {
            router.delete(route("mycontent.destroy", slug));
        }
    };

    // Debounce search
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                "/mycontent",
                { search },
                {
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Content" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            All Contents
                        </h2>
                        <Link
                            href={route("mycontent.create")}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl transition text-center text-sm font-medium"
                        >
                            + Create New Content
                        </Link>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6">
                            {flash.success}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul, deskripsi, atau isi konten..."
                            className="w-full bg-[#1e2937] text-white border border-gray-700 
                                     rounded-2xl px-5 py-3.5 focus:outline-none focus:border-emerald-500 
                                     focus:ring-2 focus:ring-emerald-500/30 transition-all duration-300
                                     placeholder-gray-500 text-sm"
                        />
                    </div>

                    {/* ====================== */}
                    {/* MOBILE VIEW (Cards)    */}
                    {/* ====================== */}
                    <div className="md:hidden space-y-4">
                        {contents.length > 0 ? (
                            contents.map((content) => (
                                <div
                                    key={content.slug}
                                    className="bg-[#1e2937] border border-gray-700 rounded-2xl p-5"
                                >
                                    <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
                                        {content.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                                        {content.description || "-"}
                                    </p>

                                    <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-4">
                                        <span className="bg-gray-800 px-2.5 py-1 rounded-lg">
                                            {content.category?.name ||
                                                "No Category"}
                                        </span>
                                        <span className="bg-gray-800 px-2.5 py-1 rounded-lg">
                                            ❤️ {content.likes ?? 0}
                                        </span>
                                    </div>

                                    <div className="flex gap-3 pt-3 border-t border-gray-700">
                                        <Link
                                            href={route(
                                                "mycontent.show",
                                                content.slug,
                                            )}
                                            className="flex-1 text-center text-sm py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition"
                                        >
                                            Show
                                        </Link>
                                        <Link
                                            href={route(
                                                "mycontent.edit",
                                                content.slug,
                                            )}
                                            className="flex-1 text-center text-sm py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(content.slug)
                                            }
                                            className="flex-1 text-center text-sm py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-16 text-center text-gray-400">
                                Belum ada konten.
                            </div>
                        )}
                    </div>

                    {/* ====================== */}
                    {/* DESKTOP VIEW (Table)   */}
                    {/* ====================== */}
                    <div className="hidden md:block bg-[#1e2937] border border-gray-700 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#0f172a]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Judul
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Likes
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700">
                                    {contents.length > 0 ? (
                                        contents.map((content) => (
                                            <tr
                                                key={content.slug}
                                                className="hover:bg-slate-800/50 transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">
                                                        {content.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                                                    {content.description || "-"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {content.category?.name ||
                                                        "No Category"}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {content.likes ?? 0}
                                                </td>
                                                <td className="px-6 py-4 text-center space-x-4">
                                                    <Link
                                                        href={route(
                                                            "mycontent.show",
                                                            content.slug,
                                                        )}
                                                        className="text-emerald-400 hover:text-emerald-300 text-sm"
                                                    >
                                                        Show
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            "mycontent.edit",
                                                            content.slug,
                                                        )}
                                                        className="text-indigo-400 hover:text-indigo-300 text-sm"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() =>
                                                            handleDelete(
                                                                content.slug,
                                                            )
                                                        }
                                                        className="text-red-400 hover:text-red-300 text-sm"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-16 text-center text-gray-400"
                                            >
                                                Belum ada konten.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
