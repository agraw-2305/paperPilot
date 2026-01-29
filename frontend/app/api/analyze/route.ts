export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    // Allow by extension if MIME is missing or generic (e.g., from some OS/browsers)
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidType && !hasValidExtension) {
      return new Response(JSON.stringify({ error: 'Invalid file type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const backendBase = (
      (globalThis as any).process?.env?.BACKEND_URL ||
      (globalThis as any).process?.env?.NEXT_PUBLIC_BACKEND_URL ||
      'http://127.0.0.1:8000'
    ) as string;

    const forward = new FormData();
    forward.append('file', file, (file as any).name || 'upload');

    const controller = new AbortController();
    const timeoutMs = 180_000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let res: Response;
    try {
      res = await fetch(`${backendBase}/upload/analyze`, {
        method: 'POST',
        body: forward,
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return new Response(JSON.stringify({ error: 'Analysis timed out. Please try again, or use a smaller/clearer file.' }), {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
    }

    const text = await res.text();
    let payload: any = null;
    try {
      payload = JSON.parse(text);
    } catch {}

    if (!res.ok) {
      const message = (payload && (payload.detail || payload.error)) || 'Failed to analyze document';
      return new Response(JSON.stringify({ error: message }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(payload ?? text), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[v0] Analyze endpoint error:', error);
    return new Response(JSON.stringify({ error: 'Failed to analyze document' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
