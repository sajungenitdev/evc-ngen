'use client';

import Counter from './Counter';

export default function StatsBar() {
    return (
        <section className="bg-[#0c1b2e] py-5 border-b border-white/10">
            <div className="max-w-7xl mx-auto w-full px-6 md:px-12 lg:px-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <Counter end={200000} suffix="+" label="Products" duration={2500} />
                    <Counter end={5000} suffix="+" label="Accessories" duration={2000} />
                    <Counter end={50} suffix="+" label="Services" duration={1500} />
                    <Counter end={24} suffix="/7" label="Training" duration={1000} />
                </div>
            </div>
        </section>
    );
}