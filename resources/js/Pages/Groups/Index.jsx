import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, usePage, Link, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
import { UsersRound, Plus, Archive, X } from "lucide-react";

export default function Index() {
    const {
        auth,
        groups = [],
        pendingInvitations = [],
        archivedInvitations = [],
        flash,
    } = usePage().props;

    const currentUserId = auth?.user?.id;
    const [showArchive, setShowArchive] = useState(false);

    const isOwner = (group) => {
        const ownerId =
            group.user_id ?? group.owner?.id ?? group.user?.id ?? null;
        return ownerId && currentUserId && ownerId === currentUserId;
    };

    // Pisah grup: milik saya vs orang lain
    const { myGroups, otherGroups } = useMemo(() => {
        const mine = [];
        const others = [];

        groups.forEach((g) => {
            if (isOwner(g)) mine.push(g);
            else others.push(g);
        });

        return { myGroups: mine, otherGroups: others };
    }, [groups, currentUserId]);

    const handleDelete = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (confirm("Yakin ingin menghapus grup ini?")) {
            router.delete(route("groups.destroy", id));
        }
    };

    const handleAccept = (invitationId) => {
        router.post(route("groups.invitations.accept", invitationId));
    };

    const handleReject = (invitationId) => {
        router.post(route("groups.invitations.reject", invitationId));
    };

    // ===== Mobile Card =====
    const renderMobileCard = (group, mine = false) => (
        <Link
            key={group.id}
            href={route("groups.show", group.id)}
            className={`block bg-[#1e2937] rounded-2xl p-5 transition hover:bg-slate-800/80 ${
                mine
                    ? "border-2 border-emerald-500/40"
                    : "border border-gray-700"
            }`}
        >
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {group.name?.charAt(0).toUpperCase() || "G"}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-lg truncate">
                            {group.name}
                        </h3>
                        {mine && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
                                Milikmu
                            </span>
                        )}
                    </div>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {group.description || "Tidak ada deskripsi"}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                        <span>{group.members_count ?? 0} anggota</span>
                        <span>•</span>
                        <span>
                            {group.owner?.name || group.user?.name || "Unknown"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Aksi — stopPropagation biar tidak ikut navigasi Link */}
            <div
                className="flex gap-2 mt-4 pt-4 border-t border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <span className="flex-1 text-center text-sm py-2 rounded-lg bg-slate-700 text-white">
                    Lihat
                </span>

                {mine && (
                    <>
                        <Link
                            href={route("groups.edit", group.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-center text-sm py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 transition"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={(e) => handleDelete(e, group.id)}
                            className="flex-1 text-center text-sm py-2 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition"
                        >
                            Hapus
                        </button>
                    </>
                )}
            </div>
        </Link>
    );

    // ===== Desktop Row =====
    const renderDesktopRow = (group, mine = false) => (
        <tr
            key={group.id}
            onClick={() => router.visit(route("groups.show", group.id))}
            className={`cursor-pointer transition ${
                mine
                    ? "bg-emerald-500/5 hover:bg-emerald-500/10 border-l-4 border-l-emerald-500"
                    : "hover:bg-slate-800/50"
            }`}
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm">
                        {group.name?.charAt(0).toUpperCase() || "G"}
                    </div>
                    <div>
                        <span className="font-medium text-white">
                            {group.name}
                        </span>
                        {mine && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                                Milikmu
                            </span>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-300 max-w-xs truncate">
                {group.description || "-"}
            </td>
            <td className="px-6 py-4 text-sm text-gray-300">
                {group.members_count ?? 0}
            </td>
            <td className="px-6 py-4 text-sm text-gray-300">
                {group.owner?.name || group.user?.name || "-"}
            </td>
            <td
                className="px-6 py-4 text-center space-x-4"
                onClick={(e) => e.stopPropagation()}
            >
                <Link
                    href={route("groups.show", group.id)}
                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                >
                    Lihat
                </Link>

                {mine && (
                    <>
                        <Link
                            href={route("groups.edit", group.id)}
                            className="text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={(e) => handleDelete(e, group.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                        >
                            Hapus
                        </button>
                    </>
                )}
            </td>
        </tr>
    );

    return (
        <AuthenticatedLayout>
            <Head title="Groups" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* HEADER */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                <UsersRound
                                    className="text-emerald-400"
                                    size={28}
                                />
                                Groups
                            </h2>
                            <p className="text-gray-400 mt-1 text-sm">
                                Kelola dan bergabung dengan grup
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowArchive(true)}
                                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                                <Archive size={16} />
                                Arsip
                                {archivedInvitations.length > 0 && (
                                    <span className="bg-gray-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                        {archivedInvitations.length}
                                    </span>
                                )}
                            </button>

                            <Link
                                href={route("groups.create")}
                                className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                            >
                                <Plus size={18} />
                                Buat Grup Baru
                            </Link>
                        </div>
                    </div>

                    {/* FLASH */}
                    {flash?.success && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6">
                            {flash.error}
                        </div>
                    )}

                    {/* UNDANGAN PENDING */}
                    {pendingInvitations.length > 0 && (
                        <div className="mb-8 space-y-3">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                📩 Undangan Masuk
                                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingInvitations.length}
                                </span>
                            </h3>

                            {pendingInvitations.map((invitation) => (
                                <div
                                    key={invitation.id}
                                    className="bg-[#1e2937] border border-emerald-500/30 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                >
                                    <div>
                                        <p className="text-white font-medium">
                                            <span className="text-emerald-400">
                                                @{invitation.inviter?.username}
                                            </span>{" "}
                                            mengundang kamu ke grup
                                        </p>
                                        <p className="text-lg text-white font-semibold mt-1">
                                            {invitation.group?.name}
                                        </p>
                                        <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                                            {invitation.group?.description ||
                                                "Tidak ada deskripsi"}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleAccept(invitation.id)
                                            }
                                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition"
                                        >
                                            Terima
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleReject(invitation.id)
                                            }
                                            className="px-5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition"
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ====================== MOBILE ====================== */}
                    <div className="md:hidden space-y-8">
                        {/* Grup Saya */}
                        <section>
                            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Grup saya ({myGroups.length})
                            </h3>
                            <div className="space-y-4">
                                {myGroups.length > 0 ? (
                                    myGroups.map((g) =>
                                        renderMobileCard(g, true),
                                    )
                                ) : (
                                    <div className="bg-[#1e2937] border border-dashed border-emerald-500/30 rounded-2xl py-10 text-center text-gray-500 text-sm">
                                        Belum ada grup milikmu.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Grup Lain */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-500" />
                                Grup lain ({otherGroups.length})
                            </h3>
                            <div className="space-y-4">
                                {otherGroups.length > 0 ? (
                                    otherGroups.map((g) =>
                                        renderMobileCard(g, false),
                                    )
                                ) : (
                                    <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-10 text-center text-gray-500 text-sm">
                                        Belum ada grup dari orang lain.
                                    </div>
                                )}
                            </div>
                        </section>

                        {groups.length === 0 && (
                            <div className="bg-[#1e2937] border border-gray-700 rounded-2xl py-16 text-center">
                                <UsersRound
                                    size={40}
                                    className="mx-auto text-gray-600 mb-4"
                                />
                                <p className="text-gray-400 text-lg">
                                    Belum ada grup
                                </p>
                                <p className="text-gray-500 text-sm mt-2">
                                    Buat grup pertama kamu sekarang
                                </p>
                                <Link
                                    href={route("groups.create")}
                                    className="inline-flex items-center gap-2 mt-5 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition"
                                >
                                    <Plus size={16} />
                                    Buat Grup
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* ====================== DESKTOP ====================== */}
                    <div className="hidden md:block space-y-8">
                        {/* Grup Saya */}
                        <section>
                            <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                Grup saya ({myGroups.length})
                            </h3>
                            <div className="bg-[#1e2937] border-2 border-emerald-500/30 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#0f172a]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Nama Grup
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Deskripsi
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Anggota
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Dibuat oleh
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {myGroups.length > 0 ? (
                                            myGroups.map((g) =>
                                                renderDesktopRow(g, true),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-10 text-center text-gray-500 text-sm"
                                                >
                                                    Belum ada grup milikmu.{" "}
                                                    <Link
                                                        href={route(
                                                            "groups.create",
                                                        )}
                                                        className="text-emerald-400 hover:underline"
                                                    >
                                                        Buat sekarang
                                                    </Link>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Grup Lain */}
                        <section>
                            <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-500" />
                                Grup lain ({otherGroups.length})
                            </h3>
                            <div className="bg-[#1e2937] border border-gray-700 rounded-2xl overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#0f172a]">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Nama Grup
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Deskripsi
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Anggota
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">
                                                Dibuat oleh
                                            </th>
                                            <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700">
                                        {otherGroups.length > 0 ? (
                                            otherGroups.map((g) =>
                                                renderDesktopRow(g, false),
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="px-6 py-10 text-center text-gray-500 text-sm"
                                                >
                                                    Belum ada grup dari orang
                                                    lain.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* POPUP ARSIP */}
                    {showArchive && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <div
                                className="absolute inset-0 bg-black/60"
                                onClick={() => setShowArchive(false)}
                            />
                            <div className="relative bg-[#1e2937] border border-gray-700 rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                                <div className="flex items-center justify-between p-5 border-b border-gray-700">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                        <Archive size={20} />
                                        Arsip Undangan
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowArchive(false)}
                                        className="p-2 rounded-xl hover:bg-slate-700 text-gray-400 hover:text-white transition"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="overflow-y-auto p-5 space-y-3">
                                    {archivedInvitations.length > 0 ? (
                                        archivedInvitations.map(
                                            (invitation) => (
                                                <div
                                                    key={invitation.id}
                                                    className="bg-[#0f172a] border border-gray-700 rounded-2xl p-4"
                                                >
                                                    <div className="flex justify-between items-start gap-3">
                                                        <div>
                                                            <p className="text-white font-medium">
                                                                {
                                                                    invitation
                                                                        .group
                                                                        ?.name
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-400 mt-1">
                                                                Dari @
                                                                {
                                                                    invitation
                                                                        .inviter
                                                                        ?.username
                                                                }
                                                            </p>
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {new Date(
                                                                    invitation.updated_at,
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "numeric",
                                                                        month: "long",
                                                                        year: "numeric",
                                                                    },
                                                                )}
                                                            </p>
                                                        </div>
                                                        <span
                                                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                                                invitation.status ===
                                                                "accepted"
                                                                    ? "bg-emerald-500/15 text-emerald-400"
                                                                    : "bg-red-500/15 text-red-400"
                                                            }`}
                                                        >
                                                            {invitation.status ===
                                                            "accepted"
                                                                ? "Diterima"
                                                                : "Ditolak"}
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div className="text-center py-10 text-gray-500">
                                            Belum ada arsip undangan.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
