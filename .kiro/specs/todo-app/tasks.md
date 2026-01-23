# Implementation Plan: Todo Application

## Overview

Implement a minimal todo application with Supabase backend, React Query for data fetching, and comprehensive testing including property-based tests. The implementation follows ShipNative architecture patterns with TypeScript, Unistyles for styling, and i18n for translations.

## Tasks

### Vertical Slice 1: Display Empty State (Foundation)

- [x] 1. Set up database schema and types
  - Create Supabase migration for `todos` table with RLS policies
  - Define TypeScript types in `apps/app/app/types/todo.ts`
  - Set up database indexes and triggers
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [x] 2. Add translation keys for todo screen
  - Add all todo screen translation keys to `apps/app/app/i18n/en.ts`
  - Include keys for: title, input placeholder, buttons, empty state, errors, offline indicator
  - **Note**: Use colon notation (`:`) for translation keys (e.g., `todoScreen:title`)
  - _Requirements: All (i18n support)_

- [x] 3. Create basic TodoScreen with empty state
  - Implement TodoScreen layout and structure
  - Use `Screen` component wrapper
  - Add header with title using translation keys (colon notation: `todoScreen:title`)
  - Show `EmptyState` component with translation keys (colon notation)
  - Use Unistyles for styling
  - Set as initial route for testing in `AppNavigator.tsx`
  - _Requirements: 2.2_

### Vertical Slice 2: Add Todo Items (First Working Feature)

- [x] 4. Implement add todo functionality (end-to-end)
  - [x] 4.1 Create `useAddTodo()` mutation hook
    - Validate description (trim, check non-empty)
    - Insert todo into Supabase
    - Invalidate queries on success
    - _Requirements: 1.1, 1.2_
  
  - [x] 4.2 Create `useTodos()` hook to fetch todos
    - Query todos from Supabase ordered by completion and creation date
    - Handle loading and error states
    - _Requirements: 2.1_
  
  - [x] 4.3 Add input field and add button to TodoScreen
    - Use `TextField` component with translation keys
    - Handle text input state
    - Add "Add" button
    - Clear input after successful add
    - Wire up `useAddTodo()` hook
    - _Requirements: 1.1, 1.3_
  
  - [x] 4.4 Display todos in a FlatList
    - Set up FlatList for todo items
    - Create minimal TodoItem component (just display description)
    - Handle loading states with Spinner
    - Handle error states with error messages
    - Toggle between empty state and list based on data
    - _Requirements: 2.1, 2.3_

- [ ] 5. Checkpoint - Test add functionality
  - Test adding valid todos
  - Test rejecting whitespace-only todos
  - Test empty state appears when no todos
  - Test list appears when todos exist
  - Verify dark mode support

### Vertical Slice 3: Complete Todo Items

- [x] 6. Implement complete/toggle functionality (end-to-end)
  - [x] 6.1 Create `useToggleTodo()` mutation hook
    - Toggle completion status
    - Invalidate queries on success
    - _Requirements: 3.1_
  
  - [x] 6.2 Update TodoItem component with toggle
    - Add checkbox/tap to toggle
    - Visual feedback for completed state (strikethrough, dimmed)
    - Wire up `onToggle` prop to `useToggleTodo()` hook
    - Use Unistyles for theme-aware styling
    - Use translation keys for accessibility labels
    - _Requirements: 3.1, 3.2, 2.3_

- [ ] 7. Checkpoint - Test complete functionality
  - Test toggling completion status
  - Test visual feedback for completed items
  - Verify completed items move to bottom of list

### Vertical Slice 4: Edit Todo Items

- [x] 8. Implement edit functionality (end-to-end)
  - [x] 8.1 Create `useUpdateTodo()` mutation hook
    - Validate new description
    - Update todo in Supabase
    - Invalidate queries on success
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 8.2 Add inline edit mode to TodoItem
    - Toggle edit mode on edit button press
    - Show TextField when editing
    - Handle save and cancel actions
    - Validate input before saving
    - Wire up `onUpdate` prop to `useUpdateTodo()` hook
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 9. Checkpoint - Test edit functionality
  - Test editing todo descriptions
  - Test rejecting whitespace-only edits
  - Test cancel restores original description

### Vertical Slice 5: Delete Todo Items

- [x] 10. Implement delete functionality (end-to-end)
  - [x] 10.1 Create `useDeleteTodo()` mutation hook
    - Delete todo from Supabase
    - Invalidate queries on success
    - _Requirements: 5.1_
  
  - [x] 10.2 Add delete button to TodoItem
    - Show delete button
    - Wire up `onDelete` prop to `useDeleteTodo()` hook
    - _Requirements: 5.1_

- [ ] 11. Checkpoint - Test delete functionality
  - Test deleting todos
  - Verify todo is removed from list
  - Verify empty state appears when last todo deleted

### Vertical Slice 6: Realtime & Offline Support

- [x] 12. Add realtime synchronization
  - Implement `useTodosRealtime()` hook for live updates
  - Subscribe to Supabase realtime changes
  - Invalidate queries when data changes
  - Clean up subscription on unmount
  - Integrate realtime hook in TodoScreen
  - Create Supabase migration to enable realtime for todos table
  - _Requirements: 2.1_

