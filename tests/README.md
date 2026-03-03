# E2E Tests

This directory contains the End-to-End (E2E) tests for the HeyCreator application, powered by [Playwright](https://playwright.dev/).

## Prerequisites

1.  **Install Dependencies**: If you haven't already, install the project dependencies:
    ```bash
    npm install
    ```

2.  **Install Playwright Browsers**: The first time you run the tests, you may need to install the browser binaries.
    ```bash
    npx playwright install --with-deps
    ```

3.  **Running Application**: The E2E tests run against a live, running instance of the application. Make sure your development server is running:
    ```bash
    npm run dev
    ```
    
4.  **Test Users**: The tests require the demo brand and influencer users to exist in the database.
    ```bash
    npm run test:create-users
    ```

## Running the Tests

### Run all tests
To execute all E2E tests, use the following command:

```bash
npx playwright test
```

### Run a specific file
You can run a specific test file by providing its path:

```bash
npx playwright test e2e/rbac.spec.ts
```

### Run in UI Mode
Playwright's UI mode is excellent for debugging. It allows you to step through tests, inspect the page, and see a timeline of events.

```bash
npx playwright test --ui
```

### View the HTML Report
After a test run, an HTML report is generated in the `playwright-report` directory. You can open it to see a detailed summary of the results.

```bash
npx playwright show-report
```
