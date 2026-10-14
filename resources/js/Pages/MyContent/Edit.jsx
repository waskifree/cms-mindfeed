import { useForm, Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Edit({ content, categories }) {
    const { data, setData, put, processing, errors } = useForm({
        title: content.title || "",
        description: content.description || "",
        paragraph: content.paragraph || "",
        type: content.type || "text",
        category_id: content.category_id || "",
        visibility: content.visibility || "public", // ← Tambahan
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("mycontent.update", content.slug));
    };

    const visibilityOptions = [
        {
            value: "public",
            label: "Public",
            desc: "Semua orang bisa melihat",
            icon: "🌍",
        },
        {
            value: "followers",
            label: "Hanya Followers",
            desc: "Hanya pengikutmu yang bisa melihat",
            icon: "👥",
        },
        {
            value: "private",
            label: "Private",
            desc: "Hanya kamu yang bisa melihat (Notes)",
            icon: "🔒",
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${content.title}`} />

            <div className="py-10 min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">
                            Edit Konten
                        </h2>
                        <p className="text-gray-400 mt-1">
                            Perbarui informasi konten kamu
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-warm-black border border-gray-700 rounded-3xl p-8 shadow-2xl"
                    >
                        {/* === VISIBILITY === */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-300 mb-3">
                                Visibilitas Konten
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {visibilityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                            setData("visibility", option.value)
                                        }
                                        className={`p-6 rounded-2xl border-2 transition-all text-left ${
                                            data.visibility === option.value
                                                ? "border-emerald-500 bg-emerald-500/10"
                                                : "border-gray-700 hover:border-gray-600 bg-gray-900"
                                        }`}
                                    >
                                        <div className="text-3xl mb-3">
                                            {option.icon}
                                        </div>
                                        <h3 className="font-semibold text-white">
                                            {option.label}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {option.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>
                            {errors.visibility && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.visibility}
                                </p>
                            )}
                        </div>

                        {/* Judul */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Judul Konten
                            </label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-white rounded-2xl px-6 py-4 transition-all placeholder-gray-400"
                                placeholder="Masukkan judul konten..."
                            />
                            {errors.title && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Deskripsi */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Deskripsi Singkat
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-white rounded-2xl px-6 py-4 h-28 transition-all placeholder-gray-400"
                                placeholder="Deskripsi singkat tentang konten..."
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Isi Konten */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Isi Konten Lengkap
                            </label>
                            <textarea
                                value={data.paragraph}
                                onChange={(e) =>
                                    setData("paragraph", e.target.value)
                                }
                                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-white rounded-2xl px-6 py-4 h-64 transition-all placeholder-gray-400"
                                placeholder="Tulis isi konten lengkap di sini..."
                            />
                            {errors.paragraph && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.paragraph}
                                </p>
                            )}
                        </div>

                        {/* Kategori */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">
                                Kategori
                            </label>
                            <select
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className="w-full bg-gray-900 border border-gray-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30 text-white rounded-2xl px-6 py-4 transition-all"
                            >
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {errors.category_id && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.category_id}
                                </p>
                            )}
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-700">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 disabled:text-gray-400 text-white font-semibold px-8 py-3.5 rounded-2xl transition flex-1"
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </button>

                            <Link
                                href="/dashboard"
                                className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold px-8 py-3.5 rounded-2xl transition text-center flex-1"
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
