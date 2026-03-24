# COBOL Student Account Test Plan

## Scope
This test plan validates the current COBOL business logic for the student account workflow before and during migration to Node.js.

## Assumptions
- Application is compiled successfully as accountsystem.
- Each test case starts from a fresh application run unless explicitly stated otherwise.
- Initial account balance at application start is 1000.00.
- Actual Result, Status, and Comments are completed during execution with stakeholders.

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Display main menu and options | Executable is available | 1. Run the app.<br>2. Observe startup screen. | Menu is displayed with options 1 View Balance, 2 Credit Account, 3 Debit Account, 4 Exit. | TBD | TBD | Validate wording with business stakeholders. |
| TC-002 | View initial account balance | App started, no transactions executed | 1. Enter option 1.<br>2. Observe displayed balance. | Current balance is shown as 1000.00. | TBD | TBD | Confirms initial state. |
| TC-003 | Credit account with valid amount | Fresh app run, current balance 1000.00 | 1. Enter option 2.<br>2. Enter amount 200.00.<br>3. Observe confirmation message. | New balance is 1200.00 and success message is displayed. | TBD | TBD | Validates credit rule: balance increases by entered amount. |
| TC-004 | Debit account with sufficient funds | Fresh app run, current balance 1000.00 | 1. Enter option 3.<br>2. Enter amount 250.00.<br>3. Observe confirmation message. | New balance is 750.00 and success message is displayed. | TBD | TBD | Validates debit when funds are available. |
| TC-005 | Debit account with amount equal to full balance | Fresh app run, current balance 1000.00 | 1. Enter option 3.<br>2. Enter amount 1000.00.<br>3. Observe confirmation message.<br>4. Enter option 1 to verify balance. | Debit succeeds and resulting balance is 0.00. | TBD | TBD | Edge case for condition balance >= amount. |
| TC-006 | Reject debit when funds are insufficient | Fresh app run, current balance 1000.00 | 1. Enter option 3.<br>2. Enter amount 1000.01.<br>3. Observe response.<br>4. Enter option 1 to verify balance. | Message indicates insufficient funds and balance remains 1000.00. | TBD | TBD | Confirms no write occurs on failed debit. |
| TC-007 | Handle invalid menu choice | App is running at main menu | 1. Enter option 9.<br>2. Observe response. | Message Invalid choice, please select 1-4 is displayed and menu loop continues. | TBD | TBD | Validates input routing in main menu. |
| TC-008 | Exit application | App is running at main menu | 1. Enter option 4.<br>2. Observe final output. | Program exits loop and displays Exiting the program. Goodbye! | TBD | TBD | Confirms controlled shutdown path. |
| TC-009 | Persist updated balance after credit | Fresh app run, current balance 1000.00 | 1. Enter option 2 and amount 300.00.<br>2. Enter option 1. | Balance inquiry returns 1300.00. | TBD | TBD | Verifies DataProgram WRITE then READ consistency. |
| TC-010 | Persist updated balance after debit | Fresh app run, current balance 1000.00 | 1. Enter option 3 and amount 300.00.<br>2. Enter option 1. | Balance inquiry returns 700.00. | TBD | TBD | Verifies persistence across operation calls in same run. |
| TC-011 | Accumulate multiple sequential transactions | Fresh app run, current balance 1000.00 | 1. Enter option 2 and amount 150.00.<br>2. Enter option 3 and amount 50.00.<br>3. Enter option 2 and amount 25.00.<br>4. Enter option 1. | Final balance is 1125.00. | TBD | TBD | Validates cumulative business calculations. |
| TC-012 | Credit with zero amount | Fresh app run, current balance 1000.00 | 1. Enter option 2.<br>2. Enter amount 0.00.<br>3. Enter option 1. | Operation is accepted and resulting balance remains 1000.00. | TBD | TBD | Current implementation has no minimum-amount validation. |
| TC-013 | Debit with zero amount | Fresh app run, current balance 1000.00 | 1. Enter option 3.<br>2. Enter amount 0.00.<br>3. Enter option 1. | Operation is accepted and resulting balance remains 1000.00. | TBD | TBD | Useful to confirm expected behavior with stakeholders. |
| TC-014 | Verify balance reset on new app run (no persistent storage) | Complete one run with a modifying transaction first | 1. Run app and credit 100.00.<br>2. Exit app.<br>3. Start app again.<br>4. Enter option 1. | Balance is reset to 1000.00 on new run. | TBD | TBD | Confirms in-memory storage only, no database/file persistence. |
| TC-015 | Validate max amount format boundary | Fresh app run, current balance 1000.00 | 1. Enter option 2.<br>2. Enter amount 999999.99.<br>3. Observe behavior and message. | System processes or rejects based on COBOL numeric limits without crashing; behavior is documented for migration. | TBD | TBD | Captures numeric boundary behavior for Node.js parity tests. |

## Traceability Notes for Node.js Migration
- Menu routing behavior from MainProgram should map to controller-level integration tests.
- Credit and debit arithmetic rules should map to unit tests in account service logic.
- DataProgram read/write behavior should map to repository/state integration tests.
- Insufficient funds branch and invalid option handling should be explicitly covered in negative-path tests.
