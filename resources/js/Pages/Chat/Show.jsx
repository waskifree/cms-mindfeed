import { Head, useForm, router } from "@inertiajs/react";
import { useEffect, useRef } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Show({ conversation, messages, otherUser, auth }) {
    const { data, setData, post, processing, reset } = useForm({
        body: "",
    });

    const messagesEndRef = useRef(null);
    console.log("otherUser:", otherUser);
    console.log("username:", otherUser?.username);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const submit = (e) => {
        e.preventDefault();
        if (!data.body.trim()) return;

        post(route("chat.store", conversation.id), {
            onSuccess: () => reset("body"),
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Chat with ${otherUser?.name}`} />

            <div className="flex flex-col h-[calc(100vh-64px)]">
                {/* Header Chat */}
                <div
                    className="border-b border-slate-800 px-6 py-4 flex items-center gap-3 shrink-0 bg-[#0f172a] cursor-pointer hover:bg-slate-800/50 transition-colors"
                    onClick={() => {
                        if (!otherUser?.username) return;
                        router.visit(route("profile.show", otherUser.username));
                    }}
                >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">
                        {otherUser?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-white">
                            {otherUser?.name}
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 flex flex-col bg-[#0f172a]">
                    <div className="flex-1" /> {/* Spacer */}
                    <div className="space-y-4">
                        {messages.map((message) => {
                            const isMe = message.user_id === auth.user.id;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                                            isMe
                                                ? "bg-indigo-600 text-white rounded-br-md"
                                                : "bg-slate-700 text-slate-200 rounded-bl-md"
                                        }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap">
                                            {message.body}
                                        </p>
                                        <p
                                            className={`text-[10px] mt-1 ${
                                                isMe
                                                    ? "text-indigo-200"
                                                    : "text-slate-400"
                                            }`}
                                        >
                                            {new Date(
                                                message.created_at,
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form
                    onSubmit={submit}
                    className="border-t border-slate-800 p-4 shrink-0 bg-[#0f172a]"
                >
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={data.body}
                            onChange={(e) => setData("body", e.target.value)}
                            placeholder="Tulis pesan..."
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            autoFocus
                        />

                        {data.body.trim() && (
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-3 rounded-xl font-medium transition text-sm"
                            >
                                {processing ? "..." : "Kirim"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
