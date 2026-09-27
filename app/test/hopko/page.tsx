import { HOPKO_METADATA } from './hopkoMetadata';
import { HopkoExperiment } from './HopkoExperiment';

export const metadata = HOPKO_METADATA;

export default function HopkoRoute() {
    return <HopkoExperiment />;
}
