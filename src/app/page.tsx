import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, CreditCard, PieChart, Shield } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Navbar */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-white/5 bg-background/50 backdrop-blur-md fixed top-0 w-full z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <span className="font-bold text-xl tracking-tight">SmartSplit</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link href="/sign-in" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Sign In
                    </Link>
                    <Button asChild className="rounded-full shadow-lg shadow-primary/20">
                        <Link href="/sign-up">Get Started</Link>
                    </Button>
                </div>
            </header>

            <main className="flex-1 pt-24">
                {/* Hero Section */}
                <section className="container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                        AI-Powered Expense Management
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white via-indigo-200 to-indigo-400 max-w-4xl">
                        Split bills instantly.<br />
                        <span className="text-primary">Settle without stress.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                        Upload receipts, let AI handle the math, and settle debts in seconds.
                        The modern way to manage shared expenses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <Button asChild size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all">
                            <Link href="/sign-up">
                                Start Splitting Free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg border-white/10 hover:bg-white/5 backdrop-blur-sm">
                            <Link href="/sign-in">Live Demo</Link>
                        </Button>
                    </div>

                    {/* Hero Image / Abstract Graphic */}
                    <div className="relative w-full max-w-5xl mt-20 group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden aspect-video shadow-2xl">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10"></div>
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                {/* Abstract UI Representation */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-12 w-full max-w-4xl opacity-80">
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center"><CreditCard className="text-indigo-400" /></div>
                                        <div className="h-4 w-24 bg-white/10 rounded"></div>
                                        <div className="h-3 w-full bg-white/5 rounded"></div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4 translate-y-8">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center"><PieChart className="text-purple-400" /></div>
                                        <div className="h-4 w-24 bg-white/10 rounded"></div>
                                        <div className="h-3 w-full bg-white/5 rounded"></div>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 p-6 rounded-xl flex flex-col gap-4">
                                        <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center"><Shield className="text-pink-400" /></div>
                                        <div className="h-4 w-24 bg-white/10 rounded"></div>
                                        <div className="h-3 w-full bg-white/5 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features */}
                <section className="py-24 bg-white/5 relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Why SmartSplit?</h2>
                            <p className="text-muted-foreground text-lg">Everything you need to manage shared finances.</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { icon: <Check className="h-6 w-6 text-green-400" />, title: "AI Receipt Scanning", desc: "Upload a photo and let our AI extract items, prices, and taxes instantly." },
                                { icon: <Shield className="h-6 w-6 text-indigo-400" />, title: "Secure & Private", desc: "Your financial data is encrypted and secure. We prioritize your privacy." },
                                { icon: <CreditCard className="h-6 w-6 text-purple-400" />, title: "Smart Settlements", desc: "Our algorithms minimize the number of transactions needed to settle debts." }
                            ].map((feature, i) => (
                                <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-colors backdrop-blur-sm">
                                    <div className="mb-6 p-4 rounded-full bg-white/5 w-fit">{feature.icon}</div>
                                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                    <p className="text-muted-foreground">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="border-t border-white/10 py-12 bg-black/20">
                <div className="container mx-auto px-6 text-center text-muted-foreground">
                    <p>&copy; 2024 SmartSplit AI. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
