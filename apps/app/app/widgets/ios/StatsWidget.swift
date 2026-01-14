//
//  StatsWidget.swift
//  Stats Widget for Shipnative
//
//  A visually striking widget displaying user statistics with
//  beautiful animations and theme support. Works with both
//  Supabase and Convex backends.
//

import WidgetKit
import SwiftUI

// MARK: - Widget Entry

struct StatsWidgetEntry: TimelineEntry {
    let date: Date
    let stats: [StatItem]
    let error: String?
    let theme: WidgetTheme

    struct StatItem: Identifiable {
        let id = UUID()
        let label: String
        let value: String
        let icon: String
        let color: Color
        let trend: Trend?

        enum Trend {
            case up, down, neutral

            var icon: String {
                switch self {
                case .up: return "arrow.up.right"
                case .down: return "arrow.down.right"
                case .neutral: return "minus"
                }
            }

            var color: Color {
                switch self {
                case .up: return .green
                case .down: return .red
                case .neutral: return .gray
                }
            }
        }
    }

    static var placeholder: StatsWidgetEntry {
        StatsWidgetEntry(
            date: Date(),
            stats: [
                StatItem(label: "Tasks", value: "12", icon: "checkmark.circle.fill", color: .green, trend: .up),
                StatItem(label: "Streak", value: "5", icon: "flame.fill", color: .orange, trend: .up),
                StatItem(label: "Points", value: "420", icon: "star.fill", color: .yellow, trend: nil),
                StatItem(label: "Level", value: "7", icon: "crown.fill", color: .purple, trend: nil),
            ],
            error: nil,
            theme: .aurora
        )
    }

    static var error: StatsWidgetEntry {
        StatsWidgetEntry(
            date: Date(),
            stats: [],
            error: "Unable to load stats",
            theme: .aurora
        )
    }
}

// MARK: - Timeline Provider

