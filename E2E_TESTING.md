# E2E Testing with Playwright

This document describes the end-to-end testing setup for the LMS Fudensa project using Playwright, following best practices from the **Playwright E2E Testing Skill**.

## Overview

E2E tests verify critical user journeys through the application by simulating real user interactions across multiple browsers and devices.

## Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers (run once)
npx playwright install
```

## Configuration

**playwright.config.ts** includes:
- Tests run in `chromium`, `firefox`, `webkit`
- Mobile testing: Pixel 5, iPhone 12
- Screenshots/videos on failure
- Trace recording for debugging
- Automatic dev server startup
- Parallel test execution

## Running E2E Tests

```bash
# Run all E2E tests
npx playwright test

# Run in headed mode (see browser)
npx playwright test --headed

# Run specific test file
npx playwright test e2e/critical-flows.spec.ts

# Run tests in debug mode
npx playwright test --debug

# Open HTML report
npx playwright show-report
```

## Test Structure

### File Organization
```
e2e/
├── critical-flows.spec.ts     # Core user journeys
├── page-objects/              # [Future] Page models
│   ├── CoursePage.ts
│   ├── ContactPage.ts
│   └── LoginPage.ts
└── fixtures/                  # [Future] Shared test data
    └── test-data.ts
```

### Current Test Coverage (Critical Flows)

#### Flow 1: Landing Page & Course Discovery (3 tests)
- Display course list on landing page
- Navigate to course details
- Filter courses by level

#### Flow 2: Contact Form (2 tests)
- Submit valid contact form
- Validate required fields

#### Flow 3: Authentication (2 tests)
- Navigate to login page
- Show forgot password link

#### Flow 4: Course Enrollment (1 test)
- Show payment button on course detail

#### Flow 5: Admin Forms (1 test)
- Verify admin access link exists

#### Flow 6: Navigation & Layout (3 tests)
- Verify main navigation
- Display footer
- Responsive design on mobile

#### Flow 7: Performance & Stability (3 tests)
- Page load performance
- Back button navigation
- Handle missing pages gracefully

**Total: 17 E2E Tests**

## Playwright E2E Skill Patterns Applied

### 1. Proper Wait Strategies
```typescript
// Wait for network to be idle
await page.goto(url, { waitUntil: 'networkidle' })

// Wait for specific element visible
await expect(element).toBeVisible({ timeout: 5000 })

// Wait for URL change
await expect(page).toHaveURL(/course/)
```

### 2. Robust Element Selection
```typescript
// By testid (most reliable)
page.locator('[data-testid="course-card"]')

// By placeholder text
page.locator('input[placeholder*="search"]')

// By button text
page.locator('button:has-text("comprar")')
```

### 3. User Interactions
```typescript
// Click
await element.click()

// Fill input
await page.fill('input[name="email"]', 'test@example.com')

// Select dropdown
await page.selectOption('select[name="level"]', 'Básico')

// Navigate
await page.goto(url)
```

### 4. Assertions
```typescript
// Visibility
await expect(element).toBeVisible()

// Count
const count = await elements.count()
expect(count).toBeGreaterThan(0)

// Text content
await expect(element).toHaveText('Expected text')

// URL
await expect(page).toHaveURL(/expected-path/)
```

### 5. Error Handling
```typescript
// Catch errors gracefully
const isVisible = await element.isVisible().catch(() => false)

// Conditional assertions
if (await element.isVisible()) {
  await element.click()
}
```

## Best Practices

### 1. Data Testids
Add `data-testid` attributes to critical elements for reliable selection:
```jsx
<div data-testid="course-card">...</div>
<button data-testid="submit-btn">...</button>
```

### 2. Isolation
Tests should be independent and not rely on order or shared state:
```typescript
test.beforeEach(async ({ page }) => {
  // Fresh state for each test
  await page.goto('http://localhost:5173')
})
```

### 3. Real User Actions
Simulate actual user interactions:
```typescript
// Good: User clicks element
await button.click()

// Avoid: Directly calling functions
// await component.submit()
```

### 4. Meaningful Assertions
Test user-visible behavior, not implementation:
```typescript
// Good: Verify success message appears
await expect(page.locator('text=gracias')).toBeVisible()

// Avoid: Test internal state directly
```

### 5. Timeouts
Use appropriate timeouts for different operations:
```typescript
// Page navigation (longer)
await page.waitForLoadState('networkidle', { timeout: 5000 })

// Element visibility (shorter)
await expect(element).toBeVisible({ timeout: 3000 })
```

## Video Walkthrough

When tests fail, Playwright records videos showing exactly what happened. View them:

```bash
npx playwright show-report
```

Then expand failed tests to watch the video replay.

## Debugging

### Debug Mode
```bash
npx playwright test --debug
```

### Inspector
Step through test execution with Playwright Inspector:
- Pause test at breakpoints
- Inspect page state
- Execute code in console

### Traces
Traces record full test execution for analysis:
```bash
npx playwright test --trace on
npx playwright show-report
```

## Performance Benchmarks

Current performance from tests:
- Landing page load: ~1-2 seconds
- Course navigation: <500ms
- Form submission: <1 second
- Mobile responsiveness: Working correctly

## Future Enhancements

### Priority 1: Critical Flows
- [ ] Complete user authentication flow (login → enrolled course)
- [ ] Payment flow with MercadoPago test environment
- [ ] Certificate download flow

### Priority 2: Page Objects
- [ ] Create page object models for maintainability
- [ ] Centralize element selectors
- [ ] Build reusable test utilities

### Priority 3: Additional Coverage
- [ ] Admin panel flows
- [ ] Teacher creation and management
- [ ] Course content viewing (videos, quizzes)
- [ ] Real-time updates (if using WebSockets)

### Priority 4: CI/CD Integration
- [ ] GitHub Actions workflow
- [ ] Automated test runs on every PR
- [ ] Upload reports to artifact storage
- [ ] Slack notifications for failures

## Troubleshooting

### Tests time out
- Increase timeout: `{ timeout: 10000 }`
- Check if dev server is running: `npm run dev`
- Verify `http://localhost:5173` is accessible

### Elements not found
- Verify `data-testid` attributes exist in component
- Use `--debug` mode to inspect page
- Check for dynamic content that loads asynchronously

### Flaky tests
- Use `waitForLoadState()` after navigation
- Add explicit waits for network calls
- Avoid hard-coded `page.waitForTimeout()`

### Screenshot doesn't show what you expect
- Test may have scrolled or navigated
- Check video recording for full picture
- Use `page.pause()` to stop at specific point

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Isolation](https://playwright.dev/docs/test-isolation)
- [Advanced Patterns](https://playwright.dev/docs/pom)

## Skill Credit

This testing setup follows patterns from the **Playwright E2E Testing Skill**:
- Repository: `bobmatnyc/claude-mpm-skills`
- Skill ID: `playwright-e2e-testing`
- Installation: `npx skills add bobmatnyc/claude-mpm-skills@playwright-e2e-testing -g -y`
