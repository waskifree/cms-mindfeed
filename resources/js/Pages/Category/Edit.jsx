import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Edit({ category }) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("category.update", category.slug));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit: ${category.name}`} />

            <div className="py-6">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">
                            Edit Category
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Ubah nama kategori
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-[#1E2937] border border-gray-700 rounded-2xl p-6 sm:p-8 space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nama Kategori
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="w-full bg-[#0f172a] border border-gray-600 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500 transition"
                            />
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-2">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-medium transition disabled:opacity-50"
                            >
                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}
                            </button>

                            <Link
                                href={route("category.index")}
                                className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition"
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
