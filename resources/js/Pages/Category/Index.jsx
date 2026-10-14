import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function Index() {
    const { categories = [], flash } = usePage().props;

    const handleDelete = (slug) => {
        if (confirm("Yakin ingin menghapus kategori ini?")) {
            router.delete(route("category.destroy", slug));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Daftar Category" />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-white">
                                All Categories
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">
                                Kelola kategori konten
                            </p>
                        </div>

                        <Link
                            href={route("category.create")}
                            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                        >
                            <Plus size={18} />
                            Create Category
                        </Link>
                    </div>

                    {/* Flash */}
                    {flash?.success && (
                        <div className="mb-6 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl">
                            {flash.success}
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-[#1E2937] border border-gray-700 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#0f172a]">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Nama Kategori
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-700">
                                    {categories.length > 0 ? (
                                        categories.map((category) => (
                                            <tr
                                                key={category.slug}
                                                className="hover:bg-slate-800/50 transition"
                                            >
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-white">
                                                        {category.name}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <Link
                                                            href={route(
                                                                "category.edit",
                                                                category.slug,
                                                            )}
                                                            className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition"
                                                            title="Edit"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>

                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    category.slug,
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
                                                colSpan="2"
                                                className="px-6 py-16 text-center text-gray-500"
                                            >
                                                Belum ada kategori.
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
