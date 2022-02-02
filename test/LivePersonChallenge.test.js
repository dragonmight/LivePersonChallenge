let accountNumber = 66001775;
let strAccountNumber = accountNumber.toString();
const sendMessage = require('../LivePersonChallenge')

test('Message sent', () => {
    expect(sendMessage.sendMessage(strAccountNumber)).toBe();
})