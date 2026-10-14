import { Head, usePage, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import GoBack from "@/Components/goBack";
import UserListItem from "@/Components/UserListItem";

export default function Following() {
    const { user, following } = usePage().props;

    const list = following?.data ?? following ?? [];
    const hasData = Array.isArray(list) && list.length > 0;

    return (
        <AuthenticatedLayout>
            <Head title={`Following - ${user?.name}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <GoBack />
                        <h2 className="text-2xl font-semibold text-gray-200 mt-4">
                            Following{" "}
                            <span className="text-gray-400 text-lg font-normal">
                                ({user?.following_count ?? list.length})
                            </span>
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            Orang yang diikuti @{user?.username}
                        </p>
                    </div>

                    {hasData ? (
                        <div className="space-y-3">
                            {list.map((followed) => (
                                <UserListItem
                                    key={followed.id}
                                    user={followed}
                                    type="following"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-gray-500 bg-[#1E2937] rounded-2xl border border-gray-700">
                            Belum mengikuti siapapun.
                        </div>
                    )}

                    {/* Pagination sederhana */}
                    {following?.links && (
                        <div className="mt-6 flex justify-center gap-3">
                            {following.links.prev && (
                                <Link
                                    href={following.links.prev}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                                    preserveScroll
                                >
                                    ← Previous
                                </Link>
                            )}
                            {following.links.next && (
                                <Link
                                    href={following.links.next}
                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm"
                                    preserveScroll
                                >
                                    Next →
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
