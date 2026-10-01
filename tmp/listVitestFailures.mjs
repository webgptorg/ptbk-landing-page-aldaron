import { readFileSync } from 'node:fs';

const report = JSON.parse(readFileSync('tmp/vitest-report.json', 'utf8'));
const failedFiles = report.testResults.filter((testFile) => testFile.status !== 'passed');

for (const testFile of failedFiles) {
    console.log(testFile.name.split(/[\\/]/).slice(-3).join('/'));
    for (const assertion of testFile.assertionResults.filter((one) => one.status !== 'passed')) {
        console.log('    -', assertion.title);
    }
}
console.log(`\n${failedFiles.length} failed file(s)`);
