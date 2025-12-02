import { useState, FormEvent } from 'react'

interface WaitlistModeProps {
    appName?: string
    tagline?: string
    description?: string
    screenshotUrl?: string
}

type BentoTile = {
    title: string
    description: string
    icon: string
    accent: string
    pill?: string
    span?: string
    points?: string[]
    metric?: {
        label: string
        value: string
    }
}

type AiTool = {
    name: string
    url: string
    domain: string
    logoText: string
    logoGradient: string
    tagline: string
}

const aiTools: AiTool[] = [
    {
        name: 'GitHub Copilot',
        url: 'https://github.com',
        domain: 'github.com',
        logoText: 'CP',
        logoGradient: 'from-[#0C163D] via-[#0F4C75] to-[#2DD4BF]',
        tagline: 'Context packs tuned for Copilot chat and inline completions.',
    },
    {
        name: 'Cursor',
        url: 'https://cursor.com',
        domain: 'cursor.com',
        logoText: 'Cu',
        logoGradient: 'from-[#0B1021] via-[#1E293B] to-[#38BDF8]',
        tagline: 'Vibecoding prompts that keep Cursor on the happy path.',
    },
    {
        name: 'Windsurf',
        url: 'https://windsurf.com',
        domain: 'windsurf.com',
        logoText: 'Ws',
        logoGradient: 'from-[#0EA5E9] via-[#1FB7AE] to-[#34D399]',
        tagline: 'Pair-programming ready with sandbox-friendly instructions.',
    },
    {
        name: 'Google Antigravity',
        url: 'https://antigravity.google',
        domain: 'antigravity.google',
        logoText: 'G',
        logoGradient: 'from-[#4285F4] via-[#EA4335] to-[#34A853]',
        tagline: 'Google AI setup notes baked into the context files.',
    },
    {
        name: 'Claude Code',
        url: 'https://code.claude.com',
        domain: 'code.claude.com',
        logoText: 'Cl',
        logoGradient: 'from-[#F59E0B] via-[#FB923C] to-[#8B5CF6]',
        tagline: 'Anthropic-specific guidance so Claude writes with your style.',
    },
    {
        name: 'Replit Agent',
        url: 'https://replit.com',
        domain: 'replit.com',
        logoText: 'Rp',
        logoGradient: 'from-[#FF7A18] via-[#F97316] to-[#FB923C]',
        tagline: 'Ready-to-run agent prompts for quick scaffolds and fixes.',
    },
    {
        name: 'Trae',
        url: 'https://trae.ai',
        domain: 'trae.ai',
        logoText: 'Tr',
        logoGradient: 'from-[#7C3AED] via-[#EC4899] to-[#14B8A6]',
        tagline: 'Tailored guardrails keep Trae aligned with ShipNative patterns.',
    },
]

const bentoTiles: BentoTile[] = [
    {
        title: 'AI-first architecture',
        description: 'Context packs tuned for Cursor and Claude so the AI pair codes with your conventions.',
        icon: '🤖',
        pill: 'AI native',
        accent: 'from-[#D9F99D] via-white to-[#A5F3FC]',
        span: 'lg:col-span-2',
        points: [
            'vibe/ docs and .cursorrules keep AI assistants on-rails',
            'Auth, payments, analytics, and notifications are pre-wired',
        ],
    },
    {
        title: 'Mock mode, zero blockers',
        description: 'Ship flows without any API keys using drop-in mocks for every service.',
        icon: '🧪',
        accent: 'from-[#FFF3C6] via-white to-[#FFE4E6]',
        points: [
            'Supabase, RevenueCat, PostHog, and Sentry all mocked',
            'Flip one flag in the dev dashboard to switch modes',
        ],
    },
    {
        title: 'Design that already feels premium',
        description: 'Unistyles-driven tokens, gradients, and glass ready to reuse.',
        icon: '🎨',
        pill: 'UI kit',
        accent: 'from-[#E0F2FE] via-white to-[#C7E9FF]',
        span: 'lg:row-span-2',
        points: [
            'Unistyles 3.0 tokens for spacing, typography, and shadows',
            'Dark and light themes tuned for mobile',
            'Component showcase with 14+ examples to copy',
        ],
    },
    {
        title: 'Monetization wired in',
        description: 'RevenueCat + Lemon Squeezy with paywall and management screens.',
        icon: '💳',
        pill: 'Ready to sell',
        accent: 'from-[#ECFEFF] via-white to-[#DCFCE7]',
        span: 'lg:col-span-2',
        points: [
            'Subscription tiers and freemium logic ready out of the box',
            'Mock payments so you can design flows before going live',
        ],
        metric: {
            label: 'to launch a paywall',
            value: '< 1 hr',
        },
    },
    {
        title: 'Analytics & reliability',
        description: 'PostHog tracking, feature flags, and Sentry hooks baked in.',
        icon: '📊',
        accent: 'from-[#F8FAFC] via-white to-[#E2E8F0]',
        points: [
            'Screen + event tracking helpers with sensible defaults',
            'Performance and crash monitoring configured for prod',
        ],
    },
    {
        title: 'Dev loop optimized',
        description: 'Turbo repo with generators for screens, stores, hooks, and APIs.',
        icon: '🛠️',
        accent: 'from-[#FFE9E0] via-white to-[#FFF6C2]',
        points: [
            'Generate components and screens in seconds',
            'E2E-ready with Jest and Maestro samples',
        ],
    },
]

