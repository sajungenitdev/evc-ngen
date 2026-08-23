'use client';

import Link from 'next/link';
import Image from 'next/image';
import { helpSupportSectionData } from '@/lib/db';

export default function HelpSupportSection() {
    const { salesCard, ticketCard, supportHubCard, reviewCard, socialCard } = helpSupportSectionData;

    return (
        <section className="bg-ev-light-gray py-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Top Row: 2 Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Sales Team Card (Span 8) */}
                    <div className="relative lg:col-span-8 rounded-3xl p-8 sm:p-12 text-white flex flex-col justify-between shadow-xl min-h-90 overflow-hidden bg-[#114b34] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
                        <Image
                            src={salesCard.imageUrl}
                            alt="Sales Team Background"
                            fill
                            className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-[#114b34] via-[#114b34]/90 to-transparent"></div>

                        <div className="relative z-10">
                            {/* Online Status Badge */}
                            <div className="flex items-center gap-2 mb-6">
                                <span className="w-2.5 h-2.5 rounded-full bg-ev-green animate-pulse"></span>
                                <span className="text-ev-green text-xs font-bold uppercase tracking-wider">
                                    {salesCard.status}
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                                {salesCard.title}{' '}
                                <span className="text-ev-green">{salesCard.highlightText}</span>
                            </h2>
                        </div>

                        <div className="relative z-10 pt-8">
                            <Link
                                href={`/contact`}
                                className="inline-block mt-4 bg-[#1b7936] text-white px-6 py-3 rounded-lg font-bold hover:bg-[#155f2b] transition-colors"
                            >
                                {salesCard.buttonText}
                            </Link>
                        </div>
                    </div>

                    {/* Raise a Ticket Card (Span 4) */}
                    <div className="relative lg:col-span-4 rounded-3xl p-8 sm:p-10 text-white flex flex-col justify-between shadow-xl min-h-90 overflow-hidden bg-[#648777] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl group">
                        <Image
                            src={ticketCard.imageUrl}
                            alt="Raise a Ticket Background"
                            fill
                            className="object-cover opacity-30 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-xl sm:text-2xl font-bold leading-snug tracking-tight">
                            {ticketCard.description}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={ticketCard.link}
                                className="inline-flex items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform"
                            >
                                {ticketCard.linkText}
                            </Link>
                        </div>
                    </div>

                </div>

                {/* Bottom Row: 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Support Hub Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#e9edf060] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <Image
                            src={supportHubCard.imageUrl}
                            alt="Support Hub Background"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-lg sm:text-xl font-bold text-white leading-snug">
                            {supportHubCard.description}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={supportHubCard.link}
                                className="inline-flex items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform"
                            >
                                {supportHubCard.linkText}
                            </Link>
                        </div>
                    </div>

                    {/* Leave a Review Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#071322] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <Image
                            src={reviewCard.imageUrl}
                            alt="Leave a Review Background"
                            fill
                            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <p className="relative z-10 text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-sm">
                            {reviewCard.description}
                        </p>
                        <div className="relative z-10">
                            <Link
                                href={reviewCard.link}
                                className="inline-flex underline items-center gap-1 text-white font-bold text-sm hover:translate-x-1 transition-transform drop-shadow-sm"
                            >
                                {reviewCard.linkText}
                            </Link>
                        </div>
                    </div>

                    {/* Stay Connected Card */}
                    <div className="relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between shadow-sm min-h-70 overflow-hidden bg-[#071322] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl group">
                        <Image
                            src={socialCard.imageUrl}
                            alt="Stay Connected Background"
                            fill
                            className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-[#071322] via-[#36495d]/60 to-transparent"></div>

                        <h3 className="relative z-10 text-lg sm:text-xl font-bold text-white">
                            {socialCard.title}
                        </h3>
                        <div className="relative z-10 flex gap-3">
                            {socialCard.socials.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-full bg-[#114b34] hover:bg-[#0c3625] text-white flex items-center justify-center font-bold text-sm transition-all duration-200 hover:scale-110 shadow-md"
                                >
                                    {social.name}
                                </a>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </section>
    );
}