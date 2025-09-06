export default function DebugPage() {
  console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID);
  console.log("AUTH_SECRET:", process.env.AUTH_SECRET);

  return (
    <div>
      <h1>Environment Variables Debug</h1>
      <p>GITHUB_CLIENT_ID: {process.env.GITHUB_CLIENT_ID || "Not found"}</p>
      <p>AUTH_SECRET: {process.env.AUTH_SECRET ? "Set" : "Not found"}</p>
    </div>
  );
}
