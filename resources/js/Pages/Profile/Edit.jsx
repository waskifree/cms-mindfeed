import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import DeleteUserForm from "./Partials/DeleteUserForm";
import UpdatePasswordForm from "./Partials/UpdatePasswordForm";
import UpdateProfileInformationForm from "./Partials/UpdateProfileInformationForm";

export default function Edit({ mustVerifyEmail, status, user }) {
    const goBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            router.get("/dashboard");
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Pengaturan Profil" />

            <div className="py-10 min-h-screen">
                <div className="mx-auto max-w-3xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Header + Actions */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                Pengaturan Akun
                            </h1>
                            <p className="text-slate-400 text-sm mt-1">
                                Kelola informasi profil dan keamanan akunmu
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={goBack}
                                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl text-sm font-medium transition"
                            >
                                ← Kembali
                            </button>

                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition"
                            >
                                Logout
                            </Link>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="bg-[#1e2937] border border-slate-700 shadow-xl rounded-2xl p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Informasi Profil
                        </h3>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            user={user}
                            className="max-w-xl"
                        />
                    </div>

                    {/* Update Password */}
                    <div className="bg-[#1e2937] border border-slate-700 shadow-xl rounded-2xl p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-white mb-6">
                            Ubah Password
                        </h3>
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    {/* Delete Account */}
                    <div className="bg-[#1e2937] border border-slate-700 shadow-xl rounded-2xl p-6 sm:p-8">
                        <h3 className="text-lg font-semibold text-white mb-2">
                            Hapus Akun
                        </h3>
                        <p className="text-slate-400 text-sm mb-6">
                            Setelah akun dihapus, semua data akan hilang secara
                            permanen.
                        </p>
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
