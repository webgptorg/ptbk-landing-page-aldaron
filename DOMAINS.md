# Custom domains

This application is deployed once, but three public sites are served from that one Vercel project. The application
owns the route mapping; Cloudflare and Vercel only need to send each hostname to the same production deployment.

| Public hostname | Application route rendered internally | Retired `ptbk.io` address |
| --- | --- | --- |
| `ai-ta-krajta.cz` | `/ai-ta-krajta` | `https://ptbk.io/ai-ta-krajta` |
| `pavolhejny.cz` | `/cs/pavol` | `https://ptbk.io/cs/pavol` |
| `pavolhejny.com` | `/en/pavol` | `https://ptbk.io/en/pavol` |

The middleware permanently redirects each retired address to its row's hostname, including a query string. It also
rewrites the public hostname back to the existing Next.js route without exposing that route in the visitor's address
bar. No Cloudflare redirect rule is needed for those old `ptbk.io` paths.

## 1. Deploy the application first

Deploy this revision to the production Vercel project before changing DNS. The hostname mapping is defined once in
[`lib/domains/customDomainRouting.ts`](./lib/domains/customDomainRouting.ts); do not recreate a path rewrite in
Cloudflare or a second Vercel project.

## 2. Add the domains in Vercel

In the Vercel dashboard, open the production project, then **Settings → Domains**. Add all three apex domains:

- `ai-ta-krajta.cz`
- `pavolhejny.cz`
- `pavolhejny.com`

For each domain, keep it assigned to this project's **Production** deployment. Vercel will show the exact DNS record
and any ownership-verification record required for that particular domain. Copy those values rather than assuming a
record shown for another project is interchangeable.

If you use the CLI, the equivalent workflow is to add each domain to the project, then run
`vercel domains inspect <domain>` and use its reported DNS requirements. Because Cloudflare remains authoritative for
DNS, add records in Cloudflare rather than with `vercel dns add`.

Optional: if `www` variants should work, add each `www` hostname separately in Vercel and configure it to redirect to
the corresponding apex hostname. This avoids duplicate content. It is not required for the three canonical domains
above.

## 3. Configure each Cloudflare zone

The domain registrar must continue to use Cloudflare's nameservers for each zone. In **Cloudflare → DNS → Records**,
add the exact record Vercel requested for the apex (`@`) of each domain:

- Normally Vercel requests an `A` record for `@` pointing to `76.76.21.21`.
- If Vercel instead asks for a `CNAME` or a verification `TXT` record, use the exact name and target/value Vercel
  displays. Cloudflare supports CNAME flattening at an apex, but do not turn a verification record into a flattened or
  proxied record.
- Remove or replace conflicting `A`, `AAAA`, or `CNAME` records at the same hostname. Keep unrelated mail records
  such as `MX`, DKIM, and SPF intact.

Set the website record to **DNS only** (the grey cloud) while Vercel verifies the domain, and leave it DNS only unless
there is a deliberate need to proxy traffic through Cloudflare. DNS-only routing keeps Vercel's domain validation and
automatic TLS certificate path straightforward.

If Cloudflare proxying is required later, first wait for Vercel to report the domain as valid and its certificate as
issued. Then enable the orange cloud deliberately, set Cloudflare **SSL/TLS encryption mode** to **Full (strict)**,
and re-test every custom hostname. Never use Flexible SSL in front of Vercel.

## 4. Wait for verification and verify the result

Back in Vercel, wait until each domain says **Valid Configuration**. Vercel provisions TLS after DNS verification;
allow time for DNS and certificate propagation before treating a failure as an application problem.

Then verify the intended behavior in a browser or with an HTTP client:

| Request | Expected result |
| --- | --- |
| `https://ai-ta-krajta.cz/` | The AI ta Krajta page returns `200`. |
| `https://ai-ta-krajta.cz/media-kit` | The media kit returns `200`. |
| `https://pavolhejny.cz/` | The Czech Pavol page returns `200`. |
| `https://pavolhejny.com/` | The English Pavol page returns `200`. |
| `https://ptbk.io/ai-ta-krajta` | A permanent `308` redirect to `https://ai-ta-krajta.cz/`. |
| `https://ptbk.io/cs/pavol` | A permanent `308` redirect to `https://pavolhejny.cz/`. |
| `https://ptbk.io/en/pavol` | A permanent `308` redirect to `https://pavolhejny.com/`. |

For example, `curl -I --max-redirs 0 https://ptbk.io/ai-ta-krajta` should show the `308` and its `Location` header.
Also confirm that each page's canonical URL and social preview use its own hostname; the application sitemap is already
generated from the same routing definition.

## References

- [Vercel: setting up a custom domain](https://vercel.com/docs/domains/set-up-custom-domain)
- [Cloudflare: manage DNS records](https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/)
- [Cloudflare: CNAME flattening at the zone apex](https://developers.cloudflare.com/dns/cname-flattening/set-up-cname-flattening/)
