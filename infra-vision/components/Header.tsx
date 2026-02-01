"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const pathname = usePathname();

    if (pathname === '/') {
        return null;
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#00A8E8] to-[#34D399] bg-clip-text text-transparent">
                        InfraVision
                    </Link>
                    <div className="flex items-center gap-6">
                        {/* Navigation links can be added here if needed in the future */}
                    </div>
                </div>
            </div>
        </nav>
    );
}
