//
//  ExampleWidget.swift
//  Example Widget for Shipnative
//
//  A beautifully designed widget showcasing data from your backend.
//  Supports both Supabase and Convex with automatic detection.
//

import WidgetKit
import SwiftUI

// MARK: - Widget Entry

struct ExampleWidgetEntry: TimelineEntry {
    let date: Date
    let title: String
    let subtitle: String?
    let count: Int?
    let data: [String: Any]?
    let error: String?
    let theme: WidgetTheme

    static var placeholder: ExampleWidgetEntry {
        ExampleWidgetEntry(
            date: Date(),
            title: "Loading...",
            subtitle: nil,
            count: nil,
            data: nil,
            error: nil,
            theme: .aurora
        )
    }

    static var error: ExampleWidgetEntry {
        ExampleWidgetEntry(
            date: Date(),
            title: "Error",
            subtitle: "Failed to load data",
            count: nil,
            data: nil,
            error: "Unable to fetch data",
            theme: .aurora
        )
    }
}

// WidgetTheme is defined in WidgetThemes.swift (shared across all widgets)

// MARK: - Timeline Provider

struct ExampleWidgetProvider: TimelineProvider {
    // App Group identifier for sharing data between app and widget
    private let appGroupIdentifier: String = {
        if let explicit = Bundle.main.object(forInfoDictionaryKey: "APP_GROUP_IDENTIFIER") as? String, !explicit.isEmpty {
            return explicit
        }
        if let bundleId = Bundle.main.bundleIdentifier {
            let parts = bundleId.split(separator: ".")
            if parts.count > 2 {
                let baseId = parts.dropLast().joined(separator: ".")
                return "group.\(baseId)"
            } else {
                return "group.\(bundleId)"
            }
        }
        let mainBundleId = Bundle.main.object(forInfoDictionaryKey: "CFBundleIdentifier") as? String ?? "com.shipnative.app"
        return "group.\(mainBundleId)"
    }()

    // Backend configuration keys
    private let supabaseUrlKey = "supabase_url"
    private let supabaseKeyKey = "supabase_key"
    private let convexUrlKey = "convex_url"
    private let sessionTokenKey = "session_token"
    private let widgetThemeKey = "widget_theme"

