import {
    WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES,
    type WorkshopAdminParticipantSortBy,
} from '@/lib/workshops/workshopAdminParticipantQuery';
import { DEFAULT_WORKSHOP_REACTIONS, MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT } from '@/lib/workshops/workshopConstants';
import { WORKSHOP_KIND_VALUES } from '@/lib/workshops/workshopTypes';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-0.sql');
const MIGRATION_SQL = readFileSync(MIGRATION_PATH, 'utf8');
const MODERATION_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-1.sql');
const MODERATION_MIGRATION_SQL = readFileSync(MODERATION_MIGRATION_PATH, 'utf8');
const ANALYTICS_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-2.sql.done');
const ANALYTICS_MIGRATION_SQL = readFileSync(ANALYTICS_MIGRATION_PATH, 'utf8');
const WATCHING_AND_REPLY_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-3.sql');
const WATCHING_AND_REPLY_MIGRATION_SQL = readFileSync(WATCHING_AND_REPLY_MIGRATION_PATH, 'utf8');
const PINNED_COMMENT_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-4.sql');
const PINNED_COMMENT_MIGRATION_SQL = readFileSync(PINNED_COMMENT_MIGRATION_PATH, 'utf8');
const DISABLED_PANEL_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-5.sql');
const DISABLED_PANEL_MIGRATION_SQL = readFileSync(DISABLED_PANEL_MIGRATION_PATH, 'utf8');
const REACTION_ANIMATION_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-07-0040-workshop-page-6.sql');
const REACTION_ANIMATION_MIGRATION_SQL = readFileSync(REACTION_ANIMATION_MIGRATION_PATH, 'utf8');
const REACTION_COUNT_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0200-workshop-reaction-counts.sql',
);
const REACTION_COUNT_MIGRATION_SQL = readFileSync(REACTION_COUNT_MIGRATION_PATH, 'utf8');
const MULTIPLE_TERMS_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0100-online-workshop-multiple-terms.sql',
);
const MULTIPLE_TERMS_MIGRATION_SQL = readFileSync(MULTIPLE_TERMS_MIGRATION_PATH, 'utf8');
const ADMIN_ANALYTICS_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0300-workshop-admin-analytics.sql',
);
const ADMIN_ANALYTICS_MIGRATION_SQL = readFileSync(ADMIN_ANALYTICS_MIGRATION_PATH, 'utf8');
const COMMUNITY_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-08-0400-community.sql');
const COMMUNITY_MIGRATION_SQL = readFileSync(COMMUNITY_MIGRATION_PATH, 'utf8');
const PARTICIPANT_PAGE_ORDERING_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-0800-workshop-admin-participant-page-ordering.sql',
);
const PARTICIPANT_PAGE_ORDERING_MIGRATION_SQL = readFileSync(PARTICIPANT_PAGE_ORDERING_MIGRATION_PATH, 'utf8');
const MODERATOR_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-08-1000-workshop-moderators.sql');
const MODERATOR_MIGRATION_SQL = readFileSync(MODERATOR_MIGRATION_PATH, 'utf8');
const PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-1100-workshop-admin-participant-page-variable-conflict.sql',
);
const PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL = readFileSync(
    PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_PATH,
    'utf8',
);
const WRAP_UP_AND_FEEDBACK_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-1600-online-workshop-wrap-up-and-feedback.sql',
);
const WRAP_UP_AND_FEEDBACK_MIGRATION_SQL = readFileSync(WRAP_UP_AND_FEEDBACK_MIGRATION_PATH, 'utf8');
const SHORTCODE_MATERIAL_LINK_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-1700-online-workshop-shortcode-material-links.sql',
);
const SHORTCODE_MATERIAL_LINK_MIGRATION_SQL = readFileSync(SHORTCODE_MATERIAL_LINK_MIGRATION_PATH, 'utf8');
const SHORTCODE_CHAT_LINK_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-2500-online-workshop-chat-shortcode-links.sql',
);
const SHORTCODE_CHAT_LINK_MIGRATION_SQL = readFileSync(SHORTCODE_CHAT_LINK_MIGRATION_PATH, 'utf8');
const SHORTCODE_LINK_TITLE_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0700-workshop-shortcode-link-titles.sql',
);
const SHORTCODE_LINK_TITLE_MIGRATION_SQL = readFileSync(SHORTCODE_LINK_TITLE_MIGRATION_PATH, 'utf8');
const WORKSHOP_REPOSITORY_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0800-workshop-repository.sql',
);
const WORKSHOP_REPOSITORY_MIGRATION_SQL = readFileSync(WORKSHOP_REPOSITORY_MIGRATION_PATH, 'utf8');
const WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-1200-workshop-repository-multiple-branches.sql',
);
const WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL = readFileSync(
    WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_PATH,
    'utf8',
);
const COMMUNITY_POLL_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-08-2400-community-polls.sql');
const COMMUNITY_POLL_MIGRATION_SQL = readFileSync(COMMUNITY_POLL_MIGRATION_PATH, 'utf8');
const COMMUNITY_POLL_ADMINISTRATION_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-2600-community-poll-administration.sql',
);
const COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL = readFileSync(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_PATH, 'utf8');
const COMMUNITY_POLL_WORKSHOP_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-2900-community-poll-workshops.sql',
);
const COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL = readFileSync(COMMUNITY_POLL_WORKSHOP_MIGRATION_PATH, 'utf8');
const COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0120-community-poll-shared-email-votes.sql',
);
const COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL = readFileSync(
    COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_PATH,
    'utf8',
);
const COMMUNITY_PROJECT_MIGRATION_PATH = path.resolve(process.cwd(), 'migrations/2026-08-2800-community-projects.sql');
const COMMUNITY_PROJECT_MIGRATION_SQL = readFileSync(COMMUNITY_PROJECT_MIGRATION_PATH, 'utf8');
const COMMUNITY_PROJECT_BACKEND_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3000-community-project-backend-logic.sql',
);
const COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL = readFileSync(COMMUNITY_PROJECT_BACKEND_MIGRATION_PATH, 'utf8');
const COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3010-community-project-member-vote-deletion.sql',
);
const COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_SQL = readFileSync(
    COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_PATH,
    'utf8',
);
const ATTENDANCE_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3200-workshop-active-and-passive-attendance.sql',
);
const ATTENDANCE_MIGRATION_SQL = readFileSync(ATTENDANCE_MIGRATION_PATH, 'utf8');
const STAGE_COMMENT_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-08-3300-workshop-stage-comments.sql',
);
const STAGE_COMMENT_MIGRATION_SQL = readFileSync(STAGE_COMMENT_MIGRATION_PATH, 'utf8');
const PAID_MEMBERS_ONLY_CONTENT_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0200-workshop-content-paid-members-only.sql',
);
const PAID_MEMBERS_ONLY_CONTENT_MIGRATION_SQL = readFileSync(PAID_MEMBERS_ONLY_CONTENT_MIGRATION_PATH, 'utf8');
const PAID_MEMBERS_ONLY_VIDEO_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0300-workshop-paid-members-video-preview.sql',
);
const PAID_MEMBERS_ONLY_VIDEO_MIGRATION_SQL = readFileSync(PAID_MEMBERS_ONLY_VIDEO_MIGRATION_PATH, 'utf8');
const DUPLICATE_ATTACHED_POLLS_MIGRATION_PATH = path.resolve(
    process.cwd(),
    'migrations/2026-09-0900-workshop-duplicate-attached-polls.sql',
);
const DUPLICATE_ATTACHED_POLLS_MIGRATION_SQL = readFileSync(DUPLICATE_ATTACHED_POLLS_MIGRATION_PATH, 'utf8');

