export type BlogPost = {
  slug: string
  title: string
  description: string
  publishedAt: string
  readTime: string
  category: string
  content: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'best-tools-for-house-flippers',
    title: 'The Best Tools for House Flippers in 2025',
    description: 'A no-nonsense breakdown of what tools actually help flippers find deals, run numbers, and close faster — and which ones are a waste of money.',
    publishedAt: '2026-03-10',
    readTime: '9 min read',
    category: 'House Flipping',
    content: `
## The Best Tools for House Flippers in 2025

Every flipper starts the same way: driving neighborhoods, knocking on doors, calling agents. That works — until you try to scale it. At some point you need tools that do the heavy lifting, or you're leaving deals on the table while someone else with a better system scoops them up.

Here's what actually moves the needle in 2025, broken down by what stage of the flip you're in.

### Finding the Deal

This is where most flippers spend the wrong money. They pay $99–$149/month for platforms that give them the same data as everyone else. By the time you're calling those leads, three other investors already have.

The flippers who consistently find deals before others are using **property signal tools** — databases that flag distressed properties before they hit any MLS. We're talking pre-foreclosure filings, tax delinquency data, absentee owners, expired listings, code violations. These are properties where the owner has a reason to sell, fast, often below market.

**PropertySignalHQ** pulls from 88,000+ of these signals across 125+ cities. It scores each property on a 0–100 opportunity scale based on multiple distress factors. A score of 85+ means the property has several overlapping signals — pre-foreclosure AND tax delinquent AND absentee owner, for example. That's your target.

The difference between a $40/month tool like this and a $150/month "pro" platform? The cheaper tool is giving you raw motivated-seller signals. The expensive one is showing you what everyone else can see.

### Running the Numbers

Once you've got a candidate property, you need ARV fast. Most new flippers overthink this. Here's a quick method that works:

Pull 3–5 comparable sales within 0.5 miles, similar square footage (within 20%), sold in the last 6 months. Average the price per square foot. Multiply by your subject property's square footage. That's your ARV.

For renovation cost, if you haven't built up your own numbers yet, use $25–$35/sq ft for cosmetic flip, $50–$70/sq ft for full gut rehab. These aren't exact, but they're close enough for your first pass.

The deal works if: ARV × 70% − Repairs = Maximum Allowable Offer (MAO). That's the 70% rule. It's not a law, but it's kept a lot of investors out of bad deals.

Tools that help here: **DealCheck** for quick ARV and cash-on-cash calculations, **PropStream** for pulling comps if you need depth, **Google Sheets** for your own tracking template. Honestly, the simpler the better at this stage.

### Managing the Rehab

This is where flippers lose the most money — not on the buy, but on scope creep and timeline blowout.

A few things that actually help:

**Buildertrend or CoConstruct** if you're doing multiple flips at once and need to manage subcontractors, timelines, and invoices in one place. These are real contractor management tools, not lightweight apps.

**Loom** for walk-through videos. Instead of driving to the job site every day, do a 5-minute video walkthrough with your GC. It forces them to show you everything, and you have a record.

**Houzz Pro** if you're handling your own interior design selections. It lets you put together finish selections in one place and share them with your contractor.

For a single flip, you probably don't need any of this. A shared Google Sheet and daily texts with your GC is fine. The complexity tools are for when you're running 3+ flips simultaneously.

### Selling the Property

Most flippers overlook this part until they've got a finished house sitting. Don't.

Before you close on the purchase, know your exit. Have you talked to 2–3 local agents about comparable listings? Do you have a cash buyer list you can market to before MLS? Are you in any local real estate investor Facebook groups where you could do a pocket listing?

The tools here are mostly relationship-based. Your best tool is a good agent who specializes in selling rehabbed properties. They know what buyers in that neighborhood want. A $400/sq ft kitchen in a $200/sq ft neighborhood is money you'll never get back.

**Zillow 3D Home** and professional photography are worth every dollar. A bad listing photo on a good flip is a crime. Budget $300–$500 for photography and staging consultation. It'll come back to you.

### The Real Answer

The tools that matter most are the ones that find you deals nobody else is seeing, help you say no fast to deals that don't work, and keep your rehab on time and on budget.

In that order.

Don't pay $150/month for a lead platform before you've exhausted the $40/month options. Don't buy rehab management software until you're doing 3+ flips a year. And never skip the deal analysis — the math protects you when your gut says "this one feels right."

If you're starting out or scaling up, the property signal database is where I'd spend first. Finding deals is the whole game.
    `.trim(),
  },
  {
    slug: 'finding-flip-deals-before-the-competition',
    title: 'How to Find Flip Deals Before Other Investors See Them',
    description: 'The strategies serious flippers use to get to motivated sellers first — before the deal hits any platform, before the mailers land, before the competition calls.',
    publishedAt: '2026-03-14',
    readTime: '8 min read',
    category: 'House Flipping',
    content: `
## How to Find Flip Deals Before Other Investors See Them

Here's the thing about most real estate leads: by the time you're calling them, five other investors already have. That's not speculation — if you're marketing to the same list that every wholesaler and flipper in your city bought from a data company last month, you're showing up late.

The investors doing consistent volume in competitive markets have figured out how to see deals earlier than everyone else. Here's how they do it.

### Understand Where Deals Come From Before They're "Deals"

A motivated seller doesn't become motivated overnight. The signs show up weeks or months before they call anyone. This is where most investors miss the opportunity.

Pre-foreclosure is the clearest example. When a homeowner falls 90+ days behind on their mortgage, the lender files a notice of default. That's a public record. From that filing to the foreclosure auction is typically 90–180 days, depending on the state. That window is your window.

Same with tax delinquency. An owner who hasn't paid property taxes in 2+ years is under real pressure. They're not browsing Zillow looking for top dollar. They need out.

Absentee owners — people who own a property but don't live in it — are statistically more likely to sell at a discount, especially if the property has other stress factors on top.

None of these are secrets. The secret is seeing them before the competition, at scale, in the markets you're targeting.

### Use Property Signal Data

Property signal platforms aggregate public records — court filings, tax records, deed transfers, code violations — and surface properties with multiple distress factors. Instead of manually pulling records from the county, you get a scored list.

**PropertySignalHQ** covers 88,000+ properties across 125+ cities. The opportunity score (0–100) factors in how many signals a property has and how severe they are. A score of 90 means this property has several overlapping red flags. That's not always a deal, but it's always worth a look.

The advantage of working from a scored database: you can filter by score, property type, city, and signal type. Instead of calling 200 random leads, you're calling 20 properties that all have strong motivated-seller indicators.

### Move Faster Than Your Market

Speed is an underrated advantage. Most investors mail a postcard and wait. Some knock doors on weekends. The ones consistently winning deals are doing both, faster, and following up more.

When you identify a high-score property, here's a quick outreach sequence:
1. Postcard or letter the day you find it
2. Skip trace and call within 48 hours if you can find a number
3. If no response in 10 days, another letter with a different angle
4. If the property is local enough, drive by — sometimes there's a conversation to be had

The goal is to be the first person they talk to. If you're the first person who called AND the first who showed up AND the first who sent a letter, you have a real relationship advantage over whoever calls later.

### Build Your Off-Market Network

Data is powerful, but relationships are faster.

**Probate attorneys** deal with estates that need to liquidate real property. A good relationship with one probate attorney in your city can generate 2–4 deals a year with zero competition.

**Property managers** know which landlords are tired. A landlord who's been managing a rental for 15 years and just had a nightmare tenant might take $30,000 under market just to be done with it.

**Code enforcement officers** (in some cities) can tip you to properties that are repeat offenders. A property with 5 code violations is often owned by someone who's given up.

These relationships take months to build. Start now.

### Get There First on MLS Too

Even on the MLS, speed matters. Days 1–3 of a listing are often when the best deals get multiple offers. If your agent calls you with a new listing on day 5, you've missed the window on competitive properties.

Set up automated alerts for newly listed properties under your target price, in your target neighborhoods, with keywords like "as-is," "investor special," "estate sale," "needs TLC." Check every morning. Call your agent the same day for anything that looks right.

But for real competitive advantage? The off-market is where it's at.

### The 1-in-50 Rule

Experienced flippers often talk about seeing 50 properties for every 1 they buy. If you're analyzing 10 properties a month, you're not buying enough. If you're buying one without analyzing 50, you're probably overpaying.

Property signal tools let you compress the top of that funnel. Instead of cold-calling random lists hoping to find a motivated seller, you start with a shortlist of properties that already have signals pointing toward motivation. Your conversion rate from lead to deal goes up.

That's the edge.

### Consistency Beats Everything

The flippers who build real businesses aren't the ones who found some magic source. They're the ones who kept showing up — sending letters every month, calling every week, analyzing deals every day — until it became a machine.

Tools help. But the discipline to use them consistently is what separates the investors doing 2–3 flips a year from the ones doing 2–3 a month.

Start with the data. Build the habits around it.
    `.trim(),
  },
  {
    slug: 'wholesale-real-estate-lead-generation',
    title: 'Wholesale Real Estate Lead Generation: What Actually Works in 2025',
    description: 'A practical guide to generating wholesale leads that convert — from property signal data to outreach sequences to building a consistent pipeline.',
    publishedAt: '2026-03-18',
    readTime: '10 min read',
    category: 'Wholesaling',
    content: `
## Wholesale Real Estate Lead Generation: What Actually Works in 2025

Wholesale real estate is a volume game. You need a consistent flow of motivated sellers — people who want out of a property fast enough to accept below-market offers. Without that pipeline, you have nothing to assign.

The problem most new wholesalers run into isn't ambition. It's inefficiency. They spend money on leads that everyone else is calling, or they spend time on outreach that doesn't convert, or both.

Here's what the productive wholesalers are doing differently.

### The Lead Quality Problem

There are two types of wholesale leads:

1. **Warm leads** — properties where the owner has a clear reason to sell fast. Pre-foreclosure, tax liens, probate, divorce, code violations, inherited properties. The motivation is built in.

2. **Cold leads** — everyone else. Absentee owners, equity-rich properties, long-term owners. These can work but require more touches and lower conversion rates.

Most lead generation services sell you a mix of both with no way to separate them. You end up calling 500 leads to get 2 appointments. That math doesn't work unless you have a full-time acquisition team.

The shift: start with pre-filtered, distressed property data. Not just "absentee owner" as the only qualifier, but properties with multiple overlapping signals — pre-foreclosure AND absentee AND tax delinquent. Each additional signal multiplies the likelihood of real motivation.

### Property Signal Databases

Platforms like **PropertySignalHQ** aggregate public records — court filings, tax records, deed transfers, expired listings — and score each property based on the number and severity of distress factors. Their database covers 88,000+ properties across 125+ cities.

A property with a signal score of 85–95 has multiple serious red flags. That doesn't guarantee they'll sell — nothing does — but it means when you reach them, you're not calling someone who's just casually curious. You're calling someone who has a real problem that selling might solve.

Filter by score, city, and signal type. Build a target list of 20–40 properties per week. That's your outreach focus.

### Outreach That Gets Responses

Cold calling works if you're good at it and do it consistently. Most people aren't and don't. Here's a tiered approach:

**First touch: Direct mail.** A handwritten-style letter that addresses their specific situation is still one of the best openers. Don't write a generic "we buy houses" letter. If the property is pre-foreclosure, acknowledge it. "I noticed your property at [address] may be facing some challenges. I'm a local investor who buys homes as-is for cash..." That's not magic, but it's specific. Specificity gets read.

**Second touch: Phone call.** Skip trace the owner using tools like BatchSkipTracing or PropStream's skip trace. Call within 48 hours of the letter going out. Don't pitch on the first call — ask questions. "I sent you a letter about your property on Oak Street. Are you open to talking about it?" Let them lead.

**Third touch: Text.** Texting is gray area in some states depending on your compliance setup (TCPA), so know your rules. But when done properly, text gets a response when calls don't.

**Fourth+ touch: Repeat mail.** Most deals close on the 5th–7th contact. Most investors stop after 2. That's the gap.

### What Kills Your Pipeline

**Chasing the same leads as everyone else.** If you bought your data from a major provider and so did 10 other wholesalers in your city, you're in a race to the bottom on price. The seller gets 15 calls, gets confused, and either lists with an agent or stays put.

**No follow-up system.** Wholesaling is CRM work. Every contact should go into a system — when you called, what they said, when to follow up. FreedomSoft, REsimpli, and Podio are all tools built for this. A spreadsheet works until it doesn't.

**Focusing only on one market.** Big city markets — Phoenix, Dallas, Atlanta — are competitive. But secondary cities and suburbs often have the same distress factors with a fraction of the investor competition. PropertySignalHQ covers 100+ markets, including mid-size cities where you can move faster.

**Underpricing your offers too aggressively.** This sounds counterintuitive, but if you're making lowball offers to everyone, your closing rate stays low even with good leads. Know your numbers. Make real offers on properties where the math works.

### Building a Buyers List

Leads are only valuable if you can close them. Your buyer list is what makes that happen.

Start local. Real estate investor associations, BiggerPockets forums for your market, Facebook groups for your city. Meet cash buyers who are already buying in your target area. Get their buy box — what type of property, what price range, what condition, what timeline.

When you have a contract, the deal should be going to 3–5 buyers who've already expressed interest in similar properties. Not blasted to a list of 1,000 random emails.

Your best buyers are the ones who've closed with you before. Treat them well. Communicate fast. Price your assignments fairly. A buyer who closes with you twice will call you first when they hear about an off-market deal.

### Volume and Consistency

If you're doing fewer than 100 outreach contacts per week, you're probably not doing enough to build consistent momentum. One deal every 3–4 months is fine if wholesaling is a side activity. If it's your business, you need to be under contract on something every month.

That means a database you're working continuously, an outreach system that doesn't depend on you doing everything manually, and a follow-up cadence that keeps you in front of the same sellers for months.

The deals come. But only if you show up consistently enough to catch them.
    `.trim(),
  },
  {
    slug: 'property-signals-for-wholesalers',
    title: 'How Wholesalers Use Property Signals to Find Deals Faster',
    description: 'What property signals are, why they matter for wholesalers, and how to use signal data to get to motivated sellers before your competition.',
    publishedAt: '2026-03-22',
    readTime: '8 min read',
    category: 'Wholesaling',
    content: `
## How Wholesalers Use Property Signals to Find Deals Faster

A motivated seller doesn't hang a sign on their door. They don't post on social media. But they leave signals — in public records, in court filings, in the paper trail that real estate creates at every step.

Wholesalers who learn to read those signals get to the seller before anyone else. That's the whole game.

### What a Property Signal Actually Is

A property signal is any data point that suggests an owner might be motivated to sell. Here are the most valuable ones:

**Pre-foreclosure.** The lender has filed a notice of default. The owner is behind on payments and has a deadline before the bank takes the house. This is the highest-urgency signal there is. The seller needs a solution, fast.

**Tax delinquency.** The owner hasn't paid property taxes in 1–3+ years. Local governments will eventually put a lien on the property and move toward a tax sale. Owners in this situation often owe less than the property is worth but can't or won't sell through traditional channels.

**Absentee ownership.** The owner lives somewhere other than the property. They're a landlord, an out-of-state heir, or someone who inherited a house they don't want. Distance creates motivation — managing a property from 1,000 miles away is expensive and stressful.

**Expired listings.** The property was listed on the MLS and didn't sell. That means either it was overpriced, in bad condition, or the seller wasn't truly motivated. A second conversation 90 days after expiration often hits differently than the first one.

**Inherited properties.** Heirs often want to liquidate quickly, especially when there are multiple heirs who can't agree. Probate creates urgency.

**Code violations.** Multiple code violations suggest a property in disrepair and an owner who isn't maintaining it. That owner often can't afford the repairs needed to sell retail.

None of these alone guarantees a deal. But when a property has 3 or 4 of these signals at once — pre-foreclosure AND tax delinquency AND the owner is absentee — you have something worth pursuing.

### Why Signal Stacking Matters

The value of a signal isn't linear. Each additional signal on a property multiplies the urgency.

Think about it from the seller's perspective. If you're behind on your mortgage, that's stressful. If you're also 2 years behind on property taxes, that's critical. If you don't even live at the property, the friction of dealing with it is even higher. A cash offer that closes in 2 weeks starts looking a lot better than trying to sell retail.

Signal stacking is why a scored database is more useful than a raw list. When you're looking at a property with a score of 90 out of 100, that score reflects multiple serious signals, not just one.

### Using PropertySignalHQ

PropertySignalHQ's database covers 88,000+ properties across 125+ cities. Each property gets an opportunity score from 0–100 based on the type and severity of its distress signals.

The workflow for a wholesaler:

1. **Set your market.** Pick 1–3 cities you're actively working. Start focused.
2. **Filter by score.** Score 75+ is your baseline. Score 85+ is your priority list.
3. **Look at the signal breakdown.** What's driving the score? Pre-foreclosure and tax delinquency is a stronger combo than just an expired listing alone.
4. **Pull your contact list.** Use the export feature to get addresses for your mailer campaign.
5. **Skip trace and call.** For the highest-score properties, pair the mailing with a phone call within a week.

The result: instead of cold-calling 400 random leads, you're working 30–40 high-probability properties per week with real outreach focus.

### The Speed Advantage

The problem with most lead sources is that everyone is using them. If you're calling from a list that 15 other investors in your city also bought, you're not getting any advantage — you're just in line.

Signal data that's updated weekly gives you a window. A property that just filed pre-foreclosure 3 weeks ago is still early. An expired listing from last week is still warm. If you're checking updated signal data consistently, you're seeing these opportunities when they're fresh.

Most investors wait until the leads are cold. You don't have to.

### One Mistake to Avoid

Don't assume a high signal score means the seller will take whatever you offer. Signal data tells you about motivation — it doesn't tell you about equity.

Before you make an offer, check the liens. Run a title search or at minimum pull up what you can find on the county recorder's website. A pre-foreclosure property with $20,000 in equity has very little room to work with. A pre-foreclosure property with $80,000 in equity is a different conversation.

The signal gets you to the door. The equity analysis tells you whether there's a deal inside.

### Making It Repeatable

One deal from property signal data is nice. A system is better.

The wholesalers doing consistent volume are working from a database every week. They're adding new leads as they come in, following up on existing contacts at a consistent cadence, and tracking everything in a CRM so nothing falls through.

It's not complicated. But it requires showing up consistently. The signals are always there. The question is whether you're checking them regularly enough to be first.
    `.trim(),
  },
  {
    slug: 'off-market-property-leads-for-agents',
    title: 'Off-Market Property Leads for Real Estate Agents: A Practical Guide',
    description: 'How buyer\'s agents and listing agents can use off-market property signals to serve clients better, win more listings, and build a sustainable referral business.',
    publishedAt: '2026-03-25',
    readTime: '9 min read',
    category: 'Real Estate Agents',
    content: `
## Off-Market Property Leads for Real Estate Agents: A Practical Guide

Most real estate agents compete for the same listings, call on the same expired leads, and wait for referrals. The agents building durable businesses are doing something different: they're finding opportunities before other agents know they exist.

Off-market property leads aren't just for investors. Agents who understand property signal data have a real competitive advantage — with buyers, with sellers, and with investor clients.

Here's how to use it.

### Why Buyers Are Asking for Off-Market Properties

In competitive markets, buyer frustration is real. Your client makes 4 offers, loses them all, and starts wondering why they hired an agent. They've seen every listing on Zillow. They're refreshing Redfin at 6am.

When you bring them something they can't find themselves, you change the dynamic.

Off-market properties — ones that aren't listed but where the owner might sell — are the answer to that question. These are homeowners in pre-foreclosure, tax-delinquent situations, or other distressed positions who may not have considered listing but who would sell given the right offer.

For your buyer, it means less competition. For you, it means you're delivering value they can't get anywhere else.

### What "Off-Market" Actually Means

There are a few different categories:

**Distressed sellers** — owners with pre-foreclosure filings, tax liens, code violations, or other public-record flags that indicate financial or property stress. These are your highest-probability leads.

**Absentee owners** — landlords or out-of-state owners who might be open to selling the right property for the right price. Less urgent than distressed, but worth approaching.

**Expired listings** — owners who tried to sell and couldn't. Sometimes the price was wrong, sometimes the timing was off, sometimes they pulled back emotionally. 90 days later, they may be ready to try again — and ready to price it right.

**Probate properties** — estates going through court-supervised sale. These often require patience and specific probate expertise, but they're highly motivated sellers.

### How to Use Property Signal Data

Platforms like **PropertySignalHQ** aggregate public records across 125+ cities and score properties by distress level. For agents, the workflow looks like this:

**For buyer clients with specific search criteria:** Filter the database by their target neighborhoods and signal types. If your client wants a 3/2 in a specific zip code at a specific price, you can identify distressed properties in that area and approach the owners directly. This only works in some situations — you'd need to reach out carefully, and some sellers will be represented — but it opens doors that MLS searches don't.

**For prospecting new listings:** A pre-foreclosure homeowner in your farm area is under pressure. They need help. They may not know they have options. A letter from a local agent explaining the process, the timeline, and how a traditional sale compares to other exits could get you a listing that no other agent is fighting for.

**For investor clients:** If you work with investors — flippers, landlords, wholesalers — a database of scored distressed properties is exactly what they're looking for. Being the agent who brings them leads (instead of just helping them close) changes the relationship. You become a business partner, not just a transaction coordinator.

### A Prospecting Letter That Works

Generic expired-listing letters get thrown away. Specific, empathetic letters get read.

When you're targeting a pre-foreclosure homeowner:

*"My name is [Name], and I'm a real estate agent in [City]. I noticed your property at [address] and wanted to reach out. If you're facing a difficult situation with your mortgage, you may have more options than you think — including a traditional sale that could pay off what you owe and put money in your pocket, rather than losing the home to foreclosure. I'd be happy to talk through what that could look like. There's no obligation."*

That's not a pitch. It's an offer to help. The owners who call back are motivated.

### Building Relationships with Investors

Investor clients transact more frequently than traditional buyers and sellers. A flipper doing 6 deals a year pays you 6 commissions. A buy-and-hold investor might buy 2–3 rentals and never sell — but if you're their trusted advisor, they'll send you every retail buyer and seller they know.

To become that advisor, you need to bring them opportunities. And that means understanding what they're looking for — signal score ranges, property types, price points, neighborhoods — and surfacing matching properties from your database proactively.

This is a relationship, not a transaction. Show up consistently with useful data and you'll stay top of mind.

### Staying Compliant

Important: direct outreach to property owners has rules. If they're on the National Do Not Call Registry, phone outreach needs to comply with TCPA. Direct mail is generally fine. If the property is already listed, reach out through the listing agent.

For off-market properties that are clearly distressed, a thoughtful letter is the safest and often most effective first contact.

Also: if you're approaching a seller in pre-foreclosure, be accurate about what you can and can't do. Set realistic expectations about timelines, pricing, and process. These people are often stressed and sometimes being circled by scam operators. Being straightforward and professional is both the ethical approach and the one that actually builds trust.

### The Competitive Advantage

Most agents work from the same data. MLS, Zillow, Redfin. They compete on personality and marketing budget.

The agents who build a property signal practice — consistently working off-market leads, approaching motivated sellers before they list, bringing investor clients deals nobody else found — are operating in a different lane. One where competition is lower and relationships are deeper.

It takes a few months of consistent effort to see the results. But the agents doing it are the ones who don't worry about market downturns, because they've built a sourcing edge that works in any conditions.
    `.trim(),
  },
  {
    slug: 'real-estate-investment-signals',
    title: 'What Are Real Estate Investment Signals? A Beginner\'s Guide',
    description: 'A clear explanation of what property investment signals are, how they\'re scored, and how to use them to find motivated sellers in any market.',
    publishedAt: '2026-03-28',
    readTime: '7 min read',
    category: 'Investor Education',
    content: `
## What Are Real Estate Investment Signals? A Beginner's Guide

If you've spent any time in real estate investing circles, you've probably heard the term "motivated seller." Everyone's looking for them. But what does it actually mean for a seller to be motivated — and how do you find them before everyone else does?

Property investment signals are the answer to both questions.

### The Basic Idea

A real estate investment signal is any data point in the public record that suggests a property owner is under pressure to sell. These signals come from public databases — court filings, tax records, deed transfers, city code enforcement — and they show up weeks or months before a seller reaches out to anyone.

Think of it like this: when a homeowner starts struggling with their mortgage, they don't call an investor first. They try to catch up on payments, call their lender, maybe talk to a bankruptcy attorney. But through all of that, a notice of default gets filed at the county courthouse. That's a public record. That's a signal.

The investor who sees that signal and reaches out first has a real conversation advantage over everyone who's waiting for the seller to show up on some marketing platform.

### Common Property Signal Types

**Pre-foreclosure** — The most powerful signal. The lender has filed a notice that the borrower is in default. The clock is ticking for the homeowner. From the filing to a foreclosure auction is typically 90–180 days depending on state law. That's your window.

**Tax delinquency** — The owner hasn't paid property taxes in 1 or more years. Local governments will eventually move to collect, either through a tax sale or a lien. Owners who are behind on taxes and behind on their mortgage at the same time are in a very difficult position.

**Absentee ownership** — The owner doesn't live at the property. They're a landlord, an out-of-state heir, or someone who inherited a house they don't know what to do with. Absentee owners have less emotional attachment to the property and often more willingness to negotiate.

**Expired listings** — The property was listed on the MLS but didn't sell. This could mean the price was too high, the condition was an issue, or the seller wasn't ready. When you reach out 60–90 days after an expired listing, you often find a seller who's now more open to a different approach.

**Inherited properties** — When someone inherits real estate through probate, there are often multiple heirs who need to agree on a course of action. That friction, combined with the fact that none of them are living there, creates real motivation to sell and move on.

**Code violations** — A property that's racked up municipal code violations is usually one that the owner isn't maintaining. This correlates with financial distress and often indicates someone who's checked out on the property.

### Why Signals Get Scored

Individual signals are useful. Multiple signals on the same property are powerful.

A property in pre-foreclosure is a lead worth pursuing. A property in pre-foreclosure where the owner is 3 years behind on taxes AND lives out of state AND has 4 code violations is a very different conversation. That owner has stacked problems. They need a solution, and a cash offer that closes quickly looks attractive.

Property signal platforms score properties on a 0–100 scale based on how many signals exist and how severe each one is. A score of 90 means the property has multiple serious red flags. A score of 40 means there's one minor signal.

For investors, this scoring system does the filtering work automatically. Instead of manually reviewing hundreds of county records, you pull up a list of the top-scoring properties in your target market and work from there.

**PropertySignalHQ** does exactly this — it pulls from 88,000+ properties across 125+ cities and gives you a real-time scored list you can filter by city, score range, and signal type.

### How Investors Actually Use Them

Here's a practical example of how this works:

Say you're a real estate investor in the Phoenix metro, looking for distressed single-family homes under $350,000. You filter PropertySignalHQ for Phoenix, score 80+. You get a list of 30–40 properties.

You look at the top 10. Five of them have pre-foreclosure as a primary signal. Three of those also have tax delinquency. You export those addresses.

You send a direct mail letter to each one. A week later, you skip trace and call. Two out of 10 respond. You meet with one. That one turns into an offer. The deal closes.

The point isn't that every lead converts — it's that you started with a filtered, high-probability list instead of cold-calling people who have no urgency to sell.

### What Signals Can't Tell You

Signal data tells you about motivation. It doesn't tell you about equity.

A homeowner who's 6 months behind on a $450,000 mortgage in a neighborhood where homes sell for $480,000 is technically motivated, but there's almost no room for an investor to make a deal work.

Always pair signal data with basic financial analysis:
- What does the property likely sell for? (Zillow estimate, recent comps)
- What's owed on the mortgage? (County records often show this, or ask the seller directly)
- What are the tax liens?
- What would it cost to fix up?

If the numbers work, great. If not, move on quickly. The signal got you the conversation — the math tells you if there's a deal.

### Getting Started

You don't need a sophisticated setup to start using property signal data. The basics:

1. Pick 1–2 markets where you want to invest
2. Find a property signal database that covers those markets (PropertySignalHQ covers 125+ cities)
3. Set a score threshold — start at 75+
4. Export 20–30 addresses per week
5. Send a direct mail piece explaining who you are and that you buy properties as-is for cash
6. Follow up by phone where you can find a number

The volume doesn't need to be huge to start. Twenty letters a week, consistent for 3 months, will generate leads. The investors doing this at scale send hundreds of letters a week — but you don't need that to close your first deal.

The signals are there. The question is who's paying attention.
    `.trim(),
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug)
}
