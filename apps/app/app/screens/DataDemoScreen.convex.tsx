/**
 * DataDemoScreen - Convex Version
 *
 * This screen demonstrates proper data fetching patterns with Convex:
 * - Reactive queries that auto-update when data changes
 * - Type-safe mutations with automatic query invalidation
 * - Loading and error states
 *
 * Copy this pattern for your own data-fetching screens with Convex.
 *
 * KEY DIFFERENCE FROM SUPABASE:
 * - No manual refetching needed - queries are reactive!
 * - No React Query - Convex handles caching and updates
 * - Data updates in real-time across all clients
 */

import { FC, useState } from "react"
import { View, FlatList, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { SafeAreaView } from "react-native-safe-area-context"
import { StyleSheet, useUnistyles } from "react-native-unistyles"

import { Text, Button, Card, TextField, Spinner, EmptyState } from "@/components"
import { useAuth } from "@/hooks"
import { useQuery, useMutation } from "@/hooks/convex"
import { api } from "@convex/_generated/api"
import type { Doc, Id } from "@convex/_generated/dataModel"

// =============================================================================
// TYPES
// =============================================================================

// Convex provides type-safe types from schema
// Note: This type will be properly inferred once you add a "posts" table to your Convex schema
type Post = {
  _id: Id<"posts">
  _creationTime: number
  title: string
  content: string
  authorId: string
}

// =============================================================================
// COMPONENT
// =============================================================================

const isWeb = Platform.OS === "web"

export const DataDemoScreen: FC = () => {
  const { theme } = useUnistyles()
  const { user, userId } = useAuth()

  // Form state
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  // ============================================================
  // CONVEX DATA FETCHING
  // These queries are REACTIVE - they auto-update when data changes!
  // No manual refetching or invalidation needed.
  // ============================================================

  // Reactive query - auto-updates when posts table changes
  // Note: You need to define api.posts.list in your Convex functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = useQuery((api as any).posts?.list) as Post[] | undefined

  // Mutations - auto-invalidate related queries
  // Note: You need to define these in your Convex functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createPost = useMutation((api as any).posts?.create)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deletePost = useMutation((api as any).posts?.remove)

  // Loading state: undefined means loading
  const isLoading = posts === undefined

  const handleCreatePost = async () => {
    if (!title.trim() || !content.trim()) return

    try {
      await createPost({ title, content })
      // No need to refetch! The useQuery hook auto-updates
      setTitle("")
      setContent("")
    } catch (err) {
      // Handle error
      console.error("Failed to create post:", err)
    }
  }

  const handleDeletePost = async (postId: Id<"posts">) => {
    try {
      await deletePost({ id: postId })
      // No need to refetch! The useQuery hook auto-updates
    } catch (err) {
      console.error("Failed to delete post:", err)
    }
  }

  const renderPost = ({ item }: { item: Post }) => (
    <Card
      style={styles.postCard}
      ContentComponent={
        <>
          <View style={styles.postHeader}>
            <Text preset="subheading" style={styles.postTitle}>
              {item.title}
            </Text>
            {item.authorId === userId && (
              <Button
                variant="ghost"
                size="sm"
                onPress={() => handleDeletePost(item._id)}
                LeftAccessory={() => (
                  <Ionicons name="trash-outline" size={16} color={theme.colors.error} />
                )}
              />
            )}
          </View>
          <Text style={styles.postContent}>{item.content}</Text>
          <Text preset="caption" style={styles.postDate}>
            {new Date(item._creationTime).toLocaleDateString()}
          </Text>
        </>
      }
    />
  )

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Spinner size="lg" />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text preset="heading">Data Demo (Convex)</Text>
          <Text preset="caption" style={styles.subtitle}>
            Reactive queries - auto-updates!
          </Text>
        </View>

        {/* Create Post Form */}
        <Card
          style={styles.formCard}
          ContentComponent={
            <>
              <Text preset="subheading" style={styles.formTitle}>
                Create Post
              </Text>
              <TextField
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
              />
              <TextField
                placeholder="Content"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={3}
                style={styles.input}
              />
              <Button
                text="Create Post"
                variant="filled"
                onPress={handleCreatePost}
                disabled={!title.trim() || !content.trim()}
              />
            </>
          }
        />

        {/* Posts List - No RefreshControl needed! Data is reactive */}
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="components"
              heading="No posts yet"
              content="Create your first post above"
            />
          }
        />

        {/* Info card about reactivity */}
        <Card
          style={styles.infoCard}
          ContentComponent={
            <View style={styles.infoRow}>
              <Ionicons name="flash" size={20} color={theme.colors.primary} />
              <Text preset="caption" style={styles.infoText}>
                Open this app in another window - posts sync in real-time!
              </Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  )
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...(isWeb && { minHeight: "100vh" as unknown as number }),
  },
  container: {
    flex: 1,
    padding: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  subtitle: {
    color: theme.colors.foregroundSecondary,
    marginTop: theme.spacing.xs,
  },
  formCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  formTitle: {
    marginBottom: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.sm,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  postCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postTitle: {
    flex: 1,
  },
  postContent: {
    color: theme.colors.foregroundSecondary,
    marginVertical: theme.spacing.sm,
  },
  postDate: {
    color: theme.colors.foregroundTertiary,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.foregroundSecondary,
  },
  infoCard: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.infoBackground,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  infoText: {
    flex: 1,
    color: theme.colors.primary,
  },
}))
