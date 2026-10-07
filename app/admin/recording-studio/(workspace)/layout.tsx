/** Legacy leaves authorize and redirect before mounting an owner. Studio has one persistent shell. */
export default async function RecordingWorkspaceLayout({ children }: { readonly children: React.ReactNode }) {
    return <>{children}</>;
}
