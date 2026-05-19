-- TABLE 1
CREATE TABLE IF NOT EXISTS session_1_finance_questions (
  id             SERIAL PRIMARY KEY,
  question_text  TEXT NOT NULL,
  option_a       TEXT NOT NULL,
  option_b       TEXT NOT NULL,
  option_c       TEXT NOT NULL,
  option_d       TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 2
CREATE TABLE IF NOT EXISTS session_1_finance_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score        INT
);

-- TABLE 3
CREATE TABLE IF NOT EXISTS session_1_finance_answers (
  id              SERIAL PRIMARY KEY,
  session_id      UUID REFERENCES session_1_finance_sessions(id),
  question_id     INT  REFERENCES session_1_finance_questions(id),
  selected_option CHAR(1),
  is_correct      BOOLEAN,
  answered_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE session_1_finance_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_1_finance_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_1_finance_answers   ENABLE ROW LEVEL SECURITY;

-- Permissive policies for anon key
CREATE POLICY "anon_all_questions" ON session_1_finance_questions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_sessions"  ON session_1_finance_sessions  FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_answers"   ON session_1_finance_answers   FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- DOUBLE DEGREE QUIZ — sessions & answers tables
-- (question bank already exists as session_1_doble_grado)
-- ============================================================

CREATE TABLE IF NOT EXISTS session_1_doble_grado_sessions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  started_at   TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  score        INT
);

