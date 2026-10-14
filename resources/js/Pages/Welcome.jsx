import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="MindFeed" />

            <div
                className="min-h-screen"
                style={{ backgroundColor: "#222831" }}
            >
                {/* Header */}
                <header
                    className="flex items-center justify-between px-6 py-5 border-b border-white/10"
                    style={{ backgroundColor: "#222831" }}
                >
                    <a
                        href="#"
                        className="text-white text-2xl font-bold tracking-tight"
                    >
                        mindfeed.
                    </a>

                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <Link
                                href={route("dashboard")}
                                className="rounded-full px-5 py-2.5 text-white font-medium hover:bg-white/10 transition"
                            >
                                Masuk ke Feed
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route("login")}
                                    className="rounded-full px-5 py-2.5 text-white border border-white/30 font-medium hover:bg-white/10 transition"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route("register")}
                                    className="rounded-full text-white font-semibold px-6 py-2.5 border border-white/30 hover:bg-white/10 transition"
                                >
                                    Daftar Gratis
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo */}
                        {/* <img
                            src="/logo/mindfeed-logo.png"
                            alt="MindFeed"
                            className="mx-auto mb-10 w-80 md:w-96"
                        /> */}

                        <h1 className="text-5xl md:text-6xl font-bold text-green mb-6 tracking-tight">
                            Feed Your Mind
                        </h1>

                        <p className="text-xl md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            Platform untuk belajar, ide, pemikiran, cerita, dan
                            pengalaman
                            <br />
                            berbasis teks yang sederhana dan bermakna.
                            <span className="text-sm text-slate-400">
                                bertemu teman baru, berbagi ide, dan membangun
                                komunitas!
                            </span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route("register")}
                                className="px-8 py-4 rounded-full bg-green transition-all duration-300 
             hover:scale-105  
             hover:shadow-[#A4DD00]  font-semibold transition"
                            >
                                Mulai Menulis Sekarang
                            </Link>

                            <Link
                                href="#learn-more"
                                className="px-8 py-4 rounded-full border border-white/30 text-white font-medium hover:bg-white/10 transition"
                            >
                                Pelajari Lebih Lanjut
                            </Link>
                        </div>
                    </div>
                </main>

                {/* Simple Features */}
                <div
                    className="py-16 px-6 border-t border-white/10 bg-green/85 "
                    id="learn-more"
                >
                    <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <h3 className="text-2xl font-semibold text-warm-black mb-3">
                                Tulis Bebas
                            </h3>
                            <p className="text-warm-black">
                                Bagikan title, deskripsi, dan isi konten teks
                                tanpa batas.
                            </p>
                        </div>

                        <div className="p-6 border-t border-white/20 md:border-t-0">
                            <h3 className="text-2xl font-semibold text-warm-black mb-3">
                                Interaksi
                            </h3>
                            <p className="text-warm-black">
                                Like, komentar, dan terhubung dengan pemikiran
                                orang lain.
                            </p>
                        </div>

                        <div className="p-6 border-t border-white/20 md:border-t-0">
                            <h3 className="text-2xl font-semibold text-warm-black mb-3">
                                Komunitas
                            </h3>
                            <p className="text-warm-black">
                                Bangun komunitas berdasarkan ide dan minat yang
                                sama.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/10">
                    <p>© 2026 MindFeed. All rights reserved.</p>
                </footer>
            </div>
        </>
    );
}
