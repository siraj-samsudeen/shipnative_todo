# Implementation Tasks: Todo Application

## Task 1: Create Supabase Migration for Todos Table
- [ ] Create migration file `supabase/migrations/YYYYMMDD_create_todos_table.sql`
- [ ] Add todos table with id, user_id, title, completed, created_at columns
- [ ] Enable RLS and add policies for SELECT, INSERT, UPDATE, DELETE
- [ ] Add index on user_id for query performance

**Requirements:** 2.1, 5.1

## Task 2: Add Todo Types
- [ ] Create `apps/app/app/types/todo.ts` with TodoRow interface
- [ ] Export types from `apps/app/app/types/` index if exists

**Requirements:** 2.3

## Task 3: Create useTodos Hook
- [ ] Create `apps/app/app/hooks/useTodos.ts`
- [ ] Implement `useTodos` query hook to fetch user's todos ordered by created_at
- [ ] Implement `useTodoMutations` with addTodo, toggleTodo, updateTodo, deleteTodo
- [ ] Add optimistic updates for responsive UI
- [ ] Export from `apps/app/app/hooks/index.ts`

**Requirements:** 1.1, 3.1, 4.2, 5.1

## Task 4: Add Todo Translations
- [ ] Add todoScreen translations to `apps/app/app/i18n/en.ts`
- [ ] Include: title, inputPlaceholder, emptyHeading, emptyContent, addButton

**Requirements:** 2.2

## Task 5: Create TodoInput Component
- [ ] Create `apps/app/app/components/TodoInput.tsx`
- [ ] Add TextField with validation (reject whitespace-only)
- [ ] Clear input and maintain focus after successful add
- [ ] Support Enter key submission
- [ ] Use translation keys for placeholder

**Requirements:** 1.1, 1.2, 1.3

## Task 6: Create TodoItem Component
- [ ] Create `apps/app/app/components/TodoItem.tsx`
- [ ] Display title with checkbox for completion status
- [ ] Add strikethrough styling for completed items
- [ ] Implement edit mode with inline TextField
- [ ] Add delete button/swipe action
- [ ] Validate edits (reject whitespace-only, restore on cancel)

**Requirements:** 2.3, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4, 5.1, 5.2

## Task 7: Create TodoList Component
- [ ] Create `apps/app/app/components/TodoList.tsx`
- [ ] Use FlatList to render TodoItem components
- [ ] Show EmptyState when list is empty
- [ ] Handle loading state with Spinner or Skeleton

**Requirements:** 2.1, 2.2

## Task 8: Create TodoScreen
- [ ] Create `apps/app/app/screens/TodoScreen.tsx`
- [ ] Use Screen component with scroll preset
- [ ] Compose TodoInput and TodoList
- [ ] Add to navigation (AppNavigator or MainTabNavigator)

**Requirements:** 2.1

## Task 9: Add Navigation Entry
- [ ] Add TodoScreen to `apps/app/app/navigators/navigationTypes.ts`
- [ ] Add route to appropriate navigator
- [ ] Add navigation entry point (tab or menu item)

**Requirements:** 2.1

## Task 10: Add Unit Tests for useTodos Hook
- [ ] Create `apps/app/app/hooks/__tests__/useTodos.test.ts`
- [ ] Test useTodos returns todos for authenticated user
- [ ] Test addTodo with valid input creates todo
- [ ] Test addTodo with whitespace-only is rejected
- [ ] Test toggleTodo flips completion status
- [ ] Test updateTodo with valid input updates title
- [ ] Test updateTodo with whitespace-only is rejected
- [ ] Test deleteTodo removes todo from list

**Requirements:** 1.1, 1.2, 3.1, 4.2, 4.3, 5.1

## Task 11: Add Component Tests
- [ ] Create `apps/app/app/components/__tests__/TodoInput.test.tsx`
- [ ] Test input clears after successful submission
- [ ] Test whitespace-only input is prevented
- [ ] Create `apps/app/app/components/__tests__/TodoItem.test.tsx`
- [ ] Test checkbox toggles completion
- [ ] Test completed items show strikethrough styling
- [ ] Test edit mode allows text modification
- [ ] Test cancel edit restores original text

**Requirements:** 1.2, 1.3, 3.1, 3.2, 4.1, 4.4

## Task 12: Add Integration Test
- [ ] Create `apps/app/app/__tests__/integration/todoFlow.test.tsx`
- [ ] Test full flow: add todo, mark complete, edit, delete
- [ ] Test empty state displays when no todos
- [ ] Test loading state while fetching

**Requirements:** 1.1, 2.1, 2.2, 3.1, 4.2, 5.1
