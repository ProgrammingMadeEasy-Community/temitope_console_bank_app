import readlineSync from 'readline-sync';
import fs from 'fs';


let appData = {};

console.log('***Welcome to Console Bank App***\n');
// Initialize the appData for the application
try{
  let currentData = JSON.parse(fs.readFileSync('database.json', 'utf8'));
    appData = {...currentData};
}
catch(err){
  console.log('Database not found. Creating a new database...', err);
  appData = {
    users: [],
    transactions: []
  };
  fs.writeFileSync('database.json', JSON.stringify(appData));
}

const bankingOptions = ['Create Account', 'Deposit', 'Withdraw', 'Transfer', 'View Account Details', 'View Transaction History'];

// Display Banking Options
const displayBankingOptions = () => {
console.log('\nBanking Menu: ')
console.log('*******************')
const bankingOptionIndex = readlineSync.keyInSelect(bankingOptions, 'Select an option: ');

switch(bankingOptionIndex){
  case 0:
    createAccount();
    break;
  case 1:
    deposit();
    break;
  case 2:
    withdraw();
    break;
  case 3:
    transfer();
    break;
  case 4:
    viewAccountDetails();
    break;
  case 5:
    viewTransactionHistory();
    break;
  default:
    console.log('\nThank you for using this app. Goodbye!...\n');
    process.exit();
}
}

