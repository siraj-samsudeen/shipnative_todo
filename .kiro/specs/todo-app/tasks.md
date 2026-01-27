# Implementation Tasks: Todo Application

## Task 1: Create Supabase Migration for Todos Table
- [x] Create migration file `supabase/migrations/YYYYMMDD_create_todos_table.sql`
- [x] Add todos table with id, user_id, title, completed, created_at columns
- [x] Enable RLS and add policies for SELECT, INSERT, UPDATE, DELETE
- [x] Add index on user_id for query performance

**Requirements:** 2.1, 5.1

## Task 2: Add Todo Types
- [x] Create `apps/app/app/types/todo.ts` with TodoRow interface
- [x] Export types from `apps/app/app/types/` index if exists

**Requirements:** 2.3

## Task 3: Create useTodos Hook
- [x] Create `apps/app/app/hooks/useTodos.ts`
- [x] Implement `useTodos` query hook to fetch user's todos ordered by created_at
- [x] Implement `useTodoMutations` with addTodo, toggleTodo, updateTodo, deleteTodo
- [x] Add optimistic updates for responsive UI
- [x] Export from `apps/app/app/hooks/index.ts`

**Requirements:** 1.1, 3.1, 4.2, 5.1

## Task 4: Add Todo Translations
- [x] Add todoScreen translations to `apps/app/app/i18n/en.ts`
- [x] Include: title, inputPlaceholder, emptyHeading, emptyContent, addButton

**Requirements:** 2.2

## Task 5: Create TodoInput Component
- [x] Create `apps/app/app/components/TodoInput.tsx`
- [x] Add TextField with validation (reject whitespace-only)
- [x] Clear input and maintain focus after successful add
- [x] Support Enter key submission
- [x] Use translation keys for placeholder

**Requirements:** 1.1, 1.2, 1.3

## Task 6: Create TodoItem Component
- [x] Create `apps/app/app/components/TodoItem.tsx`
- [x] Display title with checkbox for completion status
- [x] Add strikethrough styling for completed items
- [x] Implement edit mode with inline TextField
- [x] Add delete button/swipe action
- [x] Validate edits (reject whitespace-only, restore on cancel)

**Requirements:** 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2

## Task 7: Create TodoList Component
- [x] Create `apps/app/app/components/TodoList.tsx`
- [x] Use FlatList to render TodoItem components
- [x] Show EmptyState when list is empty
- [x] Handle loading state with Spinner or Skeleton

**Requirements:** 2.1, 2.2

## Task 8: Create TodoScreen
- [x] Create `apps/app/app/screens/TodoScreen.tsx`
- [x] Use Screen component with scroll preset
- [x] Compose TodoInput and TodoList
- [x] Add to navigation (AppNavigator or MainTabNavigator)

**Requirements:** 2.1

## Task 9: Add Navigation Entry
- [x] Add TodoScreen to `apps/app/app/navigators/navigationTypes.ts`
- [x] Add route to appropriate navigator
- [x] Add navigation entry point (tab or menu item)

**Requirements:** 2.1

## Task 10: Add Unit Tests for useTodos Hook
- [x] Create `apps/app/app/hooks/__tests__/useTodos.test.ts`
- [x] Test useTodos returns todos for authenticated user
- [x] Test addTodo with valid input creates todo
- [x] Test addTodo with whitespace-only is rejected
- [x] Test toggleTodo flips completion status
- [x] Test updateTodo with valid input updates title
- [x] Test updateTodo with whitespace-only is rejected
- [x] Test deleteTodo removes todo from list

**Requirements:** 1.1, 1.2, 3.1, 4.2, 4.3, 5.1

## Task 11: Add Component Tests
- [x] Create `apps/app/app/components/__tests__/TodoInput.test.tsx`
- [x] Test input clears after successful submission
- [x] Test whitespace-only input is prevented
- [x] Create `apps/app/app/components/__tests__/TodoItem.test.tsx`
- [x] Test checkbox toggles completion
- [x] Test completed items show strikethrough styling
- [x] Test edit mode allows text modification
- [x] Test cancel edit restores original text

**Requirements:** 1.2, 1.3, 3.1, 3.2, 4.1, 4.4

## Task 12: Add Integration Test
- [x] Create `apps/app/app/__tests__/integration/todoFlow.test.tsx`
- [x] Test full flow: add todo, mark complete, edit, delete
- [x] Test empty state displays when no todos
- [x] Test loading state while fetching

**Requirements:** 1.1, 2.1, 2.2, 3.1, 4.2, 5.1