/**
 * The very same SQL on one line, so that a statement can be searched for without repeating how it happens to be wrapped.
 */
const PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_STATEMENTS = PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL.replace(
    /\s+/g,
    ' ',
);
const PARTICIPANT_PAGE_FUNCTION_SIGNATURES = [
    'uuid, text, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer',
    'uuid, text, boolean, boolean, boolean, timestamptz, timestamptz, text, text, integer, integer',
] as const;
const PARTICIPANT_PAGE_ROW_SOURCE = 'participant_page';
const WORKSHOP_TABLE_NAMES = [
    'workshops',
    'workshop_content_blocks',
    'workshop_participants',
    'workshop_comments',
    'workshop_comment_upvotes',
    'workshop_reactions',
] as const;

/**
 * Names the database column behind one sortable column of the participant administration.
 */
function getParticipantSortColumnName(sortBy: WorkshopAdminParticipantSortBy): string {
    return sortBy.replace(/[A-Z]/g, (upperCaseLetter) => `_${upperCaseLetter.toLowerCase()}`);
}

describe('workshop database migration', () => {
    it('creates every reusable workshop table', () => {
        WORKSHOP_TABLE_NAMES.forEach((tableName) => {
            expect(MIGRATION_SQL).toContain(`CREATE TABLE IF NOT EXISTS public.${tableName}`);
        });
    });

    it('forces RLS and removes browser roles from all workshop tables', () => {
        expect(MIGRATION_SQL).toContain('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY');
        expect(MIGRATION_SQL).toContain('REVOKE ALL ON TABLE public.%I FROM PUBLIC, anon, authenticated');
        expect(MIGRATION_SQL).toContain('GRANT ALL ON TABLE public.%I TO service_role');
    });

    it('records each participant action with a server timestamp and identity', () => {
        expect(MIGRATION_SQL).toMatch(/workshop_participants[\s\S]*connected_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(/workshop_comments[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/);
        expect(MIGRATION_SQL).toMatch(
            /workshop_comment_upvotes[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
        expect(MIGRATION_SQL).toMatch(
            /workshop_reactions[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
        expect(ANALYTICS_MIGRATION_SQL).toMatch(
            /workshop_content_link_clicks[\s\S]*participant_id uuid NOT NULL[\s\S]*created_at timestamptz NOT NULL DEFAULT now\(\)/,
        );
    });

    it('defaults chat messages to pending and atomically limits action bursts', () => {
        expect(MIGRATION_SQL).toContain("status text NOT NULL DEFAULT 'pending'");
        expect(MIGRATION_SQL).toContain('workshop_comments_enforce_rate_limit');
        expect(MIGRATION_SQL).toContain('workshop_reactions_enforce_rate_limit');
        expect(MIGRATION_SQL).toContain('pg_advisory_xact_lock');
    });

    it('keeps upvotes attributable and maintains their denormalized count in the database', () => {
        expect(MIGRATION_SQL).toContain(
            'CONSTRAINT workshop_comment_upvotes_one_per_participant UNIQUE (comment_id, participant_id)',
        );
        expect(MIGRATION_SQL).toContain('workshop_comment_upvotes_participant_fk');
        expect(MIGRATION_SQL).toContain('workshop_comment_upvotes_update_count');
        expect(MIGRATION_SQL).toContain('upvote_count = upvote_count + 1');
    });

    it('allows anonymous clients to receive workshop broadcasts but not author them', () => {
        const policyStart = MIGRATION_SQL.indexOf('CREATE POLICY workshop_broadcasts_are_receive_only');
        const policyEnd = MIGRATION_SQL.indexOf('INSERT INTO public.workshops', policyStart);
        const realtimePolicySql = MIGRATION_SQL.slice(policyStart, policyEnd);

        expect(realtimePolicySql).toContain('FOR SELECT');
        expect(realtimePolicySql).toContain('TO anon, authenticated');
        expect(realtimePolicySql).not.toContain('FOR INSERT');
    });

    it('marks artificial actions and participant interaction bans in the follow-up migration', () => {
        expect(MODERATION_MIGRATION_SQL).toContain('is_interaction_banned boolean NOT NULL DEFAULT false');
        expect(MODERATION_MIGRATION_SQL).toContain('is_artificial boolean NOT NULL DEFAULT false');
        expect(MODERATION_MIGRATION_SQL).toContain('artificial_upvote_count integer NOT NULL DEFAULT 0');
        expect(MODERATION_MIGRATION_SQL).toContain('ALTER COLUMN participant_id DROP NOT NULL');
        expect(MODERATION_MIGRATION_SQL).toContain('adjust_workshop_comment_artificial_upvotes');
        expect(MODERATION_MIGRATION_SQL).toContain('IF NEW.is_artificial THEN');
    });

    it('stores trusted moderation, active time, and material link clicks in the final migration', () => {
        expect(ANALYTICS_MIGRATION_SQL).toContain('is_trusted boolean NOT NULL DEFAULT false');
        expect(ANALYTICS_MIGRATION_SQL).toContain('active_duration_seconds integer NOT NULL DEFAULT 0');
        expect(ANALYTICS_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_content_link_clicks');
        expect(ANALYTICS_MIGRATION_SQL).toContain('record_workshop_participant_presence');
        expect(ANALYTICS_MIGRATION_SQL).toContain('get_workshop_participant_activity_totals');
    });

    it('indexes the participants seen recently so the watching count stays cheap', () => {
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'CREATE INDEX IF NOT EXISTS workshop_participants_watching_idx',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'public.workshop_participants (workshop_id, last_seen_at DESC)',
        );
    });

    it('answers a comment within the same workshop and keeps the chat one level deep', () => {
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS parent_comment_id uuid');
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshop_comments_parent_fk FOREIGN KEY (parent_comment_id, workshop_id)',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain(
            'REFERENCES public.workshop_comments(id, workshop_id) ON DELETE CASCADE',
        );
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('WORKSHOP_COMMENT_REPLY_TOO_DEEP');
        expect(WATCHING_AND_REPLY_MIGRATION_SQL).toContain('workshop_comments_enforce_reply_depth');
    });

    it('remembers a single pinned message per workshop and releases it with its message', () => {
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS pinned_comment_id uuid');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshops_pinned_comment_fk FOREIGN KEY (pinned_comment_id)',
        );
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('REFERENCES public.workshop_comments(id) ON DELETE SET NULL');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshops_pinned_comment_idx');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('WORKSHOP_PINNED_COMMENT_FOREIGN');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('workshops_enforce_pinned_comment_identity');
    });

    it('keeps one non-rejected question on a live stage without copying its comment body', () => {
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS stage_comment_id uuid');
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshops_stage_comment_fk FOREIGN KEY (stage_comment_id)',
        );
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('REFERENCES public.workshop_comments(id) ON DELETE SET NULL');
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshops_stage_comment_idx');
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('WORKSHOP_STAGE_COMMENT_INVALID');
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain("stage_comment.status <> 'rejected'");
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('workshop_comments_clear_rejected_stage_comment');
    });

    it('remembers the switched-off panels of a workshop and offers every other one without a backfill', () => {
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS disabled_panels text[] NOT NULL DEFAULT ARRAY[]::text[]',
        );
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('workshops_disabled_panels_keys');
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('cardinality(disabled_panels) <= 50');
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain("array_to_string(disabled_panels, ',')");

        // Note: Joining the array leaves a NULL element out instead of failing on it, so it is asked for on its own.
        expect(DISABLED_PANEL_MIGRATION_SQL).toContain('array_position(disabled_panels, NULL::text) IS NULL');
    });

    it('leaves room for every reaction which is celebrated its own way', () => {
        expect(REACTION_ANIMATION_MIGRATION_SQL).toContain('DROP CONSTRAINT IF EXISTS workshops_reactions_count');
        expect(REACTION_ANIMATION_MIGRATION_SQL).toContain(
            `CHECK (cardinality(allowed_reactions) BETWEEN 1 AND ${MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT})`,
        );
        expect(DEFAULT_WORKSHOP_REACTIONS.length).toBeLessThanOrEqual(MAXIMAL_WORKSHOP_ALLOWED_REACTION_COUNT);
        DEFAULT_WORKSHOP_REACTIONS.forEach((reaction) => {
            expect(REACTION_ANIMATION_MIGRATION_SQL).toContain(reaction);
        });
    });

    it('counts each reaction text efficiently and returns the new total with its stored action', () => {
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('workshop_reactions_emoji_count_idx');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('ON public.workshop_reactions (workshop_id, emoji)');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('get_workshop_reaction_counts');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('GROUP BY workshop_reaction.emoji');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('create_workshop_reaction');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('target_participant_id IS NULL');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('workshop-reaction-count:');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('pg_advisory_xact_lock');
        expect(REACTION_COUNT_MIGRATION_SQL).toContain('total_reaction_count');
    });

    it('indexes published terms by their start for the public term list and legacy-room fallback', () => {
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshops_published_starts_at_idx');
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('ON public.workshops (starts_at ASC)');
        expect(MULTIPLE_TERMS_MIGRATION_SQL).toContain('WHERE is_published');
    });

    it('keeps a pin out of the revision of the workshop the administration edits', () => {
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('set_workshop_updated_at_except_pin');
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain(
            "to_jsonb(NEW) - 'pinned_comment_id' - 'updated_at' = to_jsonb(OLD) - 'pinned_comment_id' - 'updated_at'",
        );
        expect(PINNED_COMMENT_MIGRATION_SQL).toContain('NEW.updated_at = OLD.updated_at');
    });

    it('keeps a live-stage selection out of the workshop settings revision too', () => {
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain("- 'stage_comment_id' - 'updated_at'");
        expect(STAGE_COMMENT_MIGRATION_SQL).toContain('NEW.updated_at = OLD.updated_at');
    });

    it('pages and orders a large workshop audience in the database while keeping timeline queries indexed', () => {
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('get_workshop_admin_participant_page');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('target_limit integer DEFAULT 50');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('target_offset integer DEFAULT 0');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('WORKSHOP_PARTICIPANT_SORT_INVALID');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_admin_filter_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_fullname_trigram_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_participants_email_trigram_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_comments_participant_timeline_idx');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('workshop_reactions_participant_timeline_idx');
    });

    it('orders that audience by columns which name their row source', () => {
        expect(PARTICIPANT_PAGE_ORDERING_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.get_workshop_admin_participant_page',
        );

        // Note: An unqualified name in the ordering could also mean the identically named `RETURNS TABLE` variable of
        //       the function, which PostgreSQL refuses as an ambiguous column reference before it returns a single row.
        WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES.forEach((sortBy) => {
            const sortColumnName = getParticipantSortColumnName(sortBy);
            expect(PARTICIPANT_PAGE_ORDERING_MIGRATION_SQL).toContain(
                `THEN ${PARTICIPANT_PAGE_ROW_SOURCE}.${sortColumnName}`,
            );
            expect(PARTICIPANT_PAGE_ORDERING_MIGRATION_SQL).not.toMatch(new RegExp(`THEN\\s+${sortColumnName}\\b`));
        });

        expect(PARTICIPANT_PAGE_ORDERING_MIGRATION_SQL).toContain(`${PARTICIPANT_PAGE_ROW_SOURCE}.id ASC`);
    });

    it('aggregates workshop actions into private time buckets for the administration', () => {
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('get_workshop_admin_timeline');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('date_bin(');
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'participant'::text AS event_kind");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'comment'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'reaction'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'upvote'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain("'link_click'::text");
        expect(ADMIN_ANALYTICS_MIGRATION_SQL).toContain('GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline');
    });

    it('remembers who moderates a room and lists them without scanning its whole audience', () => {
        expect(MODERATOR_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS is_moderator boolean NOT NULL DEFAULT false');
        expect(MODERATOR_MIGRATION_SQL).toContain('CREATE INDEX IF NOT EXISTS workshop_participants_moderator_idx');
        expect(MODERATOR_MIGRATION_SQL).toContain('WHERE is_moderator');
    });

    it('returns and filters the moderator in the paged participant administration, without a second overload', () => {
        // Note: An added parameter creates a new function instead of replacing the old one, so both would be offered
        //       to a request naming its arguments.
        expect(MODERATOR_MIGRATION_SQL).toContain('DROP FUNCTION IF EXISTS public.get_workshop_admin_participant_page');
        expect(MODERATOR_MIGRATION_SQL).toContain('target_is_moderator boolean DEFAULT NULL');
        expect(MODERATOR_MIGRATION_SQL).toContain(
            'AND (target_is_moderator IS NULL OR workshop_participant.is_moderator = target_is_moderator)',
        );
        expect(MODERATOR_MIGRATION_SQL).toContain('workshop_participant.is_moderator,');

        // Note: The ordering keeps naming its row source, exactly as the superseded function already had to.
        WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES.forEach((sortBy) => {
            const sortColumnName = getParticipantSortColumnName(sortBy);
            expect(MODERATOR_MIGRATION_SQL).toContain(`THEN ${PARTICIPANT_PAGE_ROW_SOURCE}.${sortColumnName}`);
            expect(MODERATOR_MIGRATION_SQL).not.toMatch(new RegExp(`THEN\\s+${sortColumnName}\\b`));
        });
    });

    it('settles the ambiguous participant ordering for the whole function, whatever the database still holds', () => {
        // Note: A database left with an older body of the function keeps refusing the very same query however well the
        //       migration files read, so this one decides the conflict for every line of it at once.
        expect(PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL).toContain('#variable_conflict use_column');
        expect(PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL).toContain(
            'CREATE FUNCTION public.get_workshop_admin_participant_page',
        );

        // Note: An older signature left behind would be offered to a request next to the new one.
        PARTICIPANT_PAGE_FUNCTION_SIGNATURES.forEach((functionSignature) => {
            expect(PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_STATEMENTS).toContain(
                `DROP FUNCTION IF EXISTS public.get_workshop_admin_participant_page( ${functionSignature} );`,
            );
        });

        WORKSHOP_ADMIN_PARTICIPANT_SORT_BY_VALUES.forEach((sortBy) => {
            const sortColumnName = getParticipantSortColumnName(sortBy);
            expect(PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL).toContain(
                `THEN ${PARTICIPANT_PAGE_ROW_SOURCE}.${sortColumnName}`,
            );
        });

        expect(PARTICIPANT_PAGE_VARIABLE_CONFLICT_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.get_workshop_admin_participant_page',
        );
    });

    it('keeps one persistent community separate from workshop occurrences', () => {
        expect(COMMUNITY_MIGRATION_SQL).toContain("ADD COLUMN IF NOT EXISTS room_kind text NOT NULL DEFAULT 'workshop'");
        expect(COMMUNITY_MIGRATION_SQL).toContain('workshops_room_kind');
        ['workshop', 'community'].forEach((workshopKind) =>
            expect(COMMUNITY_MIGRATION_SQL).toContain(`'${workshopKind}'`),
        );
        expect(WORKSHOP_KIND_VALUES).toContain('project');
        expect(COMMUNITY_MIGRATION_SQL).toContain('CREATE UNIQUE INDEX IF NOT EXISTS workshops_one_community_idx');
        expect(COMMUNITY_MIGRATION_SQL).toContain("WHERE room_kind = 'community'");
        expect(COMMUNITY_MIGRATION_SQL).toContain('workshops_community_slug');
        expect(COMMUNITY_MIGRATION_SQL).toContain("'komunita'");
    });

    it('keeps community poll choices attributable, anonymous to other members, and closed atomically', () => {
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_polls');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_poll_options');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_poll_votes');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain(
            'CONSTRAINT workshop_poll_votes_one_per_participant UNIQUE (poll_id, participant_id)',
        );
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('WORKSHOP_POLL_NOT_COMMUNITY');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('WORKSHOP_POLL_CLOSED');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('FOR SHARE');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('CREATE OR REPLACE FUNCTION public.create_community_workshop_poll');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.get_workshop_poll_option_vote_counts',
        );
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain('ALTER TABLE public.workshop_poll_votes FORCE ROW LEVEL SECURITY');
        expect(COMMUNITY_POLL_MIGRATION_SQL).toContain(
            'REVOKE ALL ON TABLE public.workshop_poll_votes FROM PUBLIC, anon, authenticated',
        );
    });

    it('lets administrators edit, hide, reopen, delete, and seed community polls without inventing a member vote', () => {
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true',
        );
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS artificial_vote_count integer NOT NULL DEFAULT 0',
        );
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.update_community_workshop_poll',
        );
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.adjust_community_workshop_poll_option_artificial_votes',
        );
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain('FOR UPDATE OF poll');
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain('FOR UPDATE OF poll_option');
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain('poll_is_closed OR NOT poll_is_visible');
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain('DELETE FROM public.workshop_poll_options');
        expect(COMMUNITY_POLL_ADMINISTRATION_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.update_community_workshop_poll',
        );
    });

    it('attaches a community poll to workshop occurrences without making it a second workshop-owned poll', () => {
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'CREATE TABLE IF NOT EXISTS public.workshop_poll_workshops',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain('PRIMARY KEY (poll_id, workshop_id)');
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.enforce_community_workshop_poll_attachment',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain("community.room_kind = 'community'");
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain("workshop.room_kind = 'workshop'");
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.write_community_workshop_poll_workshops',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'CREATE FUNCTION public.create_community_workshop_poll',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'CREATE FUNCTION public.update_community_workshop_poll',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'ALTER TABLE public.workshop_poll_workshops FORCE ROW LEVEL SECURITY',
        );
        expect(COMMUNITY_POLL_WORKSHOP_MIGRATION_SQL).toContain(
            'REVOKE ALL ON TABLE public.workshop_poll_workshops FROM PUBLIC, anon, authenticated',
        );
    });

    it('shares a community-poll vote by normalized e-mail across its attached workshops', () => {
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS voter_email text',
        );
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'PARTITION BY poll_id, voter_email',
        );
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'CONSTRAINT workshop_poll_votes_one_per_voter_email UNIQUE (poll_id, voter_email)',
        );
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'REFERENCES public.workshop_participants(id) ON DELETE SET NULL',
        );
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.set_community_workshop_poll_vote',
        );
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain('WORKSHOP_POLL_NOT_ATTACHED');
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain('ON CONFLICT (poll_id, voter_email) DO UPDATE');
        expect(COMMUNITY_POLL_SHARED_EMAIL_VOTE_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.set_community_workshop_poll_vote',
        );
    });

    it('duplicates attached polls with fresh identities and without member vote history', () => {
        expect(DUPLICATE_ATTACHED_POLLS_MIGRATION_SQL).toContain(
            'CREATE OR REPLACE FUNCTION public.duplicate_workshop_attached_polls',
        );
        expect(DUPLICATE_ATTACHED_POLLS_MIGRATION_SQL).toContain(
            'INSERT INTO public.workshop_poll_options',
        );
        expect(DUPLICATE_ATTACHED_POLLS_MIGRATION_SQL).not.toContain('workshop_poll_votes');
        expect(DUPLICATE_ATTACHED_POLLS_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.duplicate_workshop_attached_polls(uuid, uuid)',
        );
    });

    it('keeps shared projects attributable, voteable once per member, and backed by a moderated discussion room', () => {
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain("room_kind IN ('workshop', 'community', 'project')");
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.community_projects');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.community_project_votes');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.community_project_discussion_participants');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('PRIMARY KEY (project_id, community_participant_id)');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('community_projects_top_idx');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('update_community_project_vote_counts');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('set_community_project_vote');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('create_community_project');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('is_moderator\n    )');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('connect_community_project_discussion');
        expect(COMMUNITY_PROJECT_MIGRATION_SQL).toContain('FORCE ROW LEVEL SECURITY');
    });

    it('removes the community-project database procedures after their logic moved to the backend', () => {
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain(
            'DROP TRIGGER IF EXISTS community_projects_set_updated_at',
        );
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain(
            'DROP TRIGGER IF EXISTS community_project_votes_update_counts',
        );
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain(
            'DROP FUNCTION IF EXISTS public.create_community_project(uuid, text, text, text, text)',
        );
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain(
            'DROP FUNCTION IF EXISTS public.connect_community_project_discussion(uuid, uuid)',
        );
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain(
            'DROP FUNCTION IF EXISTS public.set_community_project_vote(uuid, uuid, smallint)',
        );
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).toContain('ALTER COLUMN id DROP DEFAULT');
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).not.toContain('CREATE FUNCTION');
        expect(COMMUNITY_PROJECT_BACKEND_MIGRATION_SQL).not.toContain('CREATE TRIGGER');
    });

    it('requires backend reconciliation before deleting a community member with project votes', () => {
        expect(COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_SQL).toContain(
            'DROP CONSTRAINT IF EXISTS community_project_votes_community_participant_id_fkey',
        );
        expect(COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_SQL).toContain(
            'REFERENCES public.workshop_participants(id) ON DELETE RESTRICT',
        );
        expect(COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_SQL).not.toContain('CREATE FUNCTION');
        expect(COMMUNITY_PROJECT_MEMBER_VOTE_DELETION_MIGRATION_SQL).not.toContain('CREATE TRIGGER');
    });

    it('selects one ordinary follow-up material and keeps feedback private and attributable', () => {
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS is_follow_up boolean NOT NULL DEFAULT false',
        );
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain(
            'CREATE UNIQUE INDEX IF NOT EXISTS workshop_content_blocks_one_follow_up_per_workshop',
        );
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('WHERE is_follow_up');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('select_workshop_follow_up_content');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('CREATE TABLE IF NOT EXISTS public.workshop_feedback');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain(
            'CONSTRAINT workshop_feedback_one_per_participant UNIQUE (workshop_id, participant_id)',
        );
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('workshop_feedback_participant_fk');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('CHECK (rating BETWEEN 1 AND 5)');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain('ALTER TABLE public.workshop_feedback FORCE ROW LEVEL SECURITY');
        expect(WRAP_UP_AND_FEEDBACK_MIGRATION_SQL).toContain(
            'REVOKE ALL ON TABLE public.workshop_feedback FROM PUBLIC, anon, authenticated',
        );
    });

    it('marks a material as one which only paid members may see', () => {
        expect(PAID_MEMBERS_ONLY_CONTENT_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS is_paid_members_only boolean NOT NULL DEFAULT false',
        );
        expect(PAID_MEMBERS_ONLY_CONTENT_MIGRATION_SQL).toContain(
            'ALTER TABLE public.workshop_content_blocks',
        );
    });

    it('keeps the teaser of a recording beside the recording itself, without a second video record', () => {
        expect(PAID_MEMBERS_ONLY_VIDEO_MIGRATION_SQL).toContain('ALTER TABLE public.workshops');
        expect(PAID_MEMBERS_ONLY_VIDEO_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS preview_youtube_video_id text',
        );
        expect(PAID_MEMBERS_ONLY_VIDEO_MIGRATION_SQL).not.toContain('CREATE TABLE');
    });

    it('routes material analytics through persisted ad hoc short links rather than a participant browser event', () => {
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS "isAdHoc" boolean NOT NULL DEFAULT false');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS "sourceApp" text NOT NULL DEFAULT \'admin-shortener\'',
        );
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain(
            'CREATE TABLE IF NOT EXISTS public.workshop_content_shortcode_links',
        );
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('REFERENCES public."ShortcodeLink"(id) ON DELETE CASCADE');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('public."ShortcodeLinkClick" AS shortcode_link_click');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('shortcode_link_click."navigatedAt" IS NOT NULL');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('"navigatedAt" AT TIME ZONE \'UTC\'');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain(
            'DROP FUNCTION IF EXISTS public.get_workshop_admin_timeline(uuid, integer)',
        );
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('CREATE FUNCTION public.get_workshop_admin_timeline');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).toContain('material_shortcode_link.shortcode_link_id');
        expect(SHORTCODE_MATERIAL_LINK_MIGRATION_SQL).not.toContain('link_click_count bigint,\n    total_count bigint');
    });

    it('keeps moderator and artificial chat links in their own protected short-link mapping', () => {
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain(
            'CREATE TABLE IF NOT EXISTS public.workshop_comment_shortcode_links',
        );
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain(
            'REFERENCES public.workshop_comments(id) ON DELETE CASCADE',
        );
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain('REFERENCES public."ShortcodeLink"(id) ON DELETE CASCADE');
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain(
            'PRIMARY KEY (comment_id, destination_url)',
        );
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain(
            'ALTER TABLE public.workshop_comment_shortcode_links FORCE ROW LEVEL SECURITY',
        );
        expect(SHORTCODE_CHAT_LINK_MIGRATION_SQL).toContain(
            'REVOKE ALL ON TABLE public.workshop_comment_shortcode_links FROM PUBLIC, anon, authenticated',
        );
    });

    it('keeps the project a term is about beside the term itself, without a second record of it', () => {
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ALTER TABLE public.workshops');
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS github_repository text');
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS github_repository_branch text');
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS deployment_url text');
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).not.toContain('CREATE TABLE');
    });

    it('lets neither a branch nor a deployment outlive the repository they belong to', () => {
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain(
            'DROP CONSTRAINT IF EXISTS workshops_repository_connection;',
        );
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain(
            'ADD CONSTRAINT workshops_repository_connection CHECK (',
        );
        expect(WORKSHOP_REPOSITORY_MIGRATION_SQL).toContain(
            'OR (github_repository_branch IS NULL AND deployment_url IS NULL)',
        );
    });

    it('migrates the repository branch into one array which distinguishes selected branches from all branches', () => {
        expect(WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS github_repository_branches text[]',
        );
        expect(WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL).toContain(
            'SET github_repository_branches = ARRAY[github_repository_branch]',
        );
        expect(WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL).toContain(
            'DROP COLUMN IF EXISTS github_repository_branch',
        );
        expect(WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL).toContain(
            'cardinality(github_repository_branches) <= 50',
        );
    });

    it('keeps branch selection and deployment tied to a connected repository after migration', () => {
        expect(WORKSHOP_REPOSITORY_MULTIPLE_BRANCHES_MIGRATION_SQL).toContain(
            'OR (github_repository_branches IS NULL AND deployment_url IS NULL)',
        );
    });

    it('remembers a fetched title beside every source-to-shortcode mapping', () => {
        expect(SHORTCODE_LINK_TITLE_MIGRATION_SQL).toContain(
            'ALTER TABLE public.workshop_content_shortcode_links',
        );
        expect(SHORTCODE_LINK_TITLE_MIGRATION_SQL).toContain(
            'ALTER TABLE public.workshop_comment_shortcode_links',
        );
        expect(SHORTCODE_LINK_TITLE_MIGRATION_SQL).toContain('ADD COLUMN IF NOT EXISTS destination_title text');
        expect(SHORTCODE_LINK_TITLE_MIGRATION_SQL).toContain("btrim(destination_title) <> ''");
    });

    it('remembers how every measured minute of a room was attended', () => {
        expect(ATTENDANCE_MIGRATION_SQL).toContain(
            'ADD COLUMN IF NOT EXISTS is_actively_attending boolean NOT NULL DEFAULT false',
        );
        expect(ATTENDANCE_MIGRATION_SQL).toContain(
            'DROP FUNCTION IF EXISTS public.record_workshop_participant_presence(uuid, uuid, integer);',
        );
        expect(ATTENDANCE_MIGRATION_SQL).toContain('reported_is_actively_attending boolean DEFAULT false');
        expect(ATTENDANCE_MIGRATION_SQL).toContain(
            'ON CONFLICT (workshop_id, bucket_starts_at, participant_id) DO UPDATE',
        );
        expect(ATTENDANCE_MIGRATION_SQL).toContain('NOT workshop_participant_presence_samples.is_actively_attending');
        expect(ATTENDANCE_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.record_workshop_participant_presence(uuid, uuid, integer, boolean) TO service_role;',
        );
    });

    it('draws the audience of a room apart into the people who were at their computer and the people who were not', () => {
        expect(ATTENDANCE_MIGRATION_SQL).toContain('DROP FUNCTION IF EXISTS public.get_workshop_admin_timeline');
        expect(ATTENDANCE_MIGRATION_SQL).toContain('actively_watching_participant_count bigint');
        expect(ATTENDANCE_MIGRATION_SQL).toContain('passively_watching_participant_count bigint');
        expect(ATTENDANCE_MIGRATION_SQL).toContain('WHERE presence_sample.is_actively_attending');
        expect(ATTENDANCE_MIGRATION_SQL).toContain(
            'GRANT EXECUTE ON FUNCTION public.get_workshop_admin_timeline(uuid, integer) TO service_role;',
        );
    });
});
