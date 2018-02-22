const Organization = artifacts.require('Organization');
const Employee = artifacts.require('Employee');
const Tools = artifacts.require('Tools');
const SafeMath = artifacts.require('SafeMath');
const OpenCharityToken = artifacts.require('OpenCharityToken');
const CharityEvent = artifacts.require('CharityEvent');
const IncomingDonation = artifacts.require('IncomingDonation');
const tokenParams = require('../contracts-params').token;


contract('Organization', function(accounts) {
    const ADMIN_ACCOUNTS = [accounts[1], accounts[2]];
    const INCOMING_DONATION_AMOUNT = 200;

    let OrganizationInstance;
    let IncomingDonationInstance;
    let CharityEventInstance;
    let OpenCharityTokenInstance;

    beforeEach(async () => {
        const SafeMathInstance = await SafeMath.new();
        const ToolsInstance = await Tools.new();
        await Organization.link('Tools', ToolsInstance.address);
        await OpenCharityToken.link('SafeMath', SafeMathInstance.address);

        OpenCharityTokenInstance = await OpenCharityToken.new('Test', 'TST', tokenParams.decimals);
        OrganizationInstance = await Organization.new(OpenCharityTokenInstance.address, ADMIN_ACCOUNTS, 'Test Organization');
        await OpenCharityTokenInstance.setMintAgent(OrganizationInstance.address, true);

        await OrganizationInstance.setIncomingDonation('Test Incoming Donation', INCOMING_DONATION_AMOUNT, 'Test note', {
            from: ADMIN_ACCOUNTS[0]
        });

        await OrganizationInstance.addCharityEvent('Test Charity Event', '100', '0', {
            from: ADMIN_ACCOUNTS[0]
        });


        CharityEventInstance = CharityEvent.at(await getLastCharityEventAddress(OrganizationInstance));
        IncomingDonationInstance = IncomingDonation.at(await getLastIncomingDonationAddress(OrganizationInstance));

    });

    it('should move tokens from donation to charity event contract', async () => {
        console.log(`IncomingDonation address: ${IncomingDonationInstance.address}`);
        console.log(`CharityEventInstance address: ${CharityEventInstance.address}`);

        try {

            await IncomingDonationInstance.moveToCharityEvent(CharityEventInstance.address, INCOMING_DONATION_AMOUNT, {
                from: ADMIN_ACCOUNTS[0]
            });

            console.log(`address: ${ADMIN_ACCOUNTS[0]}`);

            const incomingDonationBalance = await OpenCharityTokenInstance.balanceOf(IncomingDonationInstance.address);
            const eventBalance = await OpenCharityTokenInstance.balanceOf(CharityEventInstance.address);

            assert(eventBalance.toNumber() === INCOMING_DONATION_AMOUNT, 'Tokens haven\'t move to charity event');
            assert(incomingDonationBalance.toNumber() === 0, 'Tokens are still on incomingDonation balance');

        } catch (e) {
            console.log(e);
        }
    });


});


async function getLastCharityEventAddress(organizationInstance) {
    let count = (await organizationInstance.charityEventCount()).toNumber();
    return organizationInstance.charityEventIndex(--count);
}

async function getLastIncomingDonationAddress(organizationInstance) {
    let count = (await organizationInstance.incomingDonationCount()).toNumber();
    return organizationInstance.incomingDonationIndex(--count);
}


