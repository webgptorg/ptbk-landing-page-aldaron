import { parseGithubCommitFeed } from '@/lib/github/githubCommitFeed';
import { describe, expect, it } from 'vitest';

const COMMIT_FEED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <id>tag:github.com,2008:/hejny/promptbook/commits/main</id>
  <title>hejny/promptbook:main commits</title>
  <entry>
    <id>tag:github.com,2008:Grit::Commit/6dcb09b5b57875f334f61aebed695e2e4193db5e</id>
    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/6dcb09b5b57875f334f61aebed695e2e4193db5e"/>
    <title>Add the repository panel of the room</title>
    <updated>2026-09-09T17:40:00Z</updated>
    <author>
      <name>Pavol Hejný</name>
      <uri>https://github.com/hejny</uri>
    </author>
  </entry>
  <entry>
    <id>tag:github.com,2008:Grit::Commit/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d</id>
    <link type="text/html" rel="alternate" href="https://github.com/hejny/promptbook/commit/1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d"/>
    <title>Read the commits of a repository &amp; show them</title>
    <updated>2026-09-09T18:10:00Z</updated>
    <author>
      <name>Jiří Jahn</name>
    </author>
  </entry>
  <entry>
    <title>A commit which the feed identifies by nothing</title>
    <updated>2026-09-09T18:20:00Z</updated>
  </entry>
</feed>`;

describe('the published commits of a repository', () => {
    it('are read as the newest first, whatever order the feed wrote them in', () => {
        const commits = parseGithubCommitFeed(COMMIT_FEED_XML);

        expect(commits.map((commit) => commit.committedAt)).toEqual([
            '2026-09-09T18:10:00.000Z',
            '2026-09-09T17:40:00.000Z',
        ]);
    });

    it('carry the message, the author and the identifier of every commit', () => {
        const [newestCommit, olderCommit] = parseGithubCommitFeed(COMMIT_FEED_XML);

        expect(newestCommit).toEqual({
            sha: '1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d',
            message: 'Read the commits of a repository & show them',
            authorName: 'Jiří Jahn',
            committedAt: '2026-09-09T18:10:00.000Z',
        });
        expect(olderCommit.sha).toBe('6dcb09b5b57875f334f61aebed695e2e4193db5e');
        expect(olderCommit.authorName).toBe('Pavol Hejný');
    });

    it('leave out an entry which names no commit at all', () => {
        expect(parseGithubCommitFeed(COMMIT_FEED_XML)).toHaveLength(2);
        expect(parseGithubCommitFeed('<feed></feed>')).toEqual([]);
        expect(parseGithubCommitFeed('not a feed')).toEqual([]);
    });
});
