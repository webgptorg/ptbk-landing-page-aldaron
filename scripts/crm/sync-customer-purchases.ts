import { runTwentyCommerceSync } from '../../lib/crm/runTwentyCommerceSync';
if (!process.argv.includes('--apply') && !process.argv.includes('--dry-run')) {
    console.error('Explicit --apply is required. Use --setup to initialize the schema; --verify checks readback and replay.');
    process.exitCode = 1;
} else {
    runTwentyCommerceSync({setup:process.argv.includes('--setup'),verify:process.argv.includes('--verify'),dryRun:process.argv.includes('--dry-run')})
        .then((summary) => console.log('TWENTY_COMMERCE_SYNC_RESULT',JSON.stringify(summary)))
        .catch((error: unknown) => {
            const value = error as {code?:string;message?:string;status?:number};
            console.error('TWENTY_COMMERCE_SYNC_FAILED',JSON.stringify({code:value.code || (/^commerce_[a-z_]+$/.test(value.message || '') ? value.message : 'unexpected_error'),status:value.status}));
            process.exitCode = 1;
        });
}
