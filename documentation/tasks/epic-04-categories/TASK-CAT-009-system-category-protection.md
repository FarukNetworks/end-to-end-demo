# TASK-CAT-009 - Implement System Category Deletion Prevention

## Context & Goal

**Business Value:** Protect default categories from accidental deletion (FR-022)  
**Epic:** EPIC-04 Category Management  
**PRD Reference:** FR-022 (Prevent system category deletion)

## Scope Definition

**✅ In Scope:**

- UI-level deletion button disabled for system categories
- Backend validation (already in CAT-005)
- Visual indicator for system categories
- Error message if deletion attempted

**⛔ Out of Scope:**

- System category editing restrictions (allowed per PRD)

## Technical Specifications

```typescript
// /components/categories/category-list-item.tsx
export function CategoryListItem({ category }) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <span
          className="h-6 w-6 rounded"
          style={{ backgroundColor: category.color }}
        />
        <div>
          <div className="font-medium">{category.name}</div>
          {category.isSystem && (
            <span className="text-xs text-muted-foreground">System</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={category.isSystem}
          onClick={() => !category.isSystem && setDeleteOpen(true)}
          title={
            category.isSystem
              ? 'System categories cannot be deleted'
              : 'Delete category'
          }
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
```

## Acceptance Criteria

1. **Given** system category
   **When** viewing category list
   **Then** "System" label displayed

2. **Given** system category
   **When** checking delete button
   **Then** button disabled

3. **Given** system category delete button hovered
   **When** hovering
   **Then** tooltip shows "System categories cannot be deleted"

4. **Given** custom category
   **When** checking delete button
   **Then** button enabled

## Definition of Done

- [ ] isSystem check in UI
- [ ] Delete button disabled for system categories
- [ ] Visual indicator (badge/label)
- [ ] Tooltip explanation
- [ ] Backend validation (already in CAT-005)

## Dependencies

**Upstream:** TASK-CAT-007 (Categories page)  
**Effort:** 2 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (Frontend Engineer)