struct StatsWidgetProvider: TimelineProvider {
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
        return "group.com.shipnative.app"
    }()

    private let supabaseUrlKey = "supabase_url"
    private let supabaseKeyKey = "supabase_key"
    private let convexUrlKey = "convex_url"
    private let sessionTokenKey = "session_token"
    private let widgetThemeKey = "widget_theme"

    func placeholder(in context: Context) -> StatsWidgetEntry {
        return StatsWidgetEntry.placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (StatsWidgetEntry) -> Void) {
        completion(StatsWidgetEntry.placeholder)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<StatsWidgetEntry>) -> Void) {
        fetchStats { entry in
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }

    // MARK: - Data Fetching

    private func fetchStats(completion: @escaping (StatsWidgetEntry) -> Void) {
        guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            completion(StatsWidgetEntry.error)
            return
        }

        let themeString = userDefaults.string(forKey: widgetThemeKey) ?? "aurora"
        let theme = WidgetTheme(rawValue: themeString) ?? .aurora

        let supabaseUrl = userDefaults.string(forKey: supabaseUrlKey)
        let supabaseKey = userDefaults.string(forKey: supabaseKeyKey)
        let convexUrl = userDefaults.string(forKey: convexUrlKey)
        let sessionToken = userDefaults.string(forKey: sessionTokenKey)

        if let supabaseUrl = supabaseUrl, let supabaseKey = supabaseKey, !supabaseUrl.isEmpty {
            fetchFromSupabase(url: supabaseUrl, key: supabaseKey, token: sessionToken, theme: theme, completion: completion)
        } else if let convexUrl = convexUrl, !convexUrl.isEmpty {
            fetchFromConvex(url: convexUrl, token: sessionToken, theme: theme, completion: completion)
        } else {
            // Mock mode with beautiful placeholder data
            completion(StatsWidgetEntry.placeholder)
        }
    }

    private func fetchFromSupabase(
        url: String,
        key: String,
        token: String?,
        theme: WidgetTheme,
        completion: @escaping (StatsWidgetEntry) -> Void
    ) {
        guard let endpoint = URL(string: "\(url)/rest/v1/user_stats?select=label,value,icon,color,trend&order=sort_order.asc&limit=4") else {
            completion(StatsWidgetEntry.error)
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
                let entry = StatsWidgetEntry(
                    date: Date(),
                    stats: [],
                    error: error.localizedDescription,
                    theme: theme
                )
                completion(entry)
                return
            }

            guard let data = data else {
                completion(StatsWidgetEntry.error)
                return
            }

            do {
                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase
                let entries = try decoder.decode([SupabaseStatEntry].self, from: data)

                let stats = entries.map { entry in
                    StatsWidgetEntry.StatItem(
                        label: entry.label ?? "Stat",
                        value: entry.value ?? "0",
                        icon: entry.icon ?? "circle.fill",
                        color: colorFromString(entry.color),
                        trend: trendFromString(entry.trend)
                    )
                }

                let result = StatsWidgetEntry(
                    date: Date(),
                    stats: stats.isEmpty ? defaultStats() : stats,
                    error: nil,
                    theme: theme
                )
                completion(result)
            } catch {
                completion(StatsWidgetEntry.error)
            }
        }

        task.resume()
    }

    private func fetchFromConvex(
        url: String,
        token: String?,
        theme: WidgetTheme,
        completion: @escaping (StatsWidgetEntry) -> Void
    ) {
        guard let endpoint = URL(string: "\(url)/api/widgets/stats") else {
            completion(StatsWidgetEntry.error)
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
                let entry = StatsWidgetEntry(
                    date: Date(),
                    stats: [],
                    error: error.localizedDescription,
                    theme: theme
                )
                completion(entry)
                return
            }

            guard let data = data else {
                completion(StatsWidgetEntry.error)
                return
            }

            do {
                if let json = try JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
                    let stats = json.compactMap { item -> StatsWidgetEntry.StatItem? in
                        guard let label = item["label"] as? String,
                              let value = item["value"] as? String else { return nil }
                        return StatsWidgetEntry.StatItem(
                            label: label,
                            value: value,
                            icon: item["icon"] as? String ?? "circle.fill",
                            color: colorFromString(item["color"] as? String),
                            trend: trendFromString(item["trend"] as? String)
                        )
                    }
                    let result = StatsWidgetEntry(
                        date: Date(),
                        stats: stats.isEmpty ? defaultStats() : stats,
                        error: nil,
                        theme: theme
                    )
                    completion(result)
                } else {
                    completion(StatsWidgetEntry.placeholder)
                }
            } catch {
                completion(StatsWidgetEntry.error)
            }
        }

        task.resume()
    }

    private func colorFromString(_ colorString: String?) -> Color {
        switch colorString?.lowercased() {
        case "green": return Color(red: 0.30, green: 0.85, blue: 0.45)
        case "orange": return Color(red: 1.0, green: 0.60, blue: 0.20)
        case "yellow": return Color(red: 1.0, green: 0.82, blue: 0.28)
        case "blue": return Color(red: 0.35, green: 0.60, blue: 1.0)
        case "red": return Color(red: 1.0, green: 0.35, blue: 0.35)
        case "purple": return Color(red: 0.70, green: 0.45, blue: 1.0)
        case "pink": return Color(red: 1.0, green: 0.45, blue: 0.70)
        case "teal": return Color(red: 0.30, green: 0.85, blue: 0.80)
        case "indigo": return Color(red: 0.45, green: 0.40, blue: 1.0)
        default: return Color(red: 0.45, green: 0.65, blue: 1.0)
        }
    }

    private func trendFromString(_ trendString: String?) -> StatsWidgetEntry.StatItem.Trend? {
        switch trendString?.lowercased() {
        case "up": return .up
        case "down": return .down
        case "neutral": return .neutral
        default: return nil
        }
    }

    private func defaultStats() -> [StatsWidgetEntry.StatItem] {
        return [
            StatsWidgetEntry.StatItem(label: "Tasks", value: "0", icon: "checkmark.circle.fill", color: .green, trend: nil),
            StatsWidgetEntry.StatItem(label: "Streak", value: "0", icon: "flame.fill", color: .orange, trend: nil),
        ]
    }
}

// MARK: - Supabase Models

private struct SupabaseStatEntry: Decodable {
    let label: String?
    let value: String?
    let icon: String?
    let color: String?
    let trend: String?
}

