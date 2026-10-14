import { Head, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect } from "react";
import UserListItem from "@/Components/UserListItem";

export default function Index({ users }) {
    const { filters = {} } = usePage().props;
    const [search, setSearch] = useState(filters.search || "");

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                "/users",
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
            <Head title="Cari User" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="shadow-sm rounded-lg p-6">
                        <h2 className="text-2xl font-bold mb-6 text-white">
                            Cari User
                        </h2>

                        {/* Search input (kalau belum ada) */}
                        <div className="mb-6">
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama atau username..."
                                className="w-full bg-[#1E2937] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
                            />
                        </div>

                        <div className="space-y-3">
                            {users.data.map((user) => (
                                <UserListItem
                                    key={user.id}
                                    user={user}
                                    type="search"
                                />
                            ))}
                        </div>

                        {users.data.length === 0 && (
                            <div className="text-center py-16 text-gray-500">
                                Tidak ada user ditemukan dengan kata kunci "
                                {search}"
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