    func placeholder(in context: Context) -> ExampleWidgetEntry {
        return ExampleWidgetEntry.placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (ExampleWidgetEntry) -> Void) {
        completion(ExampleWidgetEntry.placeholder)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ExampleWidgetEntry>) -> Void) {
        fetchWidgetData { entry in
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }

    // MARK: - Data Fetching

    private func fetchWidgetData(completion: @escaping (ExampleWidgetEntry) -> Void) {
        guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            completion(ExampleWidgetEntry.error)
            return
        }

        // Get theme preference
        let themeString = userDefaults.string(forKey: widgetThemeKey) ?? "aurora"
        let theme = WidgetTheme(rawValue: themeString) ?? .aurora

        // Check for Supabase configuration
        let supabaseUrl = userDefaults.string(forKey: supabaseUrlKey)
        let supabaseKey = userDefaults.string(forKey: supabaseKeyKey)

        // Check for Convex configuration
        let convexUrl = userDefaults.string(forKey: convexUrlKey)

        let sessionToken = userDefaults.string(forKey: sessionTokenKey)

        // Determine which backend to use
        if let supabaseUrl = supabaseUrl, let supabaseKey = supabaseKey, !supabaseUrl.isEmpty {
            fetchFromSupabase(url: supabaseUrl, key: supabaseKey, token: sessionToken, theme: theme, completion: completion)
        } else if let convexUrl = convexUrl, !convexUrl.isEmpty {
            fetchFromConvex(url: convexUrl, token: sessionToken, theme: theme, completion: completion)
        } else {
            // Return mock data for preview/development
            let entry = ExampleWidgetEntry(
                date: Date(),
                title: "Welcome",
                subtitle: "Configure your backend",
                count: 42,
                data: ["status": "mock"],
                error: nil,
                theme: theme
            )
            completion(entry)
        }
    }

    private func fetchFromSupabase(
        url: String,
        key: String,
        token: String?,
        theme: WidgetTheme,
        completion: @escaping (ExampleWidgetEntry) -> Void
    ) {
        guard let endpoint = URL(string: "\(url)/rest/v1/widget_entries?select=title,subtitle,count&order=updated_at.desc&limit=1") else {
            completion(ExampleWidgetEntry.error)
            return
        }

        var request = URLRequest(url: endpoint, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        request.httpMethod = "GET"
        request.setValue(key, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                let entry = ExampleWidgetEntry(
                    date: Date(),
                    title: "Error",
                    subtitle: error.localizedDescription,
                    count: nil,
                    data: nil,
                    error: error.localizedDescription,
                    theme: theme
                )
                completion(entry)
                return
            }

            guard let data = data else {
                completion(ExampleWidgetEntry.error)
                return
            }

            do {
                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase
                let entries = try decoder.decode([SupabaseWidgetEntry].self, from: data)

                if let first = entries.first {
                    let entry = ExampleWidgetEntry(
                        date: Date(),
                        title: first.title ?? "Widget",
                        subtitle: first.subtitle,
                        count: first.count,
                        data: nil,
                        error: nil,
                        theme: theme
                    )
                    completion(entry)
                } else {
                    let entry = ExampleWidgetEntry(
                        date: Date(),
                        title: "No Data",
                        subtitle: "Add entries to get started",
                        count: 0,
                        data: nil,
                        error: nil,
                        theme: theme
                    )
                    completion(entry)
                }
            } catch {
                let entry = ExampleWidgetEntry(
                    date: Date(),
                    title: "Error",
                    subtitle: "Failed to parse data",
                    count: nil,
                    data: nil,
                    error: error.localizedDescription,
                    theme: theme
                )
                completion(entry)
            }
        }

        task.resume()
    }

    private func fetchFromConvex(
        url: String,
        token: String?,
        theme: WidgetTheme,
        completion: @escaping (ExampleWidgetEntry) -> Void
    ) {
        guard let endpoint = URL(string: "\(url)/api/widgets/data") else {
            completion(ExampleWidgetEntry.error)
            return
        }

        var request = URLRequest(url: endpoint, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 15)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let token = token, !token.isEmpty {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        let task = URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                let entry = ExampleWidgetEntry(
                    date: Date(),
                    title: "Error",
                    subtitle: error.localizedDescription,
                    count: nil,
                    data: nil,
                    error: error.localizedDescription,
                    theme: theme
                )
                completion(entry)
                return
            }

            guard let data = data else {
                completion(ExampleWidgetEntry.error)
                return
            }

            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
                    let entry = ExampleWidgetEntry(
                        date: Date(),
                        title: json["title"] as? String ?? "Widget",
                        subtitle: json["subtitle"] as? String,
                        count: json["count"] as? Int,
                        data: json,
                        error: nil,
                        theme: theme
                    )
                    completion(entry)
                } else {
                    completion(ExampleWidgetEntry.error)
                }
            } catch {
                completion(ExampleWidgetEntry.error)
            }
        }

        task.resume()
    }
}

// MARK: - Supabase Models

private struct SupabaseWidgetEntry: Decodable {
    let title: String?
    let subtitle: String?
    let count: Int?
}

// MARK: - Widget View

struct ExampleWidgetView: View {
    var entry: ExampleWidgetProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            // Decorative elements
            GeometryReader { geometry in
                // Floating orbs for depth
                Circle()
                    .fill(entry.theme.accentColor.opacity(0.15))
                    .frame(width: geometry.size.width * 0.6)
                    .blur(radius: 30)
                    .offset(x: geometry.size.width * 0.5, y: -geometry.size.height * 0.2)

                Circle()
                    .fill(entry.theme.accentColor.opacity(0.1))
                    .frame(width: geometry.size.width * 0.4)
                    .blur(radius: 25)
                    .offset(x: -geometry.size.width * 0.2, y: geometry.size.height * 0.6)
            }

