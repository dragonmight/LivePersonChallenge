const sendMessage = require('../sendMessage')
let accountNumber = 66001775;
let strAccountNumber = accountNumber.toString();

test('Confirm whether conversation ID exists', () => {
    expect(sendMessage(strAccountNumber, "Message from the tester")).toBeFalsy();
})