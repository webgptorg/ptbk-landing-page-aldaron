'use client';

import Link from 'next/link';
import { usePublicNavigationUrl } from '@/components/public-site-navigation-provider';
import type { ComponentProps } from 'react';

/** Public paths avoid a legacy-path redirect, keeping the root audio element mounted during navigation. */
export function AiTaKrajtaLink({ href, ...props }: ComponentProps<typeof Link>) {
    const publicHref = usePublicNavigationUrl(typeof href === 'string' ? href : href.pathname ?? '/');
    return <Link {...props} href={typeof href === 'string' ? publicHref : { ...href, pathname: publicHref }} />;
}
