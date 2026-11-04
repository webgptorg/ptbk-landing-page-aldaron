'use client';

import Link from 'next/link';
import { usePublicNavigationUrl } from '@/components/public-site-navigation-provider';
import type { ComponentProps } from 'react';
import { useAiTaKrajtaPrototypeNavigation } from './prototypes/AiTaKrajtaPrototypeNavigation';

/** Public paths avoid a legacy-path redirect, keeping the root audio element mounted during navigation. */
export function AiTaKrajtaLink({ href, ...props }: ComponentProps<typeof Link>) {
    const prototype = useAiTaKrajtaPrototypeNavigation();
    const publicHref = usePublicNavigationUrl(typeof href === 'string' ? href : href.pathname ?? '/');
    const prototypeHref = prototype?.createHref(typeof href === 'string' ? href : href.pathname ?? '/');
    if (prototypeHref) return <Link {...props} href={prototypeHref} />;
    return <Link {...props} href={typeof href === 'string' ? publicHref : { ...href, pathname: publicHref }} />;
}