// Create Account
const createAccount = () => {
  let accountName = readlineSync.question('Enter Account Name: ');

  // Check if account name already exists
  let accountNameExists = appData.users.find(account => account.accountName.toLowerCase() === accountName.toLowerCase());
  if(accountNameExists){
    console.log('Account name already exists\n');
    const tryAgain = readlineSync.keyInYNStrict('Do you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? createAccount() : displayBankingOptions();
  }

  let pin = readlineSync.question('Enter PIN - (Four Digits) : ');
  while(pin.length !== 4 || isNaN(pin)){
    console.log('Invalid PIN. PIN must be four digits');
    pin = readlineSync.question('Enter PIN - (Four Digits) : ');
  }

  let confirmPin = readlineSync.question('Confirm PIN - (Four Digits) : ');
  while(confirmPin.length !== 4 || isNaN(confirmPin)){
    console.log('Invalid PIN. PIN must be four digits');
    confirmPin = readlineSync.question('Confirm PIN - (Four Digits) : ');
  }
  while(confirmPin !== pin){
    console.log('PINs do not match');
    confirmPin = readlineSync.question('Confirm PIN - (Four Digits) : ');
  }

  let accountNumber = generateAccountNumber();

  let accountDetails = {
    accountName,
    accountNumber,
    pin,
    accountBalance : 0,
    transactionHistory: [],
    createdAt: new Date(),
    status: 'active'
  }

  appData.users.push(accountDetails);
  fs.writeFileSync('database.json', JSON.stringify(appData));
  console.log('\n*** Account created successfully ***\n');

  console.log(`Account Name: ${accountName} \nAccount Number: ${accountNumber} \nAccount Balance: ${accountDetails.accountBalance}`);

  // Prompt for banking options
  const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to create another account? Press Y for Yes and N for No: ');
  performAnotherOperation ? createAccount() : displayBankingOptions();
}

// Generate Account Number - I'm making it four digits for simplicity
const generateAccountNumber = () => {
  let accountNumber = Math.floor(Math.random() * 1000);
  let accountNumberExists = appData.users.find(account => account.accountNumber === accountNumber);
  if(accountNumberExists){
    generateAccountNumber();
  }
  return accountNumber;
}

// Deposit
const deposit = () => {
  let accountNumber = readlineSync.question('Enter Account Number: ');
  let account = appData.users.find(account => account.accountNumber === Number(accountNumber));
  if(!account){
    console.log('\nAccount not found');
    const tryAgain = readlineSync.keyInYNStrict('\nDo you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? deposit() : displayBankingOptions();
  }

  let amount = readlineSync.question('Enter Amount: ');
  while(isNaN(amount) || Number(amount) <= 0){
    console.log('\nInvalid amount. Amount must be a number greater than 0');
    amount = readlineSync.question('Enter Amount: ');
  }

  let confirmDeposit = readlineSync.keyInYNStrict(`\nConfirm Deposit of ${amount} to ${account.accountName} with account Number - ${account.accountNumber}  - (Press Y for Yes and N for No) : `);

  if(!confirmDeposit){
    console.log('\n*** Deposit cancelled ***');
    displayBankingOptions();
  }

  account.accountBalance += Number(amount);
  account.transactionHistory.push({type: 'Deposit', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
  appData.transactions.push({type: 'Deposit', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
  fs.writeFileSync('database.json', JSON.stringify(appData));
  console.log('\n*** Deposit successful ***');

  console.log(`Account Name: ${account.accountName} \nAccount Number: ${account.accountNumber} \nAccount Balance: ${account.accountBalance}`);


  // Prompt for banking options
  const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to perform another deposit operation? Press Y for Yes and N for No: ');
  performAnotherOperation ? deposit() : displayBankingOptions();
}

// Transfer
const transfer = () => {
  let accountNumber = readlineSync.question('Enter Sender Account Number: ');
  let account = appData.users.find(account => account.accountNumber === Number(accountNumber));
  if(!account){
    console.log('\n*** Account not found ***');
    const tryAgain = readlineSync.keyInYNStrict('\nDo you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? transfer() : displayBankingOptions();
  }
  if(account.status === 'locked'){
    console.log('\nYou cannot perform this transaction because your account is locked. Kindly contact customer care');
    const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to perform another operation? Press Y for Yes and N for No: ');
    performAnotherOperation ? displayBankingOptions() : console.log('\nThank you for using this app. Goodbye!...');
    return;
  }

  let recipientAccountNumber = readlineSync.question('Enter Recipient Account Number: ');
  let recipientAccount = appData.users.find(account => account.accountNumber === Number(recipientAccountNumber));
  if(!recipientAccount){
    console.log('\n*** Recipient Account not found ***');
    const tryAgain = readlineSync.keyInYNStrict('\nDo you want to try again? Press Y for Yes and N for No: ');
    if(tryAgain){
      recipientAccountNumber = readlineSync.question('Enter Recipient Account Number: ');
      recipientAccount = appData.users.find(account => account.accountNumber === Number(recipientAccountNumber));
    }
    else{
      console.log('\n*** Transfer cancelled ***');
      displayBankingOptions();
    }
  }

  let amount = readlineSync.question('Enter Amount: ');
  while(isNaN(amount) || Number(amount) <= 0){
    console.log('Invalid amount. Amount must be a number greater than 0');
    amount = readlineSync.question('Enter Amount: ');
  }
  while(Number(amount) > account.accountBalance){
    console.log('\nInsufficient funds. Kindly deposit more funds into your account or enter a lesser amount');
    amount = readlineSync.question('Enter Amount: ');
  }

  let confirmTransfer = readlineSync.keyInYNStrict(`\nConfirm Transfer of ${amount} to ${account.accountName} with account Number - ${account.accountNumber}  - (Press Y for Yes and N for No) : `);

  if(!confirmTransfer){
    console.log('\n*** Transfer cancelled ***');
    displayBankingOptions();
    return;
  }

  // Verify PIN
let pin = readlineSync.question('Enter PIN - (Four Digits) : ');
let pinConfirmed = false;
for(let i = 0; i < 2; i++){
  if(account.pin === pin) {
    pinConfirmed = true;
    break;
  }else{
    console.log('Wrong PIN. You have ' + (2 - i) + ' attempts left\n');
    pin = readlineSync.question('Enter PIN - (Four Digits) : ');
  }
}

if(!pinConfirmed){
  console.log('\n *** Maximum number of attempts exceeded. Your account has been locked. Kindly contact customer care ***\n');
  account.status = 'locked';
  fs.writeFileSync('database.json', JSON.stringify(appData));
  displayBankingOptions();
  return;
}

account.accountBalance -= Number(amount);
account.transactionHistory.push({type: 'Transfer', amount, date: new Date(), recipientAccountNumber, recipientAccountName: recipientAccount.accountName});
recipientAccount.transactionHistory.push({type: 'Deposit', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
appData.transactions.push({type: 'Transfer', amount, date: new Date(), accountNumber, recipientAccountNumber, recipientAccountName: recipientAccount.accountName, senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
appData.transactions.push({type: 'Deposit', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName, recipientAccountNumber, recipientAccountName: recipientAccount.accountName});

recipientAccount.accountBalance += Number(amount);
fs.writeFileSync('database.json', JSON.stringify(appData));
console.log('\n*** Transfer successful ***');

console.log(`Account Name: ${account.accountName} \nAccount Number: ${account.accountNumber} \nAccount Balance: ${account.accountBalance}`);

// Prompt for banking options
const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to perform another transfer operation? Press Y for Yes and N for No: ');
performAnotherOperation ? transfer() : displayBankingOptions();
}

// Withdraw
const withdraw = () => {
  let accountNumber = readlineSync.question('Enter Account Number: ');
  let account = appData.users.find(account => account.accountNumber === Number(accountNumber));
  if(!account){
    console.log('\n*** Account not found ***');
    const tryAgain = readlineSync.keyInYNStrict('Do you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? withdraw() : displayBankingOptions();
  }

  if(account.status === 'locked'){
    console.log('\n*** You cannot perform this transaction because your account is locked. Kindly contact customer care ***');
    const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to perform another operation? Press Y for Yes and N for No: ');
    performAnotherOperation ? displayBankingOptions() : console.log('\nThank you for using this app. Goodbye!...');
    return;
  }

  let amount = readlineSync.question('Enter Amount: ');
  while(isNaN(amount) || Number(amount) <= 0){
    console.log('\nInvalid amount. Amount must be a number greater than 0');
    amount = readlineSync.question('Enter Amount: ');
  }
  while(Number(amount) > account.accountBalance){
    console.log('\n*** Insufficient funds. Kindly deposit more funds into your account or enter a lesser amount ***');
    amount = readlineSync.question('Enter Amount: ');
  }

  let confirmWithdrawal = readlineSync.keyInYNStrict(`\nConfirm Withdrawal of ${amount} from ${account.accountName} with account Number - ${account.accountNumber}  - (Press Y for Yes and N for No) : `);

  if(!confirmWithdrawal){
    console.log('\n*** Withdrawal cancelled ***');
    displayBankingOptions();
    return;
  }

  // Verify PIN
let pin = readlineSync.question('Enter PIN - (Four Digits) : ');
let pinConfirmed = false;
for(let i = 0; i < 2; i++){
  if(account.pin === pin) {
    pinConfirmed = true;
    break;
  }else{
    console.log('\nWrong PIN. You have ' + (2 - i) + ' attempts left');
    pin = readlineSync.question('Enter PIN - (Four Digits) : ');
  }
}

if(!pinConfirmed){
  console.log('\n*** Maximum number of attempts exceeded. Your account has been locked. Kindly contact customer care ***\n');
  account.status = 'locked';
  fs.writeFileSync('database.json', JSON.stringify(appData));
  displayBankingOptions();
  return;
}

account.accountBalance -= Number(amount);
account.transactionHistory.push({type: 'Withdrawal', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
appData.transactions.push({type: 'Withdrawal', amount, date: new Date(), senderAccountNumber: account.accountNumber, senderAccountName: account.accountName});
fs.writeFileSync('database.json', JSON.stringify(appData));
console.log('\n*** Withdrawal successful ***');

console.log(`\nAccount Name: ${account.accountName} \nAccount Number: ${account.accountNumber} \nAccount Balance: ${account.accountBalance}`);

// Prompt for banking options
const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to perform another withdrawal operation? Press Y for Yes and N for No: ');
performAnotherOperation ? withdraw() : displayBankingOptions();
}

// View Account Details
const viewAccountDetails = () => {
  let accountNumber = readlineSync.question('Enter Account Number: ');
  let account = appData.users.find(account => account.accountNumber === Number(accountNumber));
  if(!account){
    console.log('\n*** Account not found ***');
    const tryAgain = readlineSync.keyInYNStrict('\nDo you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? viewAccountDetails() : displayBankingOptions();
  }

  console.log(`\nAccount Name: ${account.accountName} \nAccount Number: ${account.accountNumber} \nAccount Balance: ${account.accountBalance === 0 ? '0.00' : account.accountBalance} \nAccount Status: ${account.status}`);

  // Prompt for banking options
  const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to view another account details? Press Y for Yes and N for No: ');
  performAnotherOperation ? viewAccountDetails() : displayBankingOptions();
}

// View Transaction History
const viewTransactionHistory = () => {
  let accountNumber = readlineSync.question('Enter Account Number: ');
  let account = appData.users.find(account => account.accountNumber === Number(accountNumber));
  if(!account){
    console.log('\n*** Account not found ***');
    const tryAgain = readlineSync.keyInYNStrict('\nDo you want to try again? Press Y for Yes and N for No: ');
    tryAgain ? viewTransactionHistory() : displayBankingOptions();
  }

  let transactionHistory = account.transactionHistory;
  if(transactionHistory.length === 0){
    console.log('\n*** No transaction history found ***');
  }
  else{
    console.log('\n*** Transaction History ***');
    console.log(transactionHistory);
  }

  // Prompt for banking options
  const performAnotherOperation = readlineSync.keyInYNStrict('\nDo you want to view another account transaction history? Press Y for Yes and N for No: ');
  performAnotherOperation ? viewTransactionHistory() : displayBankingOptions();
}


displayBankingOptions();





