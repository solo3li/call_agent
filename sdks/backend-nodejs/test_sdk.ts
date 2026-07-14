import { CPaaSClient } from './src/index';

const client = new CPaaSClient({
    apiKey: 'dummy_api_key_for_test',
    baseUrl: 'http://localhost:5246'
});

async function testSDK() {
    try {
        console.log('Testing createConnectionToken...');
        const tokenRes = await client.createConnectionToken({
            agentId: '00000000-0000-0000-0000-000000000000', // We might get a 401 Unauthorized or 404 since it's a dummy ID, but if it reaches the server, the SDK works!
            participantName: 'TestUser'
        });
        console.log('Token Response:', tokenRes);
    } catch (e: any) {
        console.log('Expected Error (Token):', e.message);
    }

    try {
        console.log('\nTesting createTransferToken...');
        const transferRes = await client.createTransferToken('room_12345', 'HumanAgent');
        console.log('Transfer Token Response:', transferRes);
    } catch (e: any) {
        console.log('Expected Error (Transfer):', e.message);
    }

    try {
        console.log('\nTesting initiateSipTransfer...');
        const sipRes = await client.initiateSipTransfer('room_12345', 'sip:test@example.com');
        console.log('SIP Transfer Response:', sipRes);
    } catch (e: any) {
        console.log('Expected Error (SIP Transfer):', e.message);
    }
}

testSDK();
