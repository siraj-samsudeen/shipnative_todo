interface LaunchModeProps {
    appName?: string
    tagline?: string
    description?: string
    iosUrl?: string
    androidUrl?: string
}

export function LaunchMode({
    appName = import.meta.env.VITE_APP_NAME || 'ShipNative',
    tagline = 'Ship your mobile app in days, not months',
    description = 'The ultimate React Native boilerplate built for AI-assisted development.',
    iosUrl = import.meta.env.VITE_IOS_APP_URL,
    androidUrl = import.meta.env.VITE_ANDROID_APP_URL,
}: LaunchModeProps) {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-2xl w-full space-y-8 text-center">
                {/* Logo/Icon */}
                <div className="flex justify-center">
                    <div className="h-20 w-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                        <span className="text-4xl">🚀</span>
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-4">
                    <h1 className="text-6xl font-extrabold text-gray-900 logo-text">
                        {appName}
                    </h1>
                    <p className="text-2xl text-gray-600 font-medium">
                        {tagline}
                    </p>
                </div>

                {/* Description */}
                <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                    {description}
                </p>

                {/* App Store Badges */}
                <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    {iosUrl && (
                        <a
                            href={iosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-105 active:scale-95"
                        >
                            <img
                                src="/app-store-badge.svg"
                                alt="Download on the App Store"
                                className="h-14"
                            />
                        </a>
                    )}

                    {androidUrl && (
                        <a
                            href={androidUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-transform hover:scale-105 active:scale-95"
                        >
                            <img
                                src="/google-play-badge.svg"
                                alt="Get it on Google Play"
                                className="h-14"
                            />
                        </a>
                    )}

                    {/* Fallback when no URLs are provided */}
                    {!iosUrl && !androidUrl && (
                        <div className="space-y-4 pt-4">
                            <p className="text-sm text-gray-400">
                                App store links coming soon
                            </p>
                            <div className="flex gap-4 justify-center opacity-50">
                                <div className="h-14 w-40 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">App Store</span>
                                </div>
                                <div className="h-14 w-40 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-xs text-gray-500">Google Play</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Optional: Feature highlights */}
                <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
                    <div className="space-y-2">
                        <div className="text-3xl">⚡️</div>
                        <h3 className="font-semibold text-gray-900">Lightning Fast</h3>
                        <p className="text-sm text-gray-500">Built with performance in mind</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl">🎨</div>
                        <h3 className="font-semibold text-gray-900">Beautiful Design</h3>
                        <p className="text-sm text-gray-500">Crafted with attention to detail</p>
                    </div>
                    <div className="space-y-2">
                        <div className="text-3xl">🔒</div>
                        <h3 className="font-semibold text-gray-900">Secure & Private</h3>
                        <p className="text-sm text-gray-500">Your data stays protected</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
