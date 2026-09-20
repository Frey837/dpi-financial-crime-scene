import fs from "node:fs/promises";
import path from "node:path";

const templatePath = process.argv[2];
const outputPath = process.argv[3] ?? path.join("dist", "submission.json");
if (!templatePath) throw new Error("Usage: node build_submission.mjs <answer-template.json> [output.json]");

const template = JSON.parse(await fs.readFile(templatePath, "utf8"));

const E = {
  board: "00 BOARD ORDER READ FIRST.pdf, p. 1",
  mgmt: "01 USE THIS NUMBERS FINAL v9.xlsx, Management P&L",
  bank: "02 Bank Export August.csv",
  crm: "03 CRM Export Cleaned FINAL.xlsx, CRM Export",
  contracts: "04 Contracts Returns and Angry Customers.pdf, pp. 1-2",
  warehouse: "05 Warehouse Count Marta Notes.pdf, pp. 1-2",
  purchases: "06 Purchases Invoices and Goods Received.pdf, pp. 1-2",
  payroll: "07 Payroll Bonuses Contractors NEW.xlsx, Payroll",
  assets: "08 Assets Repairs Leases Maybe.xlsx, Assets",
  loans: "09 Loans Owner Card and Legal Problems.pdf, pp. 1-2",
  messages: "10 Email and WhatsApp Dump DO NOT FORWARD.pdf, pp. 1-3",
  subsequent: "11 Evidence Received After Takeover.pdf, p. 1"
};

const overrides = new Map();
function operational(id, answer, evidence, confidence = "high") {
  overrides.set(id, { answer, evidence, confidence });
}
function material(id, answer, evidence, confidence, aiProposal, independentChallenge, studentReasoning, statementEffect, changedFromAI = false) {
  overrides.set(id, {
    answer,
    evidence,
    confidence,
    aiProposal,
    independentChallenge,
    studentReasoning,
    statementEffect,
    changedFromAI
  });
}