export function WaitlistMode({
    appName = import.meta.env.VITE_APP_NAME || 'ShipNative',
    tagline = 'Ship your mobile app in days, not months',
    description = 'Join the waitlist to get early access and exclusive launch benefits.',
    screenshotUrl = import.meta.env.VITE_APP_SCREENSHOT_URL || '/app-screenshot.png'
}: WaitlistModeProps) {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateEmail(email)) {
            setStatus('error')
            setErrorMessage('Please enter a valid email address')
            return
        }

        setStatus('loading')
        setErrorMessage('')

        try {
            const apiEndpoint = import.meta.env.VITE_WAITLIST_API_ENDPOINT

            if (apiEndpoint) {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                })

                if (!response.ok) throw new Error('Submission failed')
            } else {
                await new Promise(resolve => setTimeout(resolve, 1000))
                if (import.meta.env.DEV) {
                    console.log('Waitlist signup (demo):', email)
                }
            }

            setStatus('success')
            setEmail('')
        } catch (error) {
            setStatus('error')
            setErrorMessage('Something went wrong. Please try again.')
            if (import.meta.env.DEV) {
                console.error('Waitlist error:', error)
            }
        }
    }

    return (
        <div className="min-h-screen px-4 py-12 bg-gradient-to-br from-[#E8F3FF] via-[#FBFAFF] to-[#FFF3EA] overflow-hidden">
            <div className="max-w-6xl w-full mx-auto space-y-12 lg:space-y-16">
                <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                    {/* Left Column - Content */}
                    <div className="space-y-6 text-center lg:text-left">
                        {/* Logo/Icon */}
                        <div className="flex justify-center lg:justify-start">
                            <div className="h-12 w-12 bg-black rounded-2xl flex items-center justify-center shadow-lg shadow-black/10">
                                <span className="text-2xl">🚀</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="space-y-2">
                            <h1 className="text-4xl lg:text-5xl font-extrabold text-black leading-tight logo-text">
                                {appName}
                            </h1>
                            <p className="text-lg lg:text-xl text-gray-700 font-semibold leading-relaxed">
                                {tagline}
                            </p>
                        </div>

                        {/* Description */}
                        <p className="text-base text-gray-600 max-w-md mx-auto lg:mx-0 leading-relaxed">
                            {description}
                        </p>

                        {/* Form or Success State */}
                        <div className="pt-2 max-w-md mx-auto lg:mx-0">
                            {status === 'success' ? (
                                <div className="bg-white/85 backdrop-blur-sm border border-gray-200 rounded-[32px] p-6 space-y-3 shadow-lg">
                                    <div className="text-3xl leading-10">✅</div>
                                    <h3 className="text-lg font-bold text-black leading-6">You're on the list!</h3>
                                    <p className="text-sm text-gray-700 leading-5">
                                        We'll notify you when we launch. Thanks for your interest!
                                    </p>
                                    <button
                                        onClick={() => setStatus('idle')}
                                        className="text-sm text-gray-600 hover:text-black underline underline-offset-2"
                                    >
                                        Add another email
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="w-full h-14 px-4 bg-white border border-gray-200 rounded-2xl text-base leading-6 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm"
                                            disabled={status === 'loading'}
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-sm text-red-600 leading-5">
                                            {errorMessage}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'loading'}
                                        className="w-full h-14 px-6 bg-black text-white font-semibold text-base rounded-2xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                    >
                                        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Footer Note */}
                        <p className="text-xs text-gray-500 text-center lg:text-left leading-5">
                            No spam, ever. Unsubscribe anytime.
                        </p>
                    </div>

                    {/* Right Column - App Screenshot */}
                    <div className="hidden lg:flex justify-center lg:justify-end">
                        <div className="relative">
                            <div className="relative w-[320px]">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-emerald-200/40 rounded-[3rem] blur-3xl" />

                                {/* Phone Container */}
                                <div className="relative bg-black rounded-[2.75rem] p-2.5 shadow-2xl">
                                    {/* Screen */}
                                    <div className="bg-white rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                                        <img
                                            src={screenshotUrl}
                                            alt="App Screenshot"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement
                                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="650"%3E%3Crect width="300" height="650" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="18" fill="%239ca3af"%3EApp Screenshot%3C/text%3E%3C/svg%3E'
                                            }}
                                        />
                                    </div>

                                    {/* Notch */}
                                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <section
                    id="optimized-for-ai"
                    className="bg-white/80 border border-white/70 rounded-[32px] shadow-[0_25px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur"
                >
                    <div className="p-6 lg:p-10 space-y-8">
                        <div className="flex flex-col gap-3 text-center">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                                Optimized for AI
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900">
                                Works with your favorite coding copilots
                            </h2>
                            <p className="text-base text-slate-600 max-w-3xl mx-auto">
                                ShipNative ships with AI-ready prompts, guardrails, and docs tailored for the tools you already use.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {aiTools.map((tool) => (
                                <a
                                    key={tool.name}
                                    href={tool.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-4 flex flex-col gap-3 hover:-translate-y-0.5 transition-all duration-200 shadow-sm"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-slate-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    <div className="relative flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`relative h-12 w-12 rounded-2xl bg-gradient-to-br ${tool.logoGradient} shadow-md flex items-center justify-center text-white font-semibold`}>
                                                <div className="absolute inset-0 rounded-2xl border border-white/30" />
                                                <span className="relative text-sm tracking-wide">{tool.logoText}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-semibold text-slate-900">{tool.name}</span>
                                                <span className="text-xs text-slate-600">{tool.domain}</span>
                                            </div>
                                        </div>
                                        <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-sm">
                                            +1
                                        </span>
                                    </div>
                                    <p className="relative text-sm text-slate-700 leading-relaxed">
                                        {tool.tagline}
                                    </p>
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white/80 border border-white/70 rounded-[32px] shadow-[0_25px_80px_-60px_rgba(15,23,42,0.65)] backdrop-blur">
                    <div className="p-6 lg:p-10 space-y-8">
                        <div className="flex flex-col gap-3 text-center">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                                Production-grade pieces
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-semibold text-slate-900">
                                A bento grid of ready-to-ship blocks
                            </h2>
                            <p className="text-base text-slate-600 max-w-3xl mx-auto">
                                Each tile is a real part of ShipNative - configured, documented, and paired with mocks so you can move from idea
                                to launch without detours.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(220px,_auto)] lg:auto-rows-[minmax(240px,_auto)] gap-4">
                            {bentoTiles.map((tile) => (
                                <div
                                    key={tile.title}
                                    className={`group relative overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur ${tile.span ?? ''}`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${tile.accent} opacity-90`} />
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/50" />

                                    <div className="relative flex h-full flex-col gap-3 p-6">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl">{tile.icon}</span>
                                            {tile.pill && (
                                                <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full bg-white/85 text-slate-800 border border-white">
                                                    {tile.pill}
                                                </span>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-lg font-semibold text-slate-900 leading-6">{tile.title}</h3>
                                            <p className="text-sm text-slate-700 leading-relaxed">
                                                {tile.description}
                                            </p>
                                        </div>

                                        {tile.points && (
                                            <ul className="space-y-1.5 text-sm text-slate-800 leading-relaxed">
                                                {tile.points.map((point) => (
                                                    <li key={point} className="flex items-start gap-2">
                                                        <span className="mt-1 h-2 w-2 rounded-full bg-slate-900/60" />
                                                        <span>{point}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {tile.metric && (
                                            <div className="mt-auto pt-1 flex items-baseline gap-2 text-slate-900">
                                                <span className="text-2xl font-semibold">{tile.metric.value}</span>
                                                <span className="text-xs uppercase tracking-wide text-slate-600">
                                                    {tile.metric.label}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