CREATE TABLE IF NOT EXISTS session_1_doble_grado_answers (
  id              SERIAL PRIMARY KEY,
  session_id      UUID REFERENCES session_1_doble_grado_sessions(id),
  question_id     INT  REFERENCES session_1_doble_grado(id),
  selected_option CHAR(1),
  is_correct      BOOLEAN,
  answered_at     TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE session_1_doble_grado_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_1_doble_grado_answers  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all_dd_sessions" ON session_1_doble_grado_sessions FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_dd_answers"  ON session_1_doble_grado_answers  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================
-- SEED DATA (correct_option always 'A' in DB — shuffling happens in app)
INSERT INTO session_1_finance_questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES
('According to the instructor, what percentage of M&A deals globally destroy value?', 'Around 70%', 'Around 50%', 'Around 30%', 'Around 90%', 'A'),
('What did the instructor say is the fundamental accounting equation?', 'Assets = Debt + Equity', 'Equity = Assets – Liabilities', 'Revenue = Costs + Profit', 'Assets = Revenue – Expenses', 'A'),
('According to the instructor, where do interest payments to the bank appear in the financial statements?', 'In the profit and loss account', 'In the balance sheet only', 'In the cash flow statement only', 'In the equity section', 'A'),
('The instructor explained that when interest rates go up, the price of a bond goes in which direction?', 'Down', 'Up', 'Stays the same', 'It depends on the issuer', 'A'),
('According to the instructor, why is the interest rate in the denominator of the valuation formula significant?', 'Because when the interest rate goes up, the present value goes down', 'Because when the interest rate goes up, the present value goes up', 'Because it makes the numerator larger', 'Because it removes inflation from the calculation', 'A'),
('What did the instructor say shareholders receive as remuneration from a company?', 'Dividends', 'Interest payments', 'Salary', 'Bond coupons', 'A'),
('According to the instructor, who gets paid first — the debt holder or the equity holder?', 'The debt holder', 'The equity holder', 'They are paid simultaneously', 'It depends on the company''s articles of association', 'A'),
('The instructor described return on equity as which formula?', 'Return divided by equity', 'Revenue divided by equity', 'Net profit divided by total assets', 'Earnings before interest divided by equity', 'A'),
('What does the instructor say is the difference between a workshop and a masterclass?', 'In a workshop you work and engage; in a masterclass the instructor talks', 'A masterclass has more participants than a workshop', 'A workshop is shorter than a masterclass', 'A masterclass focuses on soft skills; a workshop on hard skills', 'A'),
('What did the instructor say is the role of central banks as an external factor in the financial cycle?', 'They regulate interest rates which affect the value of things', 'They issue corporate bonds on behalf of companies', 'They provide venture capital to startups', 'They control dividend payments to shareholders', 'A'),
('According to the instructor, what is leverage in financial terms?', 'The ratio of debt to equity', 'The ratio of revenue to costs', 'The amount of dividends paid to shareholders', 'The difference between gross and net profit', 'A'),
('The instructor said that private equity operates across which stages of a company''s lifecycle?', 'From creation to decline — the entire range', 'Only in the growth and maturity stages', 'Only at the inception stage', 'Only at the decline and restructuring stage', 'A'),
('According to the instructor, which type of private equity invests in companies at the very beginning — even before a product exists?', 'Venture capital', 'Growth equity', 'Leveraged buyout (LBO)', 'Family office', 'A'),
('What did the instructor say is the main reason why approximately 70% of M&A deals destroy value?', 'The focus is on greed and agency risk rather than genuine value creation', 'Companies overpay for synergies that never materialise', 'Interest rates are always too high during acquisitions', 'Regulators block most integrations before they complete', 'A'),
('The instructor described agency risk as which of the following?', 'The fact that CEOs have goals that do not always match those of shareholders or other stakeholders', 'The risk that a bond issuer defaults on payments', 'The risk that exchange rates move against the investor', 'The risk that a company fails to complete an IPO', 'A'),
('According to the instructor, what is the Capital Asset Pricing Model used to calculate?', 'The cost of equity', 'The cost of debt', 'The book value of assets', 'The return on assets', 'A'),
('The instructor said the cost of equity formula includes which components?', 'Risk-free rate plus equity risk premium times the company''s volatility/beta', 'Interest rate minus inflation plus dividend yield', 'Net profit divided by total equity plus a risk buffer', 'Revenue growth rate plus the debt-to-equity ratio', 'A'),
('According to the instructor, why must the cost of equity always be higher than the cost of debt?', 'Because there is always more risk in equity than in debt', 'Because equity investors pay taxes and debt holders do not', 'Because equity dividends are paid before interest', 'Because regulators require it under IFRS rules', 'A'),
('What did the instructor say family offices typically do with their investments in terms of risk?', 'They invest in low-risk assets because their mandate is to preserve capital', 'They focus on high-risk venture capital investments', 'They specialise exclusively in leveraged buyouts', 'They only invest in government bonds', 'A'),
('According to the instructor, what is the difference between institutional and retail investors?', 'Institutional investors move and invest money for a living; retail investors are individuals', 'Retail investors have larger portfolios than institutional investors', 'Institutional investors only invest in bonds; retail investors only invest in equities', 'Retail investors are regulated; institutional investors are not', 'A'),
('The instructor named which three types of private equity that cover the full investment lifecycle?', 'Venture capital, growth equity, and leveraged buyout (LBO)', 'Angel investment, private debt, and family office', 'IPO, bond issuance, and rights issue', 'Hedge fund, pension fund, and sovereign wealth fund', 'A'),
('According to the instructor, what does an IPO require a company to do that private equity does not?', 'Produce quarterly results and communicate regularly with the market and investors', 'Pay higher dividends to shareholders every quarter', 'Register with the central bank before listing', 'Convert all debt into equity before going public', 'A'),
('What did the instructor say the equity risk premium represents?', 'The additional return equity has historically produced over and above debt', 'The insurance premium paid to protect equity investments', 'The tax advantage of equity over debt financing', 'The fee charged by investment banks for equity issuance', 'A'),
('The instructor used AstraZeneca as an example to illustrate which point?', 'That adjusted earnings per share can be twice as high as reported earnings per share', 'That pharmaceutical companies have the highest M&A success rates', 'That IFRS rules do not apply to listed companies', 'That central banks regulate pharmaceutical pricing', 'A'),
('According to the instructor, IFRS accounting standards are based on what, compared to US GAAP?', 'IFRS is based on principles, which allows more judgment; US GAAP is based on rules', 'IFRS is based on rules; US GAAP is based on principles', 'Both IFRS and US GAAP are based on the same set of principles', 'IFRS applies only to private companies; US GAAP applies to public companies', 'A'),
('The instructor explained that the value of an asset is calculated as what?', 'The future cash flows of the asset brought back to today using a discount rate', 'The historical cost of the asset minus accumulated depreciation', 'The market price of the asset on the day of valuation', 'The replacement cost of the asset adjusted for inflation', 'A'),
('According to the instructor, what does the discount rate used in valuation reflect?', 'Risk — because if a deposit offers 5%, anything riskier must offer more', 'The central bank''s official base rate at the time of the transaction', 'The company''s average dividend yield over the past five years', 'The inflation rate published by the government', 'A'),
('What did the instructor say banks do NOT tend to do in the early stages of a company''s lifecycle?', 'Banks do not tend to get involved in the beginning or creation phase', 'Banks refuse to work with companies in the growth phase', 'Banks only work with companies that already have an IPO', 'Banks avoid any company that uses private equity', 'A'),
('According to the instructor, what type of bank deals with corporate bond issuance?', 'Investment banking or corporate banking', 'Retail banking', 'Central banking', 'Private banking', 'A'),
('The instructor said that in a bond transaction, who bears the exchange rate risk?', 'The investor (e.g. the hedge fund or pension fund buying the bond)', 'The investment bank arranging the transaction', 'The corporate issuing the bond', 'The central bank of the issuing country', 'A'),
('According to the instructor, what is the Jensen and Meckling theory about?', 'That a manager can never have exactly the same interests as a shareholder', 'That M&A always creates value when managed correctly', 'That equity is always cheaper than debt in mature companies', 'That central banks should not interfere in corporate financing', 'A'),
('What did the instructor say was the typical investment timeline pressure for a private equity manager?', 'They have a fixed fund lifetime of typically 5 to 8 years to generate a return', 'They have no timeline pressure because they invest permanently', 'They must exit every investment within 12 months', 'They are required by regulators to hold investments for at least 10 years', 'A'),
('The instructor described how value is created in an M&A transaction through which two main mechanisms?', 'Synergies that increase revenue or reduce costs, leading to higher future cash flows', 'Paying a lower acquisition price and immediately reselling the target', 'Issuing new equity and buying back debt', 'Replacing management and changing the company''s accounting standards', 'A'),
('According to the instructor, what is the money flow when a pension fund buys a corporate bond?', 'The pension fund provides debt capital to the corporate through the capital markets, often via an investment bank', 'The pension fund provides equity directly to the corporate''s shareholders', 'The central bank intermediates the transaction and takes a fee', 'The retail bank collects the funds and passes them to the corporate as a loan', 'A'),
('According to the instructor, what does it mean when a company grows organically versus through M&A?', 'Organic growth is growth within the company''s existing capacity; M&A means growing beyond it by acquiring', 'Organic growth means issuing new equity; M&A means issuing new debt', 'Organic growth refers to agricultural businesses; M&A applies to industrial companies', 'Organic growth is funded by the government; M&A is funded by private investors', 'A'),
('The instructor mentioned that hedge funds typically operate with what kind of time bias?', 'Short-term, trying to make money over months rather than years', 'Long-term, holding positions for decades', 'Medium-term, with a fixed three-year investment horizon', 'They have no time preference and hold indefinitely', 'A'),
('According to the instructor, what is the core layer of financial participants?', 'Individual investors, investment banks, insurance companies, institutional investors, and ESG considerations', 'Central banks, governments, and retail banks', 'Family offices, pension funds, and sovereign wealth funds only', 'Auditors, accountants, and compliance officers', 'A'),
('The instructor mentioned which two sessions by name as dedicated topics in the course?', 'IPO (the next day) and private equity (the longest session)', 'Derivatives and commodities', 'Accounting and tax planning', 'Foreign exchange and interest rate swaps', 'A'),
('According to the instructor, what is the role of an investment bank when a company issues a bond?', 'It orchestrates the transaction and charges fees, connecting the corporate borrower to investors', 'It provides the capital itself from its own balance sheet permanently', 'It acts as the regulator ensuring the bond meets legal requirements', 'It purchases all the bonds and holds them to maturity', 'A'),
('What did the instructor say about the session format — how did he describe the 60/40 split?', '60% judgment and soft skills, 40% hard skills', '60% hard skills, 40% theory', '60% group work, 40% individual assessment', '60% lecture, 40% Q&A', 'A'),
('According to the instructor, what are the three main funding options discussed when a company wants to grow beyond its organic capacity?', 'Bond (debt), private equity, and IPO', 'Bank loan, venture capital, and retained earnings', 'Rights issue, convertible note, and preference shares', 'Government grant, angel investment, and crowdfunding', 'A'),
('The instructor said that venture capital is NOT compatible with which funding type for a company at inception stage?', 'IPO — because no one will give money for a company that has not yet produced a product', 'Bank loans — because banks only lend to profitable companies', 'LBO — because leveraged buyouts require existing debt on the balance sheet', 'Family office investment — because they only invest in listed companies', 'A'),
('According to the instructor, what happens to a company''s risk profile for shareholders when it adds more debt to its balance sheet?', 'Risk increases for the shareholder', 'Risk decreases for the shareholder because the company is better funded', 'Risk stays the same as debt and equity carry identical risk', 'Risk decreases because interest payments are tax deductible', 'A'),
('The instructor mentioned that private equity generates some of the highest salaries in finance due to what reason?', 'Because private equity managers operate under extremely high performance pressure with a fixed return target', 'Because private equity firms are not regulated and can pay whatever they want', 'Because private equity managers never face competition from other investors', 'Because private equity firms are owned by central banks', 'A'),
('What did the instructor say active listening means in a professional context?', 'Really paying attention to understand what is being said, without thinking about how difficult it is or worrying about your answer', 'Taking notes on everything said during a meeting', 'Repeating back what the speaker said word for word', 'Asking a question after every statement made by the speaker', 'A'),
('According to the instructor, what is the external layer of factors that influence the financial cycle?', 'Politicians, social interactions, and central banks', 'Investment banks, hedge funds, and pension funds', 'Auditors, accountants, and legal teams', 'Venture capital, private equity, and IPO markets', 'A'),
('The instructor described the PWC project in Greece as being focused on which activity?', 'M&A negotiation training, as Greece concentrates many corporate finance deals in Central Europe', 'IPO preparation for Greek government bonds', 'Venture capital fundraising for Greek technology startups', 'Central bank regulatory compliance training', 'A'),
('According to the instructor, what is the system or intermediate layer of financial participants?', 'Clients, auditors, accountants, and competition', 'Central banks, governments, and politicians', 'Venture capitalists, LBO funds, and growth equity', 'Retail investors, individual savers, and small businesses', 'A'),
('The instructor said that when a company wants to acquire a competitor, this relates to which part of the fundamental strategic equation?', 'Growing assets beyond organic capacity, requiring additional debt or equity funding', 'Reducing costs through operational restructuring without new funding', 'Paying down existing debt to free up equity on the balance sheet', 'Converting equity into debt to take advantage of low interest rates', 'A'),
('According to the instructor, what did Luca Pacioli contribute to finance and accounting?', 'The fundamental accounting equation: assets are funded by either debt or equity', 'The Capital Asset Pricing Model used to price equities', 'The first set of IFRS accounting standards adopted internationally', 'The concept of the equity risk premium used in valuation', 'A');
