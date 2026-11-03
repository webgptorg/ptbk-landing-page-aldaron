import { createContactNoticeFields } from '@/lib/contacts/contactSubmissionPolicy';
import { sendJson } from '@/lib/api/requestJson';
import { COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH } from './communityMembershipConfig';
import type {
    CommunityMembershipRegistrationRequest,
    CommunityMembershipRegistrationResult,
} from './communityMembershipRegistration';

export function submitCommunityMembershipRegistration(
    registrationRequest: CommunityMembershipRegistrationRequest,
): Promise<CommunityMembershipRegistrationResult> {
    return sendJson<CommunityMembershipRegistrationResult>(
        COMMUNITY_MEMBERSHIP_REGISTRATION_API_PATH,
        'POST',
        { ...registrationRequest, ...createContactNoticeFields() },
    );
}
