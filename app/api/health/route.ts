export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