            // Content
            if let error = entry.error {
                errorView(error: error)
            } else {
                switch family {
                case .systemSmall:
                    smallWidgetContent
                case .systemMedium:
                    mediumWidgetContent
                default:
                    smallWidgetContent
                }
            }
        }
    }

    private func errorView(error: String) -> some View {
        VStack(spacing: 12) {
            Image(systemName: "exclamationmark.triangle.fill")
                .font(.system(size: 28, weight: .medium))
                .foregroundStyle(
                    LinearGradient(
                        colors: [Color.red.opacity(0.9), Color.orange],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )

            Text("Something went wrong")
                .font(.system(size: 13, weight: .semibold, design: .rounded))
                .foregroundColor(entry.theme.primaryTextColor)

            Text(error)
                .font(.system(size: 10, weight: .regular, design: .rounded))
                .foregroundColor(entry.theme.secondaryTextColor)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .padding()
    }

    private var smallWidgetContent: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header with icon
            HStack(spacing: 8) {
                // App icon placeholder
                RoundedRectangle(cornerRadius: 8)
                    .fill(entry.theme.accentColor.opacity(0.3))
                    .frame(width: 28, height: 28)
                    .overlay(
                        Image(systemName: "sparkles")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(entry.theme.accentColor)
                    )

                VStack(alignment: .leading, spacing: 1) {
                    Text(entry.title)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)
                        .lineLimit(1)

                    if let subtitle = entry.subtitle {
                        Text(subtitle)
                            .font(.system(size: 11, weight: .medium, design: .rounded))
                            .foregroundColor(entry.theme.secondaryTextColor)
                            .lineLimit(1)
                    }
                }
            }

            Spacer()

            // Large count display
            if let count = entry.count {
                HStack(alignment: .lastTextBaseline, spacing: 4) {
                    Text("\(count)")
                        .font(.system(size: 42, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)
                        .minimumScaleFactor(0.5)

                    Text("items")
                        .font(.system(size: 14, weight: .medium, design: .rounded))
                        .foregroundColor(entry.theme.secondaryTextColor)
                        .padding(.bottom, 6)
                }
            }

            Spacer()

            // Footer timestamp
            HStack {
                Spacer()
                Text(entry.date, style: .time)
                    .font(.system(size: 10, weight: .medium, design: .monospaced))
                    .foregroundColor(entry.theme.secondaryTextColor.opacity(0.8))
            }
        }
        .padding(14)
    }

    private var mediumWidgetContent: some View {
        HStack(spacing: 16) {
            // Left side - main info
            VStack(alignment: .leading, spacing: 8) {
                // Header
                HStack(spacing: 10) {
                    RoundedRectangle(cornerRadius: 10)
                        .fill(entry.theme.accentColor.opacity(0.3))
                        .frame(width: 36, height: 36)
                        .overlay(
                            Image(systemName: "sparkles")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(entry.theme.accentColor)
                        )

                    VStack(alignment: .leading, spacing: 2) {
                        Text(entry.title)
                            .font(.system(size: 17, weight: .bold, design: .rounded))
                            .foregroundColor(entry.theme.primaryTextColor)

                        if let subtitle = entry.subtitle {
                            Text(subtitle)
                                .font(.system(size: 12, weight: .medium, design: .rounded))
                                .foregroundColor(entry.theme.secondaryTextColor)
                        }
                    }
                }

                Spacer()

                // Timestamp
                HStack(spacing: 4) {
                    Image(systemName: "clock")
                        .font(.system(size: 10, weight: .medium))
                    Text("Updated \(entry.date, style: .time)")
                        .font(.system(size: 10, weight: .medium, design: .rounded))
                }
                .foregroundColor(entry.theme.secondaryTextColor.opacity(0.8))
            }

            Spacer()

            // Right side - large stat display
            if let count = entry.count {
                VStack(alignment: .trailing, spacing: 4) {
                    Spacer()

                    Text("\(count)")
                        .font(.system(size: 52, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)
                        .minimumScaleFactor(0.5)

                    Text("TOTAL")
                        .font(.system(size: 11, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.accentColor)
                        .tracking(2)

                    Spacer()
                }
            }
        }
        .padding(16)
    }
}

// MARK: - Widget Configuration

struct ExampleWidget: Widget {
    let kind: String = "ExampleWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ExampleWidgetProvider()) { entry in
            if #available(iOS 17.0, *) {
                ExampleWidgetView(entry: entry)
                    .containerBackground(for: .widget) {
                        entry.theme.gradient
                    }
            } else {
                ExampleWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Quick Stats")
        .description("View your data at a glance with a beautiful widget")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
    ExampleWidget()
} timeline: {
    ExampleWidgetEntry.placeholder
    ExampleWidgetEntry(
        date: Date(),
        title: "My Widget",
        subtitle: "Connected",
        count: 128,
        data: nil,
        error: nil,
        theme: .aurora
    )
    ExampleWidgetEntry(
        date: Date(),
        title: "Sunset Theme",
        subtitle: "Looking good",
        count: 42,
        data: nil,
        error: nil,
        theme: .sunset
    )
    ExampleWidgetEntry.error
}

@available(iOS 17.0, *)
#Preview(as: .systemMedium) {
    ExampleWidget()
} timeline: {
    ExampleWidgetEntry(
        date: Date(),
        title: "Dashboard",
        subtitle: "All systems operational",
        count: 256,
        data: nil,
        error: nil,
        theme: .ocean
    )
    ExampleWidgetEntry(
        date: Date(),
        title: "Forest Theme",
        subtitle: "Nature inspired",
        count: 89,
        data: nil,
        error: nil,
        theme: .forest
    )
}
