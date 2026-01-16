import Link from "next/link"


import { Sparkles, Search, Share2, TrendingUp } from "lucide-react"
import {
  Navbar
} from "@/features/navbar/presentation/navbar";
import {
  Button
} from "@/features/shared/presentation/button";

export default function Homepage() {
  return (
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center py-20">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border mb-8">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-medium">The modern way to track minerals</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-balance max-w-5xl">
                Your collection, <span className="text-muted-foreground">beautifully organized</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mb-12 leading-relaxed">
                Terralis brings order to your mineral collection with powerful cataloging, intelligent search, and
                stunning visual galleries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-16">
                <Button asChild size="lg" className="text-base px-8 h-12 rounded-xl">
                  <Link href="/auth/sign-up">Start Your Collection</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 rounded-xl bg-transparent">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>

              {/* Feature Preview Grid */}
              <div className="w-full max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Search className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Smart Cataloging</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Instantly search and filter by mineral type, location, acquisition date, and custom tags.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Share2 className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Share & Showcase</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Create beautiful galleries to share your prized specimens with fellow collectors.
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-8 text-left hover:border-primary/50 transition-colors">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">Track Growth</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Monitor your collection's growth over time with insights and statistics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Specimens Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">2.5K+</div>
                <div className="text-sm text-muted-foreground">Active Collectors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Mineral Types</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold mb-2">98%</div>
                <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Deep Dive */}
        <section className="py-24">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-balance">
                Everything you need to manage your collection
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Professional-grade tools designed for collectors who value precision and beauty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Feature 1 */}
              <div className="bg-card border border-border rounded-3xl p-10">
                <div className="mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7 text-primary"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Visual Organization</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Upload high-resolution photos and organize them in customizable galleries. Tag specimens, add detailed
                    notes, and create collections within collections.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-card border border-border rounded-3xl p-10">
                <div className="mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7 text-primary"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Advanced Search</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Find any specimen instantly with powerful filters. Search by name, location, chemical composition,
                    hardness, or custom fields you define.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-card border border-border rounded-3xl p-10">
                <div className="mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7 text-primary"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Data You Own</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Export your entire collection anytime. Your data belongs to you with full backup capabilities and no
                    vendor lock-in.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="bg-card border border-border rounded-3xl p-10">
                <div className="mb-6">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7 text-primary"
                        stroke="currentColor"
                        strokeWidth="2"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Collection Analytics</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Gain insights into your collecting habits. See trends, most common minerals, geographic distributions,
                    and more with beautiful charts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 border-t border-border">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="bg-primary text-primary-foreground rounded-3xl p-12 md:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
                Start organizing your collection today
              </h2>
              <p className="text-lg opacity-90 max-w-2xl mx-auto mb-10 leading-relaxed">
                Join thousands of collectors who trust Terralis to catalog and showcase their mineral collections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-base px-8 h-12 rounded-xl">
                  <Link href="/auth/sign-up">Create Free Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                  <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-4 w-4 text-primary-foreground"
                      stroke="currentColor"
                      strokeWidth="2"
                  >
                    <polygon points="12 2 2 7 12 12 22 7 12 2" />
                    <polyline points="2 17 12 22 22 17" />
                    <polyline points="2 12 12 17 22 12" />
                  </svg>
                </div>
                <span className="font-semibold">Terralis</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2026 Terralis. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
  )
}
