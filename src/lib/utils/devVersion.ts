// Development version utility
// Pattern: ddmmyyhhmm

import { BUILD_VERSION } from './buildVersion';

export function getDevVersion(): string {
    // Use build-time generated version from buildVersion.ts
    return BUILD_VERSION;
}