operational("D001", "Match the €180,000 N STAR receipt to INV-26012 NorthStar Events. It settles the accepted February sale; do not record new revenue on receipt.", [E.bank, E.contracts, E.crm]);
operational("D002", "Match €142,000 to INV-26031 Freedom Festivals. It is a partial collection of the €200,000 accepted sale; €58,000 remains receivable.", [E.bank, E.contracts, E.crm]);
operational("D003", "Match €70,000 to INV-26047 Phoenix HR/People. It is a partial collection of the €100,000 completed event; €30,000 remains receivable.", [E.bank, E.contracts, E.crm]);
operational("D004", "Match €95,000 to INV-26063 Liberty Hotels. It is a partial collection of the €120,000 delivered order; €25,000 remains receivable.", [E.bank, E.contracts, E.crm]);
operational("D005", "The €35,000 old-customer receipt settles an opening receivable. Reduce opening AR; do not recognize 2026 revenue.", [E.bank]);
operational("D006", "Treat the €250,000 Stripe Finally Single receipt as collection against €270,000 Jan-Aug web revenue; €20,000 remains receivable.", [E.bank, E.crm]);
operational("D007", "Treat the €37,000 Stripe Never Call Back receipt as collection against €90,000 Jan-Aug web revenue. Gross open AR is €53,000 before the €18,000 R-17 write-off.", [E.bank, E.crm, E.contracts]);
operational("D008", "Classify the €60,000 New Beginnings receipt as a customer deposit/contract liability at 31 August because delivery is 15 September.", [E.bank, E.contracts]);
operational("D009", "Classify the €30,000 Fresh Freedom receipt as a customer deposit/contract liability at 31 August because delivery is 24 September.", [E.bank, E.contracts]);
operational("D010", "Record the €105,000 BoxWorks bank payment against supplier balances. The current batch is €130,000 and €25,000 remains payable.", [E.bank, E.purchases]);
operational("D011", "Record the €92,000 Glass & Drama payment against the €120,000 goods-received invoice; €28,000 remains payable.", [E.bank, E.purchases]);
operational("D012", "Record the €81,000 Print Again payment against the €95,000 goods-received invoice; €14,000 remains payable.", [E.bank, E.purchases]);
operational("D013", "The €100,000 Event supplier payment includes €45,000 settlement of opening AP and €55,000 against the €114,000 current invoice, leaving the externally confirmed €59,000 payable.", [E.bank, E.purchases], "medium");
for (let i = 14; i <= 21; i++) operational(`D${String(i).padStart(3, "0")}`, "No reliable month-specific cash split exists. Include the month within the combined €231,000 Jan-Aug payroll bank settlement and do not invent a monthly amount.", [E.bank, E.payroll], "low");
operational("D022", "Record €48,000 Jan-Aug rent as operating cash paid and rent expense.", [E.bank]);
operational("D023", "Record €55,000 Meta, TikTok and influencer payments as marketing expense and operating cash outflow.", [E.bank]);
operational("D024", "Record €16,000 software subscriptions as operating expense and operating cash outflow.", [E.bank]);
operational("D025", "Record €12,000 utilities as operating expense and operating cash outflow.", [E.bank]);
operational("D026", "Expense the €10,000 replacement belt, cleaning and calibration. The work restored normal output and created no improvement.", [E.bank, E.purchases, E.assets]);
operational("D027", "Capitalize the €60,000 Pack-O-Matic payment as PPE and investing cash outflow; the machine was installed and available for use on 10 May.", [E.bank, E.purchases, E.assets]);
operational("D028", "Capitalize the €20,000 Regret Photo Booth payment as PPE and investing cash outflow; it was available for use on 10 May.", [E.bank, E.purchases, E.assets]);
operational("D029", "Record the €50,000 bank advance as borrowing, not income: cash and loan principal both increase.", [E.bank, E.loans]);
operational("D030", "Record €19,000 as repayment of loan principal and financing cash outflow.", [E.bank, E.loans]);
operational("D031", "Record €10,000 interest paid as operating cash outflow against €12,000 period interest expense, leaving €2,000 payable.", [E.bank, E.loans, E.subsequent]);
operational("D032", "Treat the €70,000 villa reservation as an owner distribution, not marketing or payroll; it is personal and in the founder's name.", [E.bank, E.loans, E.messages]);
operational("D033", "Treat the other €40,000 owner-card spending as an owner distribution. Total owner distributions are €110,000.", [E.bank, E.loans]);
operational("D034", "No insurance transaction, policy or prepaid balance is present in the supplied evidence. Recognize €0 and flag the missing support.", [E.bank, E.mgmt], "low");
operational("D035", "Write the water-damaged basement stock down by its €22,000 carrying value; it has no saleable value. Keep the separate €2,000 disposal quote as an uncertainty, not part of the inventory carrying value.", [E.warehouse, E.subsequent]);
operational("D036", "Write off the €18,000 R-17 receivable. The post-period liquidator notice confirms a condition existing at 31 August and no recovery is expected.", [E.contracts, E.messages, E.subsequent]);
operational("D037", "Recognize a €25,000 legal provision and expense. External counsel assessed the former-employee claim as probable at 31 August.", [E.loans, E.messages, E.subsequent]);
operational("D038", "Record period materials purchases of €459,000 based on goods received before 31 August; closing supplier payables are €126,000.", [E.purchases]);
operational("D039", "Total customer cash receipts are €899,000: €35,000 opening AR, €774,000 collections on current revenue and €90,000 September deposits.", [E.bank, E.crm, E.contracts]);
operational("D040", "Closing bank cash is €60,000 and agrees to the bank export and external bank confirmation.", [E.bank, E.subsequent]);

material("D041", "€90,000 contract liability; no August revenue.", [E.bank, E.contracts, E.messages], "high",
  "Defer both September deposits and present €90,000 as a contract liability.",
  "Independent review agrees that no performance obligation was satisfied by 31 August; cash receipt alone is not revenue.",
  "Both events occur after the reporting date, so the deposits create cash and a matching obligation without affecting August profit.",
  { profit: -90000, cash: 0, assets: 0, liabilities: 90000, equity: -90000 });
material("D042", "€50,000 loan liability; no income.", [E.bank, E.loans, E.messages], "high",
  "Classify the 1 March advance as bank borrowing.",
  "Independent review confirms the signed agreement requires repayment and rejects management's strategic-income label.",
  "The bank advance is financing. It increases cash and debt equally and does not create profit.",
  { profit: -50000, cash: 0, assets: 0, liabilities: 50000, equity: -50000 });
material("D043", "Capitalize the €60,000 packaging machine as PPE from 10 May.", [E.bank, E.purchases, E.assets], "high",
  "Capitalize the installed Pack-O-Matic as equipment.",
  "Independent review agrees that installation and availability for use support PPE recognition; depreciation is assessed separately.",
  "The machine provides multi-period benefit and was available for use on 10 May. The payment is investing cash flow, not repair expense.",
  { profit: 60000, cash: 0, assets: 60000, liabilities: 0, equity: 60000 });
