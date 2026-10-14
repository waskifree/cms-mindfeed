import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import RelativeTime from "@/Components/RelativeTime";

export default function Index() {
    const { auth, contents = [] } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title="My Notes" />

            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold text-white">
                            My Private Notes
                        </h1>

                        <p className="mt-2 text-gray-400">
                            Semua catatan private milik{" "}
                            <span className="text-emerald-400">
                                {auth?.user?.username ?? auth?.user?.name}
                            </span>
                        </p>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-white">
                            Private Notes{" "}
                            <span className="text-emerald-400">
                                ({contents.length})
                            </span>
                        </h3>
                    </div>

                    {contents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {contents.map((content) => (
                                <Link
                                    key={content.slug}
                                    href={route("content.show", content.slug)}
                                    className="group block rounded-3xl border border-gray-700 bg-[#1E2937] p-6 transition-all duration-300 hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">
                                            🔒 Private
                                        </span>

                                        <span className="text-xs text-gray-500">
                                            <RelativeTime
                                                date={content.created_at}
                                            />
                                        </span>
                                    </div>

                                    <h2 className="mb-3 text-xl font-semibold text-white group-hover:text-emerald-400">
                                        {content.title}
                                    </h2>

                                    <p className="line-clamp-3 text-sm text-gray-400">
                                        {content.description ||
                                            "Tidak ada deskripsi"}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between border-t border-gray-700 pt-4">
                                        <span className="text-sm text-emerald-400">
                                            {content.category?.name ??
                                                "Uncategorized"}
                                        </span>

                                        <span className="text-xs text-gray-500 uppercase">
                                            {content.type}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-gray-700 bg-[#1E2937] py-24 text-center">
                            <div className="mb-4 text-6xl">📝</div>

                            <h3 className="text-xl font-semibold text-white">
                                Belum ada catatan private
                            </h3>

                            <p className="mt-2 text-gray-400">
                                Buat konten baru dengan visibility{" "}
                                <span className="font-semibold text-red-400">
                                    Private
                                </span>{" "}
                                agar muncul di halaman ini.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
