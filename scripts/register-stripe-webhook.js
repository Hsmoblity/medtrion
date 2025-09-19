#!/usr/bin/env node
// Simple script to register a Stripe webhook endpoint using the Stripe REST API (no SDK required).
// Usage:
//   node scripts/register-stripe-webhook.js --key sk_test_... --url https://example.com/wp-json/wp-headless-stripe-session/v1/webhook --events checkout.session.completed,payment_intent.succeeded
// Or set env vars: STRIPE_SECRET_KEY and STRIPE_WEBHOOK_URL

const { argv, env } = process;

function parseArgs() {
    const out = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (a.startsWith('--')) {
            const k = a.replace(/^--/, '');
            const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
            out[k] = v;
        }
    }
    return out;
}

async function main() {
    const args = parseArgs();
    const stripeKey = args.key || env.STRIPE_SECRET_KEY;
    const webhookUrl = args.url || env.STRIPE_WEBHOOK_URL;
    const eventsArg = args.events || env.STRIPE_WEBHOOK_EVENTS || 'checkout.session.completed';

    if (!stripeKey) {
        console.error('Missing Stripe secret key. Provide with --key or STRIPE_SECRET_KEY env var.');
        process.exit(2);
    }
    if (!webhookUrl) {
        console.error('Missing webhook URL. Provide with --url or STRIPE_WEBHOOK_URL env var.');
        process.exit(2);
    }

    const events = eventsArg.split(',').map(s => s.trim()).filter(Boolean);

    // Build form-encoded body
    const params = new URLSearchParams();
    params.append('url', webhookUrl);
    params.append('api_version', '2024-04-10');
    for (const ev of events) params.append('enabled_events[]', ev);

    try {
        const res = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeKey}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error('Stripe API returned error:', data);
            process.exit(3);
        }

        console.log('Webhook created successfully:');
        console.log(JSON.stringify(data, null, 2));
        console.log('\nSave the signing secret ("secret") value to your WP plugin settings (stripe_webhook_secret).');
    } catch (err) {
        console.error('Request failed:', err);
        process.exit(4);
    }
}

main();
