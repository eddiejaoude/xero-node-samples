const XeroClient = require('xero-node').AccountingAPIClient;

const config = {
    "appType": "private",
    "consumerKey": "xxx",
    "consumerSecret": "xxx",
    "privateKeyPath": "xxx/privatekey.pem"
};

(async function() {
    let xero = new XeroClient(config);

    await xero.contacts.create({
        Name: 'Phil'
    })

    const res = await xero.contacts.get();
    console.log("First Contact: ", res.Contacts[0].Name);
})();
