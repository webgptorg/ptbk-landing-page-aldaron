'use client';

import { Component, type ReactNode } from 'react';

/** Isolate optional interaction failures from the server-rendered page, reader and enquiry. */
export class HomepageStoryBoundary extends Component<
    { readonly children: ReactNode; readonly fallback: ReactNode },
    { readonly isFailed: boolean }
> {
    state = { isFailed: false };
    static getDerivedStateFromError() {
        return { isFailed: true };
    }
    render() {
        return this.state.isFailed ? this.props.fallback : this.props.children;
    }
}
