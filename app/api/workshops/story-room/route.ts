/** Old browser tabs must re-open the event to obtain the workshop session. */
function retired() {
    return Response.json({ error: 'Dílnu teď otevřeš na ptbk.io/cs/pribeh.' }, {
        status: 410, headers: { 'Cache-Control': 'no-store' },
    });
}

export { retired as GET, retired as POST };
