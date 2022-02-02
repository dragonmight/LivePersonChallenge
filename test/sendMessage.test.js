// Optional. Defining a unit test framework for the function sendMessage as an example to demonstrate
const sendMessage = require('../sendMessage')
let accountNumber = 66001775;
let strAccountNumber = accountNumber.toString();

test('Confirm whether conversation ID exists', () => {
    expect(sendMessage(strAccountNumber, "Message from the tester")).not.toBeNull();
})