const sendMessage = require('../LivePersonChallenge')

test('Message sent', () => {
    expect(sendMessage.returnText()).toBe(true);
})