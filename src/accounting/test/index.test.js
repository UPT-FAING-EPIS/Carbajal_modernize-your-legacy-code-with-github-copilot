const { createAccountingApp, OPERATIONS } = require("../index");

function buildApp(inputQueue = []) {
  const outputs = [];
  const ask = jest.fn(() => {
    if (inputQueue.length === 0) {
      return "";
    }
    return inputQueue.shift();
  });
  const print = jest.fn((message) => {
    outputs.push(String(message));
  });

  const app = createAccountingApp({ ask, print });
  return { app, outputs, ask, print };
}

describe("Accounting app parity with COBOL test plan", () => {
  test("TC-001 - display main menu and options", () => {
    const { app, outputs } = buildApp();

    app.showMenu();

    expect(outputs).toEqual([
      "--------------------------------",
      "Account Management System",
      "1. View Balance",
      "2. Credit Account",
      "3. Debit Account",
      "4. Exit",
      "--------------------------------",
    ]);
  });

  test("TC-002 - view initial account balance", () => {
    const { app, outputs } = buildApp();

    app.handleMenuChoice("1");

    expect(outputs).toContain("Current balance: 1000.00");
  });

  test("TC-003 - credit account with valid amount", () => {
    const { app, outputs } = buildApp(["200.00"]);

    app.handleMenuChoice("2");

    expect(app.getBalance()).toBeCloseTo(1200.0, 2);
    expect(outputs).toContain("Amount credited. New balance: 1200.00");
  });

  test("TC-004 - debit account with sufficient funds", () => {
    const { app, outputs } = buildApp(["250.00"]);

    app.handleMenuChoice("3");

    expect(app.getBalance()).toBeCloseTo(750.0, 2);
    expect(outputs).toContain("Amount debited. New balance: 750.00");
  });

  test("TC-005 - debit account with amount equal to full balance", () => {
    const { app, outputs } = buildApp(["1000.00"]);

    app.handleMenuChoice("3");

    expect(app.getBalance()).toBeCloseTo(0.0, 2);
    expect(outputs).toContain("Amount debited. New balance: 0.00");
  });

  test("TC-006 - reject debit when funds are insufficient", () => {
    const { app, outputs } = buildApp(["1000.01"]);

    app.handleMenuChoice("3");

    expect(app.getBalance()).toBeCloseTo(1000.0, 2);
    expect(outputs).toContain("Insufficient funds for this debit.");
  });

  test("TC-007 - handle invalid menu choice", () => {
    const { app, outputs } = buildApp();

    const shouldContinue = app.handleMenuChoice("9");

    expect(shouldContinue).toBe(true);
    expect(outputs).toContain("Invalid choice, please select 1-4.");
  });

  test("TC-008 - exit application path", () => {
    const { app, outputs } = buildApp(["4"]);

    app.run();

    expect(outputs).toContain("Exiting the program. Goodbye!");
  });

  test("TC-009 - persist updated balance after credit", () => {
    const { app, outputs } = buildApp(["300.00"]);

    app.handleMenuChoice("2");
    app.handleMenuChoice("1");

    expect(app.getBalance()).toBeCloseTo(1300.0, 2);
    expect(outputs).toContain("Current balance: 1300.00");
  });

  test("TC-010 - persist updated balance after debit", () => {
    const { app, outputs } = buildApp(["300.00"]);

    app.handleMenuChoice("3");
    app.handleMenuChoice("1");

    expect(app.getBalance()).toBeCloseTo(700.0, 2);
    expect(outputs).toContain("Current balance: 700.00");
  });

  test("TC-011 - accumulate multiple sequential transactions", () => {
    const { app } = buildApp(["150.00", "50.00", "25.00"]);

    app.handleMenuChoice("2");
    app.handleMenuChoice("3");
    app.handleMenuChoice("2");

    expect(app.getBalance()).toBeCloseTo(1125.0, 2);
  });

  test("TC-012 - credit with zero amount", () => {
    const { app, outputs } = buildApp(["0.00"]);

    app.handleMenuChoice("2");

    expect(app.getBalance()).toBeCloseTo(1000.0, 2);
    expect(outputs).toContain("Amount credited. New balance: 1000.00");
  });

  test("TC-013 - debit with zero amount", () => {
    const { app, outputs } = buildApp(["0.00"]);

    app.handleMenuChoice("3");

    expect(app.getBalance()).toBeCloseTo(1000.0, 2);
    expect(outputs).toContain("Amount debited. New balance: 1000.00");
  });

  test("TC-014 - verify balance reset on new app run instance", () => {
    const first = buildApp(["100.00"]);
    first.app.handleMenuChoice("2");
    expect(first.app.getBalance()).toBeCloseTo(1100.0, 2);

    const second = buildApp();
    second.app.handleMenuChoice("1");

    expect(second.app.getBalance()).toBeCloseTo(1000.0, 2);
    expect(second.outputs).toContain("Current balance: 1000.00");
  });

  test("TC-015 - validate max amount format boundary", () => {
    const { app, outputs } = buildApp(["999999.99"]);

    expect(() => app.handleMenuChoice("2")).not.toThrow();
    expect(app.getBalance()).toBeCloseTo(1000999.99, 2);
    expect(outputs).toContain("Amount credited. New balance: 1000999.99");
  });

  test("DataProgram parity - READ and WRITE operations", () => {
    const { app } = buildApp();

    expect(app.dataProgram(OPERATIONS.READ, 0)).toBeCloseTo(1000.0, 2);
    app.dataProgram(OPERATIONS.WRITE, 555.55);
    expect(app.dataProgram(OPERATIONS.READ, 0)).toBeCloseTo(555.55, 2);
  });
});
