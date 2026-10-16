'use client';

import { Component, type ReactNode } from 'react';

/** The server-rendered summaries and enquiry are outside this optional interactive island. */
export class HomepageStoryBoundary extends Component<
    { readonly children: ReactNode; readonly fallback: string },
    { readonly isFailed: boolean }
> {
    state = { isFailed: false };
    static getDerivedStateFromError() {
        return { isFailed: true };
    }
    render() {
        return this.state.isFailed ? (
            <p className="ah-story-fallback" role="status">
                <a href="#agenda-summaries">{this.props.fallback}</a>
            </p>
        ) : (
            this.props.children
        );
    }
}
