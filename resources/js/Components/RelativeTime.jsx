import React from "react";

export default function RelativeTime({ date, datetime }) {
    if (!date && !datetime) return null;

    const formatRelativeTime = (dateString) => {
        const dateObj = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - dateObj) / 1000);

        // Kurang dari 1 menit
        if (diffInSeconds < 60) {
            return "Baru saja";
        }

        // Kurang dari 1 jam
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} menit yang lalu`;
        }

        // Kurang dari 1 hari
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} jam yang lalu`;
        }

        // Kurang dari 7 hari
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} hari yang lalu`;
        }

        // Kurang dari 30 hari
        const diffInWeeks = Math.floor(diffInDays / 7);
        if (diffInDays < 30) {
            return `${diffInWeeks} minggu yang lalu`;
        }

        // Lebih dari 1 bulan → tampilkan tanggal lengkap
        return dateObj.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    return (
        <span className="text-xs text-gray-500">
            {formatRelativeTime(date)}
        </span>
    );
}
