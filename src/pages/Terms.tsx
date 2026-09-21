export default function Terms() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Terms of Service</h1>
      <p className="mt-2 text-slate-500">Last updated: {new Date().getFullYear()}</p>

      <div className="mt-8 space-y-6 text-slate-600">
        <section>
          <h2 className="text-lg font-semibold text-slate-900">1. Service Description</h2>
          <p className="mt-2 text-sm">FileForge is a free, browser-based document and PDF utility tool. It provides file conversion and PDF manipulation features at no cost.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">2. Free Use</h2>
          <p className="mt-2 text-sm">FileForge is provided free of charge. No signup, payment, or subscription is required. The service does not add watermarks to output files.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">3. Acceptable Use</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            <li>You are responsible for the content you process.</li>
            <li>Do not use the service for illegal activities.</li>
            <li>Do not attempt to disrupt or overload the service.</li>
          </ul>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">4. No Warranty</h2>
          <p className="mt-2 text-sm">The service is provided "as is" without warranties of any kind. We do not guarantee that every conversion will be perfect or that the service will be uninterrupted.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">5. Limitation of Liability</h2>
          <p className="mt-2 text-sm">FileForge is not liable for any data loss, file corruption, or damages arising from the use of this service. Always keep backups of your original files.</p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-slate-900">6. Changes to Terms</h2>
          <p className="mt-2 text-sm">We reserve the right to update these terms at any time. Continued use of the service constitutes acceptance of the updated terms.</p>
        </section>
      </div>
    </div>
  );
}
