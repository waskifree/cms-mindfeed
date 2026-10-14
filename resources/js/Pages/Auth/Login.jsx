import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: "",
        password: "",
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login - MindFeed" />

            <div>
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-10">
                        {/* <img
                            src="/logo/mindfeed-logo.png"
                            alt="MindFeed"
                            className="mx-auto w-52 mb-6"
                        /> */}

                        <h1 className="text-2xl font-bold text-green">
                            Selamat Datang Kembali
                        </h1>
                        <p className="text-slate-200 text-sm mt-2">
                            Masuk ke akun MindFeed kamu
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 text-sm font-medium text-green-400 bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel
                                htmlFor="username"
                                value="Username"
                                className="text-slate-300"
                            />
                            <TextInput
                                id="username"
                                type="text"
                                name="username"
                                value={data.username}
                                className="mt-1 block w-full bg-[#222831] border-slate-700 text-slate-300 focus:border-green focus:ring-green"
                                autoComplete="username"
                                isFocused={true}
                                onChange={(e) =>
                                    setData("username", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.username}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <InputLabel
                                htmlFor="password"
                                value="Password"
                                className="text-slate-300"
                            />

                            <div className="relative">
                                <TextInput
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full bg-[#222831] border-slate-700 text-slate-300 focus:border-green focus:ring-green pr-10"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />

                                {/* Toggle Show/Hide Password */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>

                            <InputError
                                message={errors.password}
                                className="mt-2"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center text-slate-300">
                                <Checkbox
                                    className="rounded border-slate-900 text-green focus:ring-green"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData("remember", e.target.checked)
                                    }
                                />
                                <span className="ms-2 text-sm">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="text-sm text-slate-400 hover:brightness-150 transition"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <PrimaryButton
                            className="w-full py-3 text-base font-semibold bg-blue hover:text-green transition"
                            disabled={processing}
                        >
                            {processing ? "Memproses..." : "Masuk"}
                        </PrimaryButton>

                        <div className="text-center text-slate-400 hover:brightness-150 transition text-sm">
                            <Link
                                href={route("register")}
                                className="text-blue-100 hover:text-blue-200  font-medium"
                            >
                                Belum punya akun? Daftar sekarang
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
