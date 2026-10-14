import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, Link } from "@inertiajs/react";
import { UsersRound, ArrowLeft } from "lucide-react";

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("groups.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Buat Grup Baru" />

            <div className="py-6">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href={route("groups.index")}
                            className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-4 transition"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Groups
                        </Link>

                        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                            <UsersRound
                                className="text-emerald-400"
                                size={28}
                            />
                            Buat Grup Baru
                        </h1>
                        <p className="text-gray-400 mt-1 text-sm">
                            Buat komunitas berdasarkan minat yang sama
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#1e2937] border border-gray-700 rounded-3xl p-6 sm:p-8 space-y-6"
                    >
                        {/* Nama Grup */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nama Grup{" "}
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                placeholder="Contoh: Developer Indonesia"
                                className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-2xl px-5 py-3.5
                                         focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                                         transition placeholder-gray-500"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-1.5">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Deskripsi
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                rows={4}
                                placeholder="Ceritakan tentang grup ini..."
                                className="w-full bg-[#0f172a] text-white border border-gray-700 rounded-2xl px-5 py-3.5
                                         focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30
                                         transition placeholder-gray-500 resize-none"
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm mt-1.5">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium py-3 rounded-2xl transition"
                            >
                                {processing ? "Menyimpan..." : "Buat Grup"}
                            </button>
                            <Link
                                href={route("groups.index")}
                                className="flex-1 text-center bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-2xl transition"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
