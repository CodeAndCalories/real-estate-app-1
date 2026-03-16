var data = require('./properties.json');
var pf = data.filter(function(r) { return r.lead_type === 'Pre-Foreclosure'; });
var el = data.filter(function(r) { return r.lead_type === 'Expired Listing'; });
var io = data.filter(function(r) { return r.lead_type === 'Investor Opportunity'; });

console.log('Total:', data.length);
console.log('PF:', pf.length, 'EL:', el.length, 'IO:', io.length);

// City counts
var cityCounts = {};
data.forEach(function(r) { cityCounts[r.city] = (cityCounts[r.city] || 0) + 1; });
console.log('City counts:', JSON.stringify(cityCounts));

// Field count check
var badFields = data.filter(function(r) { return Object.keys(r).length !== 16; });
console.log('Records with wrong field count:', badFields.length);

// Pre-Foreclosure checks
var pfNoOwner = pf.filter(function(r) { return r.owner_name === null; });
console.log('PF missing owner_name:', pfNoOwner.length, '(should be 0)');
var pfHasAgent = pf.filter(function(r) { return r.agent_name !== null; });
console.log('PF with agent_name set:', pfHasAgent.length, '(should be 0)');
var pfHasPpsf = pf.filter(function(r) { return r.price_per_sqft !== null; });
console.log('PF with price_per_sqft set:', pfHasPpsf.length, '(should be 0)');

// Expired Listing checks
var elNoAgent = el.filter(function(r) { return r.agent_name === null; });
console.log('EL missing agent_name:', elNoAgent.length, '(should be 0)');
var elNoPLP = el.filter(function(r) { return r.previous_listing_price === null; });
console.log('EL missing previous_listing_price:', elNoPLP.length, '(should be 0)');
var elNoDom = el.filter(function(r) { return r.days_on_market === null; });
console.log('EL missing days_on_market:', elNoDom.length, '(should be 0)');

// Investor Opportunity checks
var ioNoPpsf = io.filter(function(r) { return r.price_per_sqft === null; });
console.log('IO missing price_per_sqft:', ioNoPpsf.length, '(should be 0)');
var ioNoMktPpsf = io.filter(function(r) { return r.market_avg_price_per_sqft === null; });
console.log('IO missing market_avg_price_per_sqft:', ioNoMktPpsf.length, '(should be 0)');
var ioNoPdp = io.filter(function(r) { return r.price_drop_percent === null; });
console.log('IO missing price_drop_percent:', ioNoPdp.length, '(should be 0)');
var ioNoRent = io.filter(function(r) { return r.rent_estimate === null; });
console.log('IO missing rent_estimate:', ioNoRent.length, '(should be 0)');

// All opportunity_score null
var nonNullOppScore = data.filter(function(r) { return r.opportunity_score !== null; });
console.log('Records with non-null opportunity_score:', nonNullOppScore.length, '(should be 0)');

// Sample records
console.log('\nSample Pre-Foreclosure:', JSON.stringify(pf[0], null, 2));
console.log('\nSample Expired Listing:', JSON.stringify(el[0], null, 2));
console.log('\nSample Investor Opportunity:', JSON.stringify(io[0], null, 2));
