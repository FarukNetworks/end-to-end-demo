# TASK-TEST-009 - Run Accessibility Audits on Key Pages

## Context & Goal

**Business Value:** Verify WCAG 2.1 AA compliance across application (NF-021 to NF-024)  
**Epic:** EPIC-10 Testing & Quality Assurance  
**PRD Reference:** NF-021 to NF-024 (Accessibility requirements)

## Scope Definition

**✅ In Scope:**

- Automated axe scans on all key pages
- Manual keyboard navigation testing
- Screen reader spot checks (NVDA/JAWS)
- Color contrast verification
- Focus indicator verification

**⛔ Out of Scope:**

- Full VPAT (Voluntary Product Accessibility Template) - V2
- Certification audit - Pre-launch

## Technical Specifications

**Pages to Audit:**

1. Dashboard (/)
2. Transactions list (/transactions)
3. Transaction form (Add/Edit)
4. Categories (/categories)
5. Accounts (/accounts)
6. Login (/login)
7. Signup (/signup)

**Manual Test Checklist:**

```markdown
## Keyboard Navigation Test

- [ ] All interactive elements reachable via Tab
- [ ] Visible focus indicators on all elements
- [ ] Modals trap focus
- [ ] Esc key closes modals
- [ ] Enter/Space activate buttons

## Screen Reader Test

- [ ] Form labels announced
- [ ] Form errors announced
- [ ] Button purposes clear
- [ ] Landmark regions identified
- [ ] Charts have accessible alternatives

## Color Contrast

- [ ] Text meets 4.5:1 ratio
- [ ] Large text meets 3:1 ratio
- [ ] Interactive elements meet contrast requirements
```

## Acceptance Criteria

1. **Given** automated axe scans
   **When** running on all key pages
   **Then** zero critical or serious violations

2. **Given** keyboard navigation
   **When** testing all pages
   **Then** 100% of interactive elements reachable

3. **Given** screen reader testing
   **When** navigating with NVDA
   **Then** all content and actions accessible

4. **Given** color contrast check
   **When** using browser tools
   **Then** all text meets WCAG AA standards

## Definition of Done

- [ ] Automated scans on 7 key pages
- [ ] Manual keyboard navigation tests completed
- [ ] Screen reader spot checks completed
- [ ] Color contrast verified
- [ ] All critical violations fixed
- [ ] Accessibility report documented

## Dependencies

**Upstream:** TASK-TEST-008 (Axe setup), All UI tasks  
**Effort:** 3 SP  
**Priority:** P0

## Assignment

**Primary Owner:** TBD (QA Engineer)  
**Code Reviewer:** TBD (Accessibility specialist if available)
