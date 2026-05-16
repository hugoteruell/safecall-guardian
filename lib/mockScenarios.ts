import { Scenario } from './types';

export const SCENARIOS: Record<string, Scenario> = {
  fake_son: {
    id: 'fake_son',
    message: {
      text: "Mom, dropped my phone in water. This is my new number. Can you send $4,800 to this Zelle right now? It's an emergency. Please don't tell Dad.",
      from: '+1 (415) 555-0142',
      channel: 'sms',
    },
    score: 92,
    riskLevel: 'critical',
    signals: [
      { id: 's1', label: 'Urgency pressure', description: 'Message demands immediate action to bypass careful thinking.', severity: 'critical' },
      { id: 's2', label: 'Money request', description: 'Asks for $4,800 via Zelle — an irreversible payment method.', severity: 'critical' },
      { id: 's3', label: 'Unknown number', description: 'Sender claims to be family but writes from a new, unverified number.', severity: 'critical' },
      { id: 's4', label: 'Secrecy request', description: '"Please don\'t tell Dad" — a classic tactic to prevent verification.', severity: 'critical' },
      { id: 's5', label: 'Family impersonation', description: 'Pretends to be your son Peter, but the writing pattern does not match.', severity: 'critical' },
    ],
    evidence: [
      { id: 'e1', source: 'scamadviser.com', finding: 'This number appears in 47 scam reports in the last 30 days.', type: 'web_scrape' },
      { id: 'e2', source: 'Your family contacts', finding: "Your son Peter is registered with number (650) 555-9988 — this is a different number.", type: 'family_memory' },
    ],
    empathicResponse:
      "Take a breath. This doesn't sound like Peter. Scammers create urgency to stop you from checking. Before sending any money, let's verify another way.",
    actions: [
      { id: 'a1', label: "Call Peter's real number", primary: true, icon: 'Phone' },
      { id: 'a2', label: 'Tell Ana (your daughter)', primary: false, icon: 'MessageCircle' },
      { id: 'a3', label: 'Save evidence', primary: false, icon: 'Shield' },
    ],
    agentTrace: {
      analyzer: 'Detected 5 high-risk signals: urgency, money request, new number, secrecy, impersonation.',
      investigator: "Searched scamadviser.com and your family contacts. Found 47 scam reports for this number. Confirmed Peter's real number is different.",
      guardian: "Composing a calm, warm response. Suggesting safe verification through Peter's real number.",
    },
  },

  fake_bank: {
    id: 'fake_bank',
    message: {
      text: "Ma'am, this is Daniel from Bank of America fraud department. We detected a $2,300 suspicious transaction. To cancel it now, I need you to confirm the last 4 digits of your card via SMS.",
      from: '+1 (888) 555-0177',
      channel: 'call',
    },
    score: 88,
    riskLevel: 'critical',
    signals: [
      { id: 's1', label: 'Bank impersonation', description: 'Caller claims to represent Bank of America fraud department.', severity: 'critical' },
      { id: 's2', label: 'Urgency pressure', description: 'Demands immediate action to "cancel" a suspicious transaction.', severity: 'critical' },
      { id: 's3', label: 'Credential request', description: 'Asks for card digits — real banks never request this by phone.', severity: 'critical' },
    ],
    evidence: [
      { id: 'e1', source: 'bankofamerica.com/security', finding: 'Bank of America NEVER asks for card credentials by phone. Official security policy.', type: 'official_policy' },
      { id: 'e2', source: 'scamadviser.com', finding: 'This number has been reported 23 times as a fake bank caller.', type: 'web_scrape' },
    ],
    empathicResponse:
      "Real banks never ask for this. Don't call back. Don't click any link they sent. If you want to check your account, call the number on the back of your card yourself.",
    actions: [
      { id: 'a1', label: 'See how to call your real bank', primary: true, icon: 'Phone' },
      { id: 'a2', label: 'Tell Ana (your daughter)', primary: false, icon: 'MessageCircle' },
      { id: 'a3', label: 'Save evidence', primary: false, icon: 'Shield' },
    ],
    agentTrace: {
      analyzer: 'Detected 3 critical signals: bank impersonation, urgency, credential request.',
      investigator: "Verified Bank of America's official policy on bankofamerica.com/security. Found 23 scam reports for caller number.",
      guardian: 'Composing reassuring response. Redirecting user to safe verification via the card-back number.',
    },
    callScript: [
      { atMs: 400, text: "Hello ma'am, this is Daniel from Bank of America fraud department." },
      { atMs: 3200, text: "We detected a $2,300 suspicious charge on your card a moment ago." },
      { atMs: 5800, text: 'To cancel it, I just need the last 4 digits of your card. Quickly please.' },
    ],
  },

  legitimate: {
    id: 'legitimate',
    message: {
      text: 'Hi mom, how was your day? Want to grab dinner tomorrow? I can pick you up at 6.',
      from: '+1 (650) 555-9988',
      channel: 'sms',
    },
    score: 12,
    riskLevel: 'low',
    signals: [
      { id: 's1', label: 'Known contact', description: 'Number is registered in your family contacts as Peter (your son).', severity: 'low' },
      { id: 's2', label: 'Consistent pattern', description: 'Tone, vocabulary, and timing match previous conversations with Peter.', severity: 'low' },
      { id: 's3', label: 'No money request', description: 'Message contains no financial ask, no urgency, no suspicious link.', severity: 'low' },
    ],
    evidence: [
      { id: 'e1', source: 'Your family contacts', finding: "This is Peter (your son), registered on March 2024. You've exchanged 47 messages with this number.", type: 'family_memory' },
    ],
    empathicResponse: 'This looks like Peter checking in. No signs of concern. Have a nice dinner.',
    actions: [
      { id: 'a1', label: 'Reply to Peter', primary: true, icon: 'MessageCircle' },
      { id: 'a2', label: 'Mark as safe', primary: false, icon: 'Check' },
    ],
    agentTrace: {
      analyzer: 'No risk signals detected. Message pattern matches known contact.',
      investigator: 'Verified sender against your family contacts. Confirmed identity: Peter, your son.',
      guardian: 'No action needed. Composing a calm confirmation that this is safe.',
    },
  },
};
