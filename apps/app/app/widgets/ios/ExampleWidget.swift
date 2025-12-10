//
//  ExampleWidget.swift
//  Example Widget for ShipNative
//
//  This widget demonstrates how to fetch and display data from Supabase
//  in a native iOS widget using SwiftUI.
//

import WidgetKit
import SwiftUI

// MARK: - Widget Entry

struct ExampleWidgetEntry: TimelineEntry {
    let date: Date
    let title: String
    let subtitle: String?
    let data: [String: Any]?
    let error: String?
    
    static var placeholder: ExampleWidgetEntry {
        ExampleWidgetEntry(
            date: Date(),
            title: "Loading...",
            subtitle: nil,
            data: nil,
            error: nil
        )
    }
    
    static var error: ExampleWidgetEntry {
        ExampleWidgetEntry(
            date: Date(),
            title: "Error",
            subtitle: "Failed to load data",
            data: nil,
            error: "Unable to fetch data"
        )
    }
}

// MARK: - Timeline Provider

struct ExampleWidgetProvider: TimelineProvider {
    // App Group identifier for sharing data between app and widget.
    // Defaults to group.<base bundle id> (drops the extension suffix).
    private let appGroupIdentifier: String = {
        // Prefer explicit Info.plist override if present
        if let explicit = Bundle.main.object(forInfoDictionaryKey: "APP_GROUP_IDENTIFIER") as? String, !explicit.isEmpty {
            return explicit
        }

        // Derive from the extension bundle identifier by dropping the last component
        if let bundleId = Bundle.main.bundleIdentifier {
            let parts = bundleId.split(separator: ".")
            if parts.count > 2 {
                let baseId = parts.dropLast().joined(separator: ".")
                return "group.\(baseId)"
            } else {
                return "group.\(bundleId)"
            }
        }

        // Fallback: derive from main app bundle if available, otherwise use neutral default
        let mainBundleId = Bundle.main.object(forInfoDictionaryKey: "CFBundleIdentifier") as? String ?? "com.shipnative.app"
        return "group.\(mainBundleId)"
    }()
    
    // Supabase configuration keys stored in UserDefaults
    private let supabaseUrlKey = "supabase_url"
    private let supabaseKeyKey = "supabase_key"
    private let sessionTokenKey = "supabase_session_token"
    
    func placeholder(in context: Context) -> ExampleWidgetEntry {
        return ExampleWidgetEntry.placeholder
    }
    