material("D044", "Capitalize the €20,000 photo booth as PPE from 10 May.", [E.bank, E.purchases, E.assets], "high",
  "Capitalize the Regret Photo Booth as equipment.",
  "Independent review agrees that the asset was available for use and rejects management's immediate marketing-expense classification.",
  "The booth is a controlled tangible asset used in event delivery over more than one period.",
  { profit: 20000, cash: 0, assets: 20000, liabilities: 0, equity: 20000 });
material("D045", "Expense the €10,000 belt, cleaning and calibration as repair and maintenance.", [E.bank, E.purchases, E.assets], "high",
  "Expense the work because it only restored normal condition.",
  "Independent review agrees: no capacity increase or useful-life extension supports capitalization.",
  "The work maintains existing service potential and therefore fails the improvement test for PPE capitalization.",
  { profit: -10000, cash: 0, assets: -10000, liabilities: 0, equity: -10000 });
material("D046", "Record the €70,000 villa deposit as owner distribution.", [E.bank, E.loans, E.messages], "high",
  "Remove the villa payment from operating expense and charge it to owner distributions.",
  "Independent review agrees that the property is personal and no customer meeting occurred; neither marketing nor compensation is supportable.",
  "The company received no business asset or service. The payment reduces cash and equity without reducing profit.",
  { profit: 70000, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D047", "Record the other €40,000 owner-card spending as owner distribution.", [E.bank, E.loans, E.payroll], "high",
  "Remove unsupported owner-card charges from payroll/operations and classify them as distributions.",
  "Independent review agrees because no employment approval or business support exists for the claimed founder bonus.",
  "The spending is personal and reduces cash and equity, not operating profit.",
  { profit: 40000, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D048", "Classify €396,000 as physical product COGS using the 31 August physical count; disclose the €405,000 consumption-record alternative.", [E.warehouse, E.purchases], "medium",
  "Use count-based COGS of €396,000: €80,000 opening inventory + €459,000 purchases - €143,000 gross physical count.",
  "Independent analysis prefers the explicit €405,000 consumption record, producing €112,000 net inventory and €65,000 profit; the two sources differ by €9,000.",
  "The reporting-date count is direct evidence of stock on hand and ranks above internal consumption records for existence. The €22,000 damaged layer is written off separately, leaving €121,000 recoverable inventory.",
  { profit: 9000, cash: 0, assets: 9000, liabilities: 0, equity: 9000 });
material("D049", "Classify €80,000 event-delivery payroll as service direct cost/COGS.", [E.payroll], "high",
  "Present event-delivery staff cost as direct cost of completed event revenue.",
  "Independent review agrees because the staff work directly on paid events; management's administrative classification obscures gross margin.",
  "Direct event labour is necessary to deliver the service and belongs in cost of sales.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });

operational("D050", "Classify €72,000 sales and partnerships payroll as operating sales expense, not COGS.", [E.payroll]);
operational("D051", "Classify €96,000 office and finance payroll as administrative operating expense.", [E.payroll]);
operational("D052", "Classify €48,000 rent as operating expense.", [E.bank]);
operational("D053", "Classify €55,000 Meta, TikTok and influencer spend as marketing operating expense.", [E.bank]);
operational("D054", "Classify €16,000 software subscriptions as operating expense.", [E.bank]);
operational("D055", "Classify €12,000 utilities as operating expense.", [E.bank]);
material("D056", "Recognize €24,000 depreciation expense; closing accumulated depreciation is €69,000.", [E.assets], "medium",
  "Book the independent schedule estimate of €24,000 period depreciation.",
  "Independent review accepts €24,000 as the only supported estimate but notes that detailed useful lives and residual values are absent.",
  "The opening asset base and additions were in use. The available schedule is more reliable than management's zero booking, but confidence is reduced by missing detail.",
  { profit: -24000, cash: 0, assets: -24000, liabilities: 0, equity: -24000 });
material("D057", "Write off the €18,000 R-17 receivable as bad-debt expense.", [E.contracts, E.messages, E.subsequent], "high",
  "Recognize a full €18,000 loss because no recovery is expected.",
  "Independent review agrees that the 3 September notice is an adjusting event confirming insolvency at 31 August.",
  "The balance was impaired at the reporting date and must not remain in closing receivables.",
  { profit: -18000, cash: 0, assets: -18000, liabilities: 0, equity: -18000 });
material("D058", "Write off €22,000 damaged stock; do not include it in recoverable inventory.", [E.warehouse, E.messages, E.subsequent], "high",
  "Reduce inventory by the full carrying value of the unsaleable basement stock.",
  "Independent review agrees with the full write-off and separately flags the €2,000 disposal quote as a future cash risk.",
  "Physical existence does not establish recoverable value. Independent evidence says the goods cannot be sold.",
  { profit: -22000, cash: 0, assets: -22000, liabilities: 0, equity: -22000 });
material("D059", "Recognize a €25,000 legal provision and expense.", [E.loans, E.messages, E.subsequent], "high",
  "Use external counsel's best estimate for the probable employee claim.",
  "Independent review agrees: probability and a measurable best estimate meet the recognition threshold at 31 August.",
  "The post-takeover confirmation describes a condition already present at the reporting date, so the accounts require adjustment.",
  { profit: -25000, cash: 0, assets: 0, liabilities: 25000, equity: -25000 });

operational("D060", "Recognize €0 insurance consumed because no policy, payment, prepaid balance or coverage period is supplied; flag as unresolved.", [E.bank, E.mgmt], "low");
operational("D061", "Classify €2,000 unpaid interest as accrued interest payable and include it in the €12,000 interest expense.", [E.loans, E.subsequent]);
operational("D062", "Classify €32,000 as closing payroll payable: €15,000 opening + €248,000 expense - €231,000 cash paid.", [E.payroll, E.bank]);
operational("D063", "Classify €126,000 as supplier payables for goods received before period end.", [E.purchases]);

material("D064", "Recognize €180,000 NorthStar revenue; fully collected.", [E.bank, E.contracts, E.crm], "high",
  "Recognize the accepted 12 February delivery as revenue.",
  "Independent review agrees that signed acceptance and matching bank cash establish completion and collectability.",
  "The goods were delivered and accepted before period end, so the performance obligation was satisfied.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D065", "Recognize €200,000 Freedom revenue; €142,000 collected and €58,000 receivable.", [E.bank, E.contracts, E.crm], "high",
  "Recognize the full accepted contract value and retain the unpaid balance in AR.",
  "Independent review agrees that partial collection does not cap revenue once delivery and acceptance occurred.",
  "Acceptance on 18 March supports full revenue recognition, with the unpaid portion presented as receivable.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D066", "Recognize €100,000 Phoenix event revenue; €70,000 collected and €30,000 receivable.", [E.bank, E.contracts, E.crm], "medium",
  "Recognize the completed 29 April event in full.",
  "Independent review agrees but assigns medium rather than high confidence because final acceptance is an email rather than a signed page.",
  "Completion evidence and customer acceptance are sufficient, while the weaker document form is reflected in confidence.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D067", "Recognize €120,000 Liberty revenue; €95,000 collected and €25,000 receivable.", [E.bank, E.contracts, E.crm], "high",
  "Recognize the delivered mixed order in full.",
  "Independent review agrees because the customer explicitly accepted the order in full despite the glitter complaint.",
  "Delivery and acceptance on 20 June satisfy revenue recognition; the complaint does not create a return or price concession.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });
material("D068", "Defer €90,000 of undelivered September events as contract liabilities.", [E.bank, E.contracts, E.messages], "high",
  "Exclude both September events from August revenue.",
  "Independent review agrees: neither goods nor services had been delivered by 31 August.",
  "The deposits fund future obligations and therefore remain liabilities until September performance.",
  { profit: -90000, cash: 0, assets: 0, liabilities: 90000, equity: -90000 });

operational("D069", "Classify the €19,000 loan principal payment as financing cash outflow and reduction of debt, not expense.", [E.bank, E.loans]);
operational("D070", "Classify the €80,000 equipment purchases as investing cash outflow and PPE additions.", [E.bank, E.purchases, E.assets]);

material("D071", "Estimate the closing bad-debt write-off at €18,000, leaving net receivables of €168,000.", [E.contracts, E.crm, E.subsequent], "high",
  "Write off the full R-17 balance because expected recovery is zero.",
  "Independent review agrees that the liquidator notice provides a specific, customer-level loss estimate rather than a general allowance.",
  "The notice confirms insolvency at period end and supports a 100% loss on the identified €18,000 balance.",
  { profit: -18000, cash: 0, assets: -18000, liabilities: 0, equity: -18000 });
material("D072", "Estimate the damaged-inventory write-off at €22,000.", [E.warehouse, E.subsequent], "high",
  "Write down the entire carrying value of the wet stock to zero.",
  "Independent review agrees on €22,000 and notes a separate €2,000 disposal-cost uncertainty.",
  "The goods have no saleable value, so their full carrying amount is unrecoverable.",
  { profit: -22000, cash: 0, assets: -22000, liabilities: 0, equity: -22000 });
material("D073", "Estimate the legal provision at counsel's €25,000 best estimate.", [E.loans, E.subsequent], "high",
  "Recognize €25,000 within the externally stated €20,000-€30,000 range.",
  "Independent review agrees that the best estimate is more supportable than either endpoint of the range.",
  "External counsel assessed the claim as probable and supplied a specific midpoint best estimate at the reporting date.",
  { profit: -25000, cash: 0, assets: 0, liabilities: 25000, equity: -25000 });
material("D074", "Estimate period depreciation at €24,000.", [E.assets], "medium",
  "Use the independent schedule estimate and add it to opening accumulated depreciation.",
  "Independent review agrees provisionally but lowers confidence because asset-level useful lives and residual values were not supplied.",
  "€24,000 is the only non-management estimate and is preferable to zero; the missing detailed schedule remains an uncertainty.",
  { profit: -24000, cash: 0, assets: -24000, liabilities: 0, equity: -24000 });
material("D075", "Estimate closing inventory at €121,000 after the €22,000 write-off; disclose a €112,000 alternative.", [E.warehouse, E.purchases], "medium",
  "Use the reporting-date physical count: €79,000 Finally Single + €42,000 Never Call Back = €121,000 recoverable inventory.",
  "Independent analysis uses the stated €405,000 consumption record: €80,000 opening + €459,000 purchases - €405,000 consumption - €22,000 write-off = €112,000.",
  "The direct 31 August count is the strongest evidence of stock on hand. It implies €396,000 product COGS and a €9,000 correction to the consumption record. The alternative is shown as sensitivity.",
  { profit: 9000, cash: 0, assets: 9000, liabilities: 0, equity: 9000 });

operational("D076", "Closing gross receivables are €186,000; after the €18,000 R-17 write-off, net receivables are €168,000.", [E.crm, E.contracts, E.subsequent]);
operational("D077", "Expense the full €10,000 repair; improvement amount is €0 because the work did not increase capacity or useful life.", [E.purchases, E.assets]);
operational("D078", "Insurance expense is €0 on supplied evidence. No reliable estimate can be made without a policy, payment or coverage period.", [E.bank, E.mgmt], "low");
operational("D079", "Interest payable is €2,000: €12,000 expense less €10,000 paid.", [E.loans, E.subsequent]);
operational("D080", "Accrued payroll is €32,000: €15,000 opening payable + €248,000 expense - €231,000 paid.", [E.payroll, E.bank]);
operational("D081", "Customer deposit liability is €90,000 for the two September events.", [E.bank, E.contracts]);
operational("D082", "Closing PPE cost is €260,000: €180,000 opening cost + €80,000 equipment additions.", [E.assets, E.purchases]);
operational("D083", "Closing accumulated depreciation is €69,000: €45,000 opening + €24,000 period depreciation.", [E.assets]);
operational("D084", "Closing supplier payable is €126,000, independently confirmed for goods received before 31 August.", [E.purchases]);
operational("D085", "Closing loan principal is €131,000: €100,000 opening + €50,000 advance - €19,000 repayment.", [E.loans, E.subsequent]);
operational("D086", "Physical product COGS is €396,000 on the count-based final case. The direct consumption record gives €405,000 and is retained as a €9,000 sensitivity.", [E.warehouse, E.purchases], "medium");
operational("D087", "Service direct payroll is €80,000; €75,000 was paid and €5,000 remains in payroll payable.", [E.payroll]);
operational("D088", "Owner distributions are €110,000: €70,000 villa deposit + €40,000 other owner-card spending.", [E.bank, E.loans]);
operational("D089", "Corrected net profit is €74,000 under the count-based inventory conclusion; the consumption-record alternative is €65,000.", [E.warehouse, E.payroll, E.assets, E.subsequent], "medium");
operational("D090", "Closing cash is €60,000 and agrees to both the bank export and cash-flow roll-forward.", [E.bank, E.subsequent]);

material("D091", "Approve only the corrected €74,000-profit accounts, subject to explicit disclosure of the €9,000 inventory sensitivity and missing insurance evidence.", [E.mgmt, E.bank, E.subsequent], "medium",
  "Approve the corrected accounts, not management's unreconciled version.",
  "Independent review agrees accounts must be corrected before valuation but prefers the €65,000 profit case because it relies on the stated consumption record.",
  "The corrected statements reconcile and remove unsupported revenue, income and personal expenses. The inventory conflict remains material enough to disclose before valuation.",
  { profit: 0, cash: 0, assets: 0, liabilities: 0, equity: 0 });

operational("D092", "Yes. Freeze owner-card access immediately and require documented business purpose and approval for all future spending.", [E.bank, E.loans, E.messages]);
operational("D093", "Yes. Move the full €90,000 September receipts to contract liabilities until delivery.", [E.bank, E.contracts]);
operational("D094", "Yes. Begin a weekly 13-week cash forecast; closing cash is only €60,000 against significant current liabilities.", [E.bank, E.subsequent]);
operational("D095", "Yes. Stop new credit sales to insolvent or high-risk customers pending credit approval and collection controls.", [E.contracts, E.subsequent]);
operational("D096", "Yes. Segregate and dispose of the damaged stock; retain the €2,000 disposal quote for cash planning and approval.", [E.warehouse, E.subsequent]);
operational("D097", "Yes. Investigate management override, duplicate source files and unsupported reclassifications; preserve the audit trail.", [E.mgmt, E.messages, E.board]);
operational("D098", "Yes. Renegotiate supplier terms and reconcile opening/current allocations, especially the Event supplier payment.", [E.bank, E.purchases]);
operational("D099", "Yes, continue the core Finally Single and event operations with tightened credit, inventory and cash controls; reassess Never Call Back customer quality.", [E.crm, E.contracts, E.warehouse]);
material("D100", "No. Do not use management's €312,000 profit for the earn-out; use corrected profit of €74,000, with €65,000 shown as the inventory sensitivity.", [E.mgmt, E.bank, E.warehouse, E.subsequent], "high",
  "Reject the management profit because it includes future revenue and borrowing income and omits material adjustments.",
  "Independent review also rejects €312,000 but supports a lower €65,000 corrected profit based on the explicit €405,000 consumption record.",
  "Management profit is overstated by €238,000 in the selected case and was produced under documented pressure. Valuation must use reconciled accounts and the disclosed sensitivity.",
  { profit: -238000, cash: 0, assets: null, liabilities: null, equity: -238000 });

const decisions = template.decisions.map((decision) => {
  const override = overrides.get(decision.id);
  if (!override) throw new Error(`Missing decision override: ${decision.id}`);
  return {
    ...decision,
    ...override,
    agentDisagreement: ["D048", "D075", "D091", "D100"].includes(decision.id)
  };
});

const submission = {
  schemaVersion: "1.0",
  caseId: "DPI-HT-01",
  student: { id: "nk25004", name: "Nils Kosenčuks" },
  reportingDate: "2026-08-31",
  currency: "EUR",
  basis: {
    finalCase: "Count-based inventory case",
    statementEffectConvention: "Each material decision shows the signed correction from management's stated or implied treatment. Classification and estimation decisions can describe the same underlying adjustment and must not be summed.",
    evidenceHierarchy: ["Bank and signed contracts", "Third-party confirmations and invoices", "Warehouse and delivery records", "Internal operations", "Management spreadsheets", "Messages and unsupported claims"]
  },
  evidence: [
    { id: "E00", file: "00 BOARD ORDER READ FIRST.pdf", type: "case scope", reliability: "high", finding: "Reporting date, currency and evidence hierarchy." },
    { id: "E01", file: "01 USE THIS NUMBERS FINAL v9.xlsx", type: "management workbook", reliability: "low", finding: "Claims €312,000 profit and includes unsupported treatments." },
    { id: "E02", file: "02 Bank Export August.csv", type: "bank record", reliability: "high", finding: "Complete €80,000-to-€60,000 cash roll-forward." },
    { id: "E03", file: "03 CRM Export Cleaned FINAL.xlsx", type: "internal operations", reliability: "medium", finding: "Revenue, collections and open customer balances." },
    { id: "E04", file: "04 Contracts Returns and Angry Customers.pdf", type: "contracts and acceptance", reliability: "high", finding: "€600,000 named delivered revenue, €90,000 future deposits and €18,000 insolvent customer." },
    { id: "E05", file: "05 Warehouse Count Marta Notes.pdf", type: "physical count", reliability: "high", finding: "€143,000 gross count, €22,000 damaged layer and conflicting €405,000 consumption record." },
    { id: "E06", file: "06 Purchases Invoices and Goods Received.pdf", type: "supplier evidence", reliability: "high", finding: "€459,000 purchases, €126,000 AP, €80,000 equipment and €10,000 repair." },
    { id: "E07", file: "07 Payroll Bonuses Contractors NEW.xlsx", type: "payroll schedule", reliability: "medium", finding: "€248,000 expense, €231,000 cash paid and departmental classification." },
    { id: "E08", file: "08 Assets Repairs Leases Maybe.xlsx", type: "asset register", reliability: "medium", finding: "Opening PPE, additions and €24,000 independent depreciation estimate." },
    { id: "E09", file: "09 Loans Owner Card and Legal Problems.pdf", type: "bank, owner and counsel evidence", reliability: "high", finding: "Debt, interest, €110,000 personal spending and €25,000 probable claim." },
    { id: "E10", file: "10 Email and WhatsApp Dump DO NOT FORWARD.pdf", type: "messages", reliability: "low", finding: "Corroborates management override and contains ignored prompt injection." },
    { id: "E11", file: "11 Evidence Received After Takeover.pdf", type: "subsequent confirmations", reliability: "high", finding: "Adjusting evidence for bad debt, legal claim, stock condition, cash, loan and interest." }
  ],
  decisions,
  schedules: {
    revenueAndReceivables: {
      recognizedRevenue: 960000,
      collectionsAgainstCurrentRevenue: 774000,
      closingGrossReceivables: 186000,
      badDebtWriteOff: 18000,
      closingNetReceivables: 168000,
      openingReceivableCollected: 35000,
      customerDepositsCollected: 90000
    },
    inventoryAndCogs: {
      selectedCase: { openingInventory: 80000, purchases: 459000, productCogs: 396000, grossPhysicalCount: 143000, damagedStockWriteOff: 22000, closingInventory: 121000 },
      sensitivityCase: { openingInventory: 80000, purchases: 459000, productCogs: 405000, damagedStockWriteOff: 22000, closingInventory: 112000 },
      unresolvedDifference: 9000
    },
    payroll: { openingPayable: 15000, expense: 248000, cashPaid: 231000, closingPayable: 32000, eventDirect: 80000, sales: 72000, office: 96000 },
    operatingExpenses: { salesPayroll: 72000, officePayroll: 96000, rent: 48000, marketing: 55000, software: 16000, utilities: 12000, repairs: 10000, depreciation: 24000, badDebt: 18000, damagedStock: 22000, legalProvision: 25000, insurance: 0 },
    ppeAndDepreciation: { openingCost: 180000, additions: 80000, closingCost: 260000, openingAccumulatedDepreciation: 45000, periodDepreciation: 24000, closingAccumulatedDepreciation: 69000, closingNetPpe: 191000 },
    debtAndInterest: { openingPrincipal: 100000, newBorrowing: 50000, principalRepaid: 19000, closingPrincipal: 131000, interestExpense: 12000, interestPaid: 10000, interestPayable: 2000 },
    equityAndDistributions: { openingEquity: 170000, netProfit: 74000, distributions: 110000, closingEquity: 134000 }
  },
  statements: {
    profitAndLoss: {
      revenue: 960000,
      physicalProductCogs: -396000,
      serviceDirectPayroll: -80000,
      grossProfit: 484000,
      salesPayroll: -72000,
      officePayroll: -96000,
      rent: -48000,
      marketing: -55000,
      software: -16000,
      utilities: -12000,
      repairs: -10000,
      depreciation: -24000,
      badDebt: -18000,
      damagedStockWriteOff: -22000,
      legalProvision: -25000,
      operatingProfit: 86000,
      interestExpense: -12000,
      netProfit: 74000
    },
    cashFlow: {
      openingCash: 80000,
      customerReceiptsIncludingDeposits: 899000,
      supplierPayments: -378000,
      payrollPaid: -231000,
      otherOperatingPayments: -141000,
      interestPaid: -10000,
      netOperatingCashFlow: 139000,
      equipmentPurchases: -80000,
      netInvestingCashFlow: -80000,
      newBorrowing: 50000,
      principalRepaid: -19000,
      ownerDistributions: -110000,
      netFinancingCashFlow: -79000,
      netCashChange: -20000,
      closingCash: 60000
    },
    balanceSheet: {
      assets: { cash: 60000, netReceivables: 168000, inventory: 121000, ppeCost: 260000, accumulatedDepreciation: -69000, netPpe: 191000, totalAssets: 540000 },
      liabilities: { supplierPayables: 126000, payrollPayable: 32000, interestPayable: 2000, customerDeposits: 90000, legalProvision: 25000, bankLoan: 131000, totalLiabilities: 406000 },
      equity: { openingEquity: 170000, netProfit: 74000, distributions: -110000, closingEquity: 134000 },
      totalLiabilitiesAndEquity: 540000
    }
  },
  reconciliations: [
    { id: "R01", name: "Balance sheet", calculation: "€540,000 assets - €540,000 liabilities and equity", difference: 0, status: "pass" },
    { id: "R02", name: "Cash roll-forward", calculation: "€80,000 + €139,000 - €80,000 - €79,000", result: 60000, control: 60000, difference: 0, status: "pass" },
    { id: "R03", name: "Revenue and gross receivables", calculation: "€960,000 revenue - €774,000 current-sale collections", result: 186000, control: 186000, difference: 0, status: "pass" },
    { id: "R04", name: "Inventory selected case", calculation: "€80,000 + €459,000 - €396,000 - €22,000", result: 121000, control: 121000, difference: 0, status: "pass_with_uncertainty" },
    { id: "R05", name: "PPE net book value", calculation: "€260,000 cost - €69,000 accumulated depreciation", result: 191000, control: 191000, difference: 0, status: "pass" },
    { id: "R06", name: "Debt principal", calculation: "€100,000 + €50,000 - €19,000", result: 131000, control: 131000, difference: 0, status: "pass" },
    { id: "R07", name: "Interest", calculation: "€12,000 expense - €10,000 paid", result: 2000, control: 2000, difference: 0, status: "pass" },
    { id: "R08", name: "Equity roll-forward", calculation: "€170,000 + €74,000 - €110,000", result: 134000, control: 134000, difference: 0, status: "pass" }
  ],
  uncertainties: [
    { id: "U01", severity: "material", issue: "Inventory and product COGS", selectedTreatment: "Use the 31 August physical count: €121,000 closing inventory and €396,000 product COGS.", alternative: "Use the stated consumption record: €112,000 inventory, €405,000 COGS and €65,000 net profit.", impact: 9000, recommendation: "Recount source quantities and trace material issue records before valuation is final." },
    { id: "U02", severity: "low", issue: "Insurance", selectedTreatment: "Recognize €0 because no source evidence exists.", alternative: "Unknown expense or prepaid amount may exist.", impact: null, recommendation: "Obtain the policy, payment evidence and coverage dates." },
    { id: "U03", severity: "low", issue: "Depreciation detail", selectedTreatment: "Use the independent €24,000 estimate.", alternative: "Asset-level useful-life detail could change the estimate.", impact: null, recommendation: "Obtain the underlying depreciation schedule." },
    { id: "U04", severity: "low", issue: "Damaged stock disposal", selectedTreatment: "Write off €22,000 inventory; do not accrue the €2,000 quote without evidence of a present obligation.", alternative: "A later approved disposal will require cash.", impact: 2000, recommendation: "Include the quote in the 13-week cash forecast." }
  ],
  boardRecommendation: {
    decision: "Do not use management's €312,000 profit for the earn-out.",
    valuationBasis: "Use corrected net profit of €74,000 and present €65,000 as the inventory-record sensitivity until the €9,000 conflict is resolved.",
    continueOperations: "Continue Finally Single and event operations with stronger controls; review Never Call Back credit quality.",
    immediateActions: ["Freeze owner-card access", "Move €90,000 deposits to contract liabilities", "Start a 13-week cash forecast", "Stop unsecured sales to insolvent/high-risk customers", "Dispose of damaged stock under approval", "Investigate management override and duplicate sources", "Renegotiate supplier terms and reconcile opening AP"],
    rationale: "The bank-confirmed cash position is €60,000, corrected profit is far below management's claim, and management messages document deliberate pressure to misclassify future deposits, borrowing and personal spending."
  }
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(submission, null, 2)}\n`, "utf8");
console.log(`Wrote ${outputPath} with ${decisions.length} decisions.`);
