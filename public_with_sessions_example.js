
'use strict';

const express = require('express');
const session = require('express-session');
const XeroClient = require('xero-node').AccountingAPIClient;
const config = require('./config.json');

let app = express()

app.set('port', (process.env.PORT || 3000))
app.use(express.static(__dirname + '/public'))
app.use(session({
    secret: 'something crazy',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.get('/', function(req, res) {
	res.send('<a href="/connect">Connect to Xero</a>');
})

app.get('/connect', async function(req, res) {
	let xeroClient = new XeroClient(config,req.session);

	try {
		let requestToken = await xeroClient.oauth1Client.getRequestToken();
		let authoriseUrl = xeroClient.oauth1Client.buildAuthoriseUrl(requestToken);
		req.session.oauthRequestToken = requestToken;
		res.redirect(authoriseUrl);
	} catch (err) {
		res.send("Sorry, something went wrong");
	}
})

app.get('/callback', async function(req, res) {
	let xeroClient = new XeroClient(config,req.session);
	let savedRequestToken = req.session.oauthRequestToken;
	let oauth_verifier = req.query.oauth_verifier;
	let accessToken = await xeroClient.oauth1Client.swapRequestTokenforAccessToken(savedRequestToken, oauth_verifier);
	req.session.accessToken = accessToken;

	res.redirect('/organisation');
})

app.get('/organisation', async function(req, res) {
	let xeroClient = new XeroClient(config,req.session.accessToken);
	
	try {
		let organisations = await xeroClient.organisations.get()
		res.send("Hello, " + organisations.Organisations[0].Name);
	} catch (err) {
		res.send("Sorry, something went wrong");
	}
})

app.listen(app.get('port'), function() {
	console.log("Your Xero basic public app is running at localhost:" + app.get('port'))
})