// MARK: - Widget View

struct StatsWidgetView: View {
    var entry: StatsWidgetProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            // Decorative mesh gradient effect
            GeometryReader { geometry in
                // Top-right glow
                Ellipse()
                    .fill(
                        RadialGradient(
                            colors: [entry.theme.accentColor.opacity(0.25), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geometry.size.width * 0.5
                        )
                    )
                    .frame(width: geometry.size.width * 0.8, height: geometry.size.height * 0.6)
                    .offset(x: geometry.size.width * 0.4, y: -geometry.size.height * 0.1)

                // Bottom-left subtle glow
                Ellipse()
                    .fill(
                        RadialGradient(
                            colors: [entry.theme.accentColor.opacity(0.15), .clear],
                            center: .center,
                            startRadius: 0,
                            endRadius: geometry.size.width * 0.4
                        )
                    )
                    .frame(width: geometry.size.width * 0.6, height: geometry.size.height * 0.5)
                    .offset(x: -geometry.size.width * 0.15, y: geometry.size.height * 0.5)
            }

            // Content
            if let error = entry.error {
                errorView(error: error)
            } else {
                switch family {
                case .systemSmall:
                    smallWidget
                case .systemMedium:
                    mediumWidget
                default:
                    smallWidget
                }
            }
        }
    }

    private func errorView(error: String) -> some View {
        VStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.2))
                    .frame(width: 50, height: 50)

                Image(systemName: "exclamationmark.triangle.fill")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [.red, .orange],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }

            Text("Unable to load")
                .font(.system(size: 14, weight: .bold, design: .rounded))
                .foregroundColor(entry.theme.primaryTextColor)

            Text(error)
                .font(.system(size: 11, weight: .medium, design: .rounded))
                .foregroundColor(entry.theme.secondaryTextColor)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .padding()
    }

    // MARK: - Small Widget

    private var smallWidget: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header
            HStack {
                Text("Stats")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundColor(entry.theme.primaryTextColor)

                Spacer()

                // Mini indicator dots
                HStack(spacing: 3) {
                    ForEach(entry.stats.prefix(4)) { stat in
                        Circle()
                            .fill(stat.color)
                            .frame(width: 6, height: 6)
                    }
                }
            }

            Spacer()

            // Stats grid (2x1 for small)
            VStack(spacing: 10) {
                ForEach(Array(entry.stats.prefix(2).enumerated()), id: \.element.id) { index, stat in
                    compactStatRow(stat: stat, index: index)
                }
            }

            Spacer()

            // Timestamp
            HStack {
                Spacer()
                Text(entry.date, style: .time)
                    .font(.system(size: 9, weight: .medium, design: .monospaced))
                    .foregroundColor(entry.theme.secondaryTextColor.opacity(0.7))
            }
        }
        .padding(14)
    }

    private func compactStatRow(stat: StatsWidgetEntry.StatItem, index: Int) -> some View {
        HStack(spacing: 10) {
            // Icon with glow effect
            ZStack {
                Circle()
                    .fill(stat.color.opacity(0.2))
                    .frame(width: 30, height: 30)

                Image(systemName: stat.icon)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(stat.color)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(stat.value)
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundColor(entry.theme.primaryTextColor)

                Text(stat.label)
                    .font(.system(size: 10, weight: .medium, design: .rounded))
                    .foregroundColor(entry.theme.secondaryTextColor)
            }

            Spacer()

            // Trend indicator
            if let trend = stat.trend {
                Image(systemName: trend.icon)
                    .font(.system(size: 10, weight: .bold))
                    .foregroundColor(trend.color)
            }
        }
    }

    // MARK: - Medium Widget

    private var mediumWidget: some View {
        VStack(alignment: .leading, spacing: 10) {
            // Header
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 2) {
                    Text("Your Stats")
                        .font(.system(size: 16, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)

                    HStack(spacing: 4) {
                        Image(systemName: "clock")
                            .font(.system(size: 9, weight: .medium))
                        Text("Updated \(entry.date, style: .time)")
                            .font(.system(size: 10, weight: .medium, design: .rounded))
                    }
                    .foregroundColor(entry.theme.secondaryTextColor.opacity(0.8))
                }

                Spacer()

                // Activity ring placeholder
                ZStack {
                    Circle()
                        .stroke(entry.theme.accentColor.opacity(0.2), lineWidth: 3)
                        .frame(width: 32, height: 32)

                    Circle()
                        .trim(from: 0, to: 0.75)
                        .stroke(
                            LinearGradient(
                                colors: [entry.theme.accentColor, entry.theme.accentColor.opacity(0.5)],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ),
                            style: StrokeStyle(lineWidth: 3, lineCap: .round)
                        )
                        .frame(width: 32, height: 32)
                        .rotationEffect(.degrees(-90))

                    Text("75%")
                        .font(.system(size: 8, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)
                }
            }

            // Stats grid (2x2)
            LazyVGrid(columns: [
                GridItem(.flexible(), spacing: 8),
                GridItem(.flexible(), spacing: 8)
            ], spacing: 8) {
                ForEach(Array(entry.stats.prefix(4).enumerated()), id: \.element.id) { index, stat in
                    richStatCard(stat: stat)
                }
            }
        }
        .padding(14)
    }

    private func richStatCard(stat: StatsWidgetEntry.StatItem) -> some View {
        HStack(spacing: 8) {
            // Glowing icon container
            ZStack {
                RoundedRectangle(cornerRadius: 8)
                    .fill(stat.color.opacity(0.15))
                    .frame(width: 34, height: 34)

                Image(systemName: stat.icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [stat.color, stat.color.opacity(0.7)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 3) {
                    Text(stat.value)
                        .font(.system(size: 18, weight: .bold, design: .rounded))
                        .foregroundColor(entry.theme.primaryTextColor)
                        .lineLimit(1)
                        .minimumScaleFactor(0.8)

                    if let trend = stat.trend {
                        Image(systemName: trend.icon)
                            .font(.system(size: 9, weight: .bold))
                            .foregroundColor(trend.color)
                    }
                }

                Text(stat.label)
                    .font(.system(size: 10, weight: .medium, design: .rounded))
                    .foregroundColor(entry.theme.secondaryTextColor)
                    .lineLimit(1)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 10)
                .fill(entry.theme == .minimal ? Color.white.opacity(0.8) : Color.white.opacity(0.08))
        )
    }
}

