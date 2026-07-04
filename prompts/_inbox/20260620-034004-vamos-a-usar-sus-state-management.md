---
captured_at: 2026-06-20T03:40:04+00:00
source: manual
important: true
status: curated
curated: true
category: mobile
---

vamos a usar sus ## State Management

Use a layered state management approach.

Do not put all application state in a global store.

### 1. Server State

Use TanStack Query for data that comes from the backend.

Examples:

* Clothing items
* Outfit lists
* Outfit detail
* Planned outfits
* User profile
* AI suggestions when implemented

Use queries for reading data and mutations for creating, updating or deleting data.

Do not duplicate server data in Zustand unless there is a clear reason.

Example:

```tsx
const { data, isLoading, error } = useWardrobeItems();
```

### 2. Global Client State

Use Zustand only for global client-side state that needs to be shared across screens.

Examples:

* Current selected outfit draft
* Temporary outfit builder state
* App preferences
* Onboarding completion
* Auth session state when login is implemented
* UI-level state that truly needs to survive navigation

Do not use Zustand for every list or API response.

### 3. Local Screen State

Use local React state for state that only belongs to one screen.

Examples:

* Selected tab inside a screen
* Open/closed modal
* Temporary filter
* Button loading state when it is not related to a mutation
* Image preview before upload

Use `useState` or `useReducer` when appropriate.

### 4. Forms

Use `react-hook-form` for forms with validation or multiple fields.

Examples:

* Create clothing item form
* Create outfit form
* Edit profile form
* Login form when implemented

Avoid manually managing large forms with many `useState` calls.

## Recommended State Structure

```txt
src/
  app/
    providers/
      QueryProvider.tsx
  features/
    wardrobe/
      hooks/
        useWardrobeItems.ts
        useCreateClothingItem.ts
      services/
        wardrobeApi.ts
      stores/
        wardrobeDraft.store.ts
    outfits/
      hooks/
        useOutfits.ts
        useCreateOutfit.ts
      services/
        outfitsApi.ts
      stores/
        outfitBuilder.store.ts
    ready/
      hooks/
        usePlannedOutfit.ts
      services/
        readyApi.ts
  shared/
    stores/
      appPreferences.store.ts
      auth.store.ts
```

## Zustand Rules

Create small stores by responsibility.

Good:

```txt
outfitBuilder.store.ts
appPreferences.store.ts
auth.store.ts
```

Avoid:

```txt
app.store.ts
global.store.ts
everything.store.ts
```

Zustand stores should not call APIs directly unless there is a very specific reason.

Prefer calling APIs through services and TanStack Query hooks.

## TanStack Query Rules

Use feature-specific query hooks.

Good:

```txt
useWardrobeItems()
useCreateClothingItem()
useOutfits()
useCreateOutfit()
usePlannedOutfit()
```

Avoid using raw `useQuery` directly inside large screens when the logic can be wrapped in a hook.

Query keys should be centralized per feature.

Example:

```ts
export const wardrobeQueryKeys = {
  all: ["wardrobe"] as const,
  lists: () => [...wardrobeQueryKeys.all, "list"] as const,
  detail: (id: string) => [...wardrobeQueryKeys.all, "detail", id] as const,
};
```

## What Belongs Where

### TanStack Query

Use for:

* Fetching wardrobe items
* Creating clothing items
* Updating clothing items
* Deleting clothing items
* Fetching outfits
* Creating outfits
* Fetching planned outfits
* Syncing with backend

### Zustand

Use for:

* Outfit builder draft before saving
* Selected clothing items while creating an outfit
* App theme preference
* Onboarding state
* Auth/session state when implemented

### Local State

Use for:

* Modal open/close
* Current screen filter
* Input focus
* Temporary UI selection
* One-screen-only interactions

## Main Rule

If the data comes from the backend, do not put it in Zustand by default.

Use TanStack Query.

If the data is temporary and shared across multiple screens, use Zustand.

If the data only matters inside one screen, use local state.