    func getSnapshot(in context: Context, completion: @escaping (ExampleWidgetEntry) -> Void) {
        // For preview/snapshot, return placeholder data
        completion(ExampleWidgetEntry.placeholder)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<ExampleWidgetEntry>) -> Void) {
        // Fetch data from Supabase
        fetchWidgetData { entry in
            // Create timeline with current entry and next update in 15 minutes
            let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date()) ?? Date()
            let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
            completion(timeline)
        }
    }
    
    // MARK: - Data Fetching
    
    private func fetchWidgetData(completion: @escaping (ExampleWidgetEntry) -> Void) {
        // Get shared UserDefaults for App Group
        guard let userDefaults = UserDefaults(suiteName: appGroupIdentifier) else {
            completion(ExampleWidgetEntry.error)
            return
        }
        
        // Get Supabase configuration
        guard let supabaseUrl = userDefaults.string(forKey: supabaseUrlKey),
              let supabaseKey = userDefaults.string(forKey: supabaseKeyKey) else {
            // If no Supabase config, return mock data
            let entry = ExampleWidgetEntry(
                date: Date(),
                title: "Welcome",
                subtitle: "Mock Mode",
                data: ["status": "mock", "message": "No Supabase configuration"],
                error: nil
            )
            completion(entry)
            return
        }
        
        // Get session token if available
        let sessionToken = userDefaults.string(forKey: sessionTokenKey)
        
        // Fetch data from Supabase
        // Note: In a real implementation, you would make an HTTP request to Supabase
        // For this example, we'll simulate the data fetch
        fetchFromSupabase(
            url: supabaseUrl,
            key: supabaseKey,
            token: sessionToken
        ) { result in
            switch result {
            case .success(let data):
                let entry = ExampleWidgetEntry(
                    date: Date(),
                    title: data["title"] as? String ?? "Example Widget",
                    subtitle: data["subtitle"] as? String,
                    data: data,
                    error: nil
                )
                completion(entry)
            case .failure(let error):
                let entry = ExampleWidgetEntry(
                    date: Date(),
                    title: "Error",
                    subtitle: "Failed to load",
                    data: nil,
                    error: error.localizedDescription
                )
                completion(entry)
            }
        }
    }
    
    private func fetchFromSupabase(
        url: String,
        key: String,
        token: String?,
        completion: @escaping (Result<[String: Any], Error>) -> Void
    ) {
        // Build a REST request to Supabase. This expects a table named `widget_entries`
        // with columns: title (text), subtitle (text), count (int), updated_at (timestamp).
        guard let endpoint = URL(string: "\(url)/rest/v1/widget_entries?select=title,subtitle,count&order=updated_at.desc&limit=1") else {
            completion(.failure(URLError(.badURL)))
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
                completion(.failure(error))
                return
            }

            guard let data = data else {
                completion(.failure(URLError(.badServerResponse)))
                return
            }

            do {
                let decoder = JSONDecoder()
                decoder.keyDecodingStrategy = .convertFromSnakeCase
                let entries = try decoder.decode([SupabaseWidgetEntry].self, from: data)
                guard let first = entries.first else {
                    completion(.failure(URLError(.dataNotAllowed)))
                    return
                }

                var payload: [String: Any] = [
                    "title": first.title ?? "Widget",
                    "subtitle": first.subtitle ?? "",
                ]

                if let count = first.count {
                    payload["count"] = count
                }

                completion(.success(payload))
            } catch {
                completion(.failure(error))
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
    
    // Theme colors (matching app theme)
    private let primaryColor = Color(red: 0.2, green: 0.4, blue: 0.8)
    private let backgroundColor = Color(red: 0.95, green: 0.95, blue: 0.97)
    private let textColor = Color(red: 0.1, green: 0.1, blue: 0.1)
    private let errorColor = Color(red: 0.8, green: 0.2, blue: 0.2)
    
    var body: some View {
        ZStack {
            // Background
            backgroundColor
            
            VStack(alignment: .leading, spacing: 8) {
                // Title
                Text(entry.title)
                    .font(.headline)
                    .foregroundColor(textColor)
                    .lineLimit(1)
                
                // Subtitle or error
                if let error = entry.error {
                    Text(error)
                        .font(.caption)
                        .foregroundColor(errorColor)
                        .lineLimit(2)
                } else if let subtitle = entry.subtitle {
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundColor(textColor.opacity(0.7))
                        .lineLimit(1)
                }
                
                // Data display
                if let data = entry.data, let count = data["count"] as? Int {
                    HStack {
                        Text("Count:")
                            .font(.caption)
                            .foregroundColor(textColor.opacity(0.6))
                        Text("\(count)")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(primaryColor)
                    }
                }
                
                Spacer()
                
                // Footer
                HStack {
                    Spacer()
                    Text("Updated: \(entry.date, style: .time)")
                        .font(.system(size: 10))
                        .foregroundColor(textColor.opacity(0.5))
                }
            }
            .padding()
        }
    }
}

// MARK: - Widget Configuration

struct ExampleWidget: Widget {
    let kind: String = "ExampleWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ExampleWidgetProvider()) { entry in
            ExampleWidgetView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("Example Widget")
        .description("Displays example data from Supabase")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Preview

#Preview(as: .systemSmall) {
    ExampleWidget()
} timeline: {
    ExampleWidgetEntry.placeholder
    ExampleWidgetEntry(
        date: Date(),
        title: "Example Widget",
        subtitle: "Data loaded",
        data: ["count": 42],
        error: nil
    )
    ExampleWidgetEntry.error
}





