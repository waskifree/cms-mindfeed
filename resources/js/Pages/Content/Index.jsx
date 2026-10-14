import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

export default function Index() {
    const { contents = [], flash } = usePage().props;

    const handleDelete = (slug) => {
        if (confirm("Yakin ingin menghapus content ini?")) {
            router.delete(route("content.destroy", slug));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Content" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                All Contents
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Kelola semua konten yang ada
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route("content.create")}
                                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                                <Plus size={18} />
                                Create Content
                            </Link>

                            <Link
                                href={route("category.create")}
                                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                                <Plus size={18} />
                                Create Category
                            </Link>
                        </div>
                    </div>

                    {/* Flash Message */}
                    {flash?.success && (
                        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl">
                            {flash.success}
                        </div>
                    )}

                    {/* Table Card */}
                    <div className="bg-[#1E2937] border border-gray-700 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#0f172a]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Judul
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Deskripsi
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Kategori
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            created by
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Likes
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
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

                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-gray-400 line-clamp-2 max-w-xs">
                                                        {content.description ||
                                                            "-"}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-gray-300">
                                                        {content.category
                                                            ?.name ||
                                                            "No Category"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700 text-gray-300">
                                                        {content.user.name ||
                                                            "No name"}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4 text-sm text-gray-300">
                                                    {content.likes ?? 0}
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Link
                                                            href={route(
                                                                "content.show",
                                                                content.slug,
                                                            )}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition"
                                                            title="Show"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                        <Link
                                                            href={route(
                                                                "content.edit",
                                                                content.slug,
                                                            )}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    content.slug,
                                                                )
                                                            }
                                                            className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="5"
                                                className="px-6 py-16 text-center text-gray-500"
                                            >
                                                Belum ada content.
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