- [ ] 13. Add offline detection and handling
  - Use `@react-native-community/netinfo` to detect connectivity
  - Show offline banner when disconnected
  - Disable add/edit/delete buttons when offline
  - Display cached todos in read-only mode
  - _Requirements: Error handling_

- [ ] 14. Final checkpoint - Manual testing
  - Test realtime sync (open app on two devices)
  - Test offline behavior
  - Test all CRUD operations work together
  - Verify dark mode support across all features

- [ ] 7. Write unit tests
  - [ ]* 7.1 Write unit tests for React Query hooks
    - Test `useAddTodo` with valid and invalid descriptions
    - Test `useToggleTodo` completion toggle
    - Test `useUpdateTodo` with valid and invalid descriptions
    - Test `useDeleteTodo` deletion
    - Test error handling for network failures
    - _Requirements: 1.1, 1.2, 3.1, 4.2, 4.3, 5.1_
  
  - [ ]* 7.2 Write unit tests for TodoItem component
    - Test rendering with completed/incomplete states
    - Test edit mode toggle
    - Test save/cancel edit actions
    - Test delete button
    - _Requirements: 2.3, 3.2, 4.1, 5.1_
  
  - [ ]* 7.3 Write unit tests for TodoScreen
    - Test empty state display
    - Test input field clearing after add
    - Test offline indicator display
    - Test loading and error states
    - _Requirements: 1.3, 2.2_

- [ ] 8. Write property-based tests
  - [ ]* 8.1 Property 1: Adding valid tasks increases list size
    - Generate random valid descriptions
    - Verify list length increases by one
    - Verify new task appears in list
    - **Feature: todo-app, Property 1**
    - _Requirements: 1.1_
  
  - [ ]* 8.2 Property 2: Whitespace-only tasks are rejected
    - Generate random whitespace strings
    - Verify addition is rejected
    - Verify list remains unchanged
    - **Feature: todo-app, Property 2**
    - _Requirements: 1.2_
  
  - [ ]* 8.3 Property 3: All stored todos are displayed on startup
    - Generate random set of todos
    - Insert into Supabase
    - Fetch and verify all appear
    - **Feature: todo-app, Property 3**
    - _Requirements: 2.1_
  
  - [ ]* 8.4 Property 4: Rendered todos contain description and status
    - Generate random todos
    - Verify rendered output contains description and completion indicator
    - **Feature: todo-app, Property 4**
    - _Requirements: 2.3_
  
  - [ ]* 8.5 Property 5: Toggling completion reorders list
    - Generate random todos with mixed completion states
    - Toggle completion
    - Verify completed todos move to bottom
    - **Feature: todo-app, Property 5**
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 8.6 Property 6: Editing and saving updates description
    - Generate random todos and new descriptions
    - Edit and save
    - Verify description updated
    - **Feature: todo-app, Property 6**
    - _Requirements: 4.1, 4.2_
  
  - [ ]* 8.7 Property 7: Editing with whitespace preserves original
    - Generate random todos
    - Attempt edit with whitespace
    - Verify original description preserved
    - **Feature: todo-app, Property 7**
    - _Requirements: 4.3_
  
  - [ ]* 8.8 Property 8: Canceling edit restores original
    - Generate random todos
    - Enter edit mode, make changes, cancel
    - Verify original description restored
    - **Feature: todo-app, Property 8**
    - _Requirements: 4.4_
  
  - [ ]* 8.9 Property 9: Deleting removes from list
    - Generate random todos
    - Delete one
    - Verify it no longer appears
    - **Feature: todo-app, Property 9**
    - _Requirements: 5.1_
  
  - [ ]* 8.10 Property 10: Supabase round-trip preserves data
    - Generate random todos
    - Insert into Supabase
    - Fetch back
    - Verify all data intact
    - **Feature: todo-app, Property 10**
    - _Requirements: Data persistence_

- [ ] 9. Write integration tests
  - [ ]* 9.1 Test complete user workflow
    - Add todo → complete → edit → delete
    - Verify each step works end-to-end
    - _Requirements: 1.1, 3.1, 4.1, 5.1_
  
  - [ ]* 9.2 Test realtime synchronization
    - Simulate multi-device scenario
    - Verify changes sync across instances
    - _Requirements: 2.1_
  
  - [ ]* 9.3 Test offline/online transitions
    - Go offline, verify read-only mode
    - Go online, verify mutations work
    - _Requirements: Error handling_

- [ ] 10. Final checkpoint - Run all tests
  - Run unit tests: `yarn test`
  - Run property tests: `yarn test properties`
  - Run integration tests: `yarn test integration`
  - Verify all 10 core properties pass
  - Ensure all tests pass, ask user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end workflows
- All user-facing text must use translation keys (tx props)
- All styling must use Unistyles with semantic theme colors
- Follow ShipNative patterns (see DataDemoScreen.supabase.tsx for reference)
