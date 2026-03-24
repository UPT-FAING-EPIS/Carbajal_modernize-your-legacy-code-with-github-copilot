#!/usr/bin/env node

const prompt = require("prompt-sync")({ sigint: true });

const OPERATIONS = {
  TOTAL: "TOTAL ",
  CREDIT: "CREDIT",
  DEBIT: "DEBIT ",
  READ: "READ",
  WRITE: "WRITE",
};

function toMoney(value) {
  return value.toFixed(2);
}

function parseAmount(rawInput) {
  const amount = Number(rawInput);

  // COBOL picture definition is unsigned numeric, so negative/non-numeric values are invalid.
  if (Number.isNaN(amount) || amount < 0) {
    return null;
  }

  return amount;
}

function createAccountingApp(io = {}) {
  const ask = io.ask || ((message) => prompt(message));
  const print = io.print || ((message) => console.log(message));
  let storageBalance = 1000.0;

  function dataProgram(passedOperation, balance) {
    if (passedOperation === OPERATIONS.READ) {
      return storageBalance;
    }

    if (passedOperation === OPERATIONS.WRITE) {
      storageBalance = balance;
      return storageBalance;
    }

    return balance;
  }

  function operations(passedOperation) {
    let finalBalance = 1000.0;

    if (passedOperation === OPERATIONS.TOTAL) {
      finalBalance = dataProgram(OPERATIONS.READ, finalBalance);
      print(`Current balance: ${toMoney(finalBalance)}`);
      return;
    }

    if (passedOperation === OPERATIONS.CREDIT) {
      const amount = parseAmount(ask("Enter credit amount: "));

      if (amount === null) {
        print("Invalid amount. Please enter a non-negative number.");
        return;
      }

      finalBalance = dataProgram(OPERATIONS.READ, finalBalance);
      finalBalance += amount;
      dataProgram(OPERATIONS.WRITE, finalBalance);
      print(`Amount credited. New balance: ${toMoney(finalBalance)}`);
      return;
    }

    if (passedOperation === OPERATIONS.DEBIT) {
      const amount = parseAmount(ask("Enter debit amount: "));

      if (amount === null) {
        print("Invalid amount. Please enter a non-negative number.");
        return;
      }

      finalBalance = dataProgram(OPERATIONS.READ, finalBalance);

      if (finalBalance >= amount) {
        finalBalance -= amount;
        dataProgram(OPERATIONS.WRITE, finalBalance);
        print(`Amount debited. New balance: ${toMoney(finalBalance)}`);
      } else {
        print("Insufficient funds for this debit.");
      }
    }
  }

  function showMenu() {
    print("--------------------------------");
    print("Account Management System");
    print("1. View Balance");
    print("2. Credit Account");
    print("3. Debit Account");
    print("4. Exit");
    print("--------------------------------");
  }

  function handleMenuChoice(rawChoice) {
    const userChoice = Number(rawChoice);

    switch (userChoice) {
      case 1:
        operations(OPERATIONS.TOTAL);
        return true;
      case 2:
        operations(OPERATIONS.CREDIT);
        return true;
      case 3:
        operations(OPERATIONS.DEBIT);
        return true;
      case 4:
        return false;
      default:
        print("Invalid choice, please select 1-4.");
        return true;
    }
  }

  function run() {
    let continueRunning = true;

    while (continueRunning) {
      showMenu();
      const choice = ask("Enter your choice (1-4): ");
      continueRunning = handleMenuChoice(choice);
    }

    print("Exiting the program. Goodbye!");
  }

  function getBalance() {
    return storageBalance;
  }

  return {
    dataProgram,
    operations,
    showMenu,
    handleMenuChoice,
    run,
    getBalance,
  };
}

if (require.main === module) {
  createAccountingApp().run();
}

module.exports = {
  OPERATIONS,
  toMoney,
  parseAmount,
  createAccountingApp,
};