// MARK: - Widget Configuration

struct StatsWidget: Widget {
    let kind: String = "StatsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: StatsWidgetProvider()) { entry in
            if #available(iOS 17.0, *) {
                StatsWidgetView(entry: entry)
                    .containerBackground(for: .widget) {
                        entry.theme.gradient
                    }
            } else {
                StatsWidgetView(entry: entry)
            }
        }
        .configurationDisplayName("Stats Dashboard")
        .description("Track your progress with beautiful stat cards")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
    StatsWidget()
} timeline: {
    StatsWidgetEntry.placeholder
    StatsWidgetEntry(
        date: Date(),
        stats: [
            StatsWidgetEntry.StatItem(label: "Steps", value: "8,432", icon: "figure.walk", color: .green, trend: .up),
            StatsWidgetEntry.StatItem(label: "Calories", value: "1,847", icon: "flame.fill", color: .orange, trend: .up),
        ],
        error: nil,
        theme: .sunset
    )
    StatsWidgetEntry.error
}

@available(iOS 17.0, *)
#Preview(as: .systemMedium) {
    StatsWidget()
} timeline: {
    StatsWidgetEntry.placeholder
    StatsWidgetEntry(
        date: Date(),
        stats: [
            StatsWidgetEntry.StatItem(label: "Revenue", value: "$12.4K", icon: "dollarsign.circle.fill", color: .green, trend: .up),
            StatsWidgetEntry.StatItem(label: "Orders", value: "284", icon: "cart.fill", color: .blue, trend: .up),
            StatsWidgetEntry.StatItem(label: "Visitors", value: "3.2K", icon: "person.2.fill", color: .purple, trend: .down),
            StatsWidgetEntry.StatItem(label: "Rating", value: "4.8", icon: "star.fill", color: .yellow, trend: .neutral),
        ],
        error: nil,
        theme: .midnight
    )
}
