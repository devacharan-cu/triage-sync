import fetch from 'node-fetch';

async function main() {
  console.log('Sending seed request to local server...');
  try {
    const res = await fetch('http://localhost:3070/api/seed', { method: 'POST' });
    const data = await res.json() as Record<string, string>;
    if (res.ok) {
      console.log('Seed completed successfully:', data.message);
    } else {
      console.error('Seed failed:', data.error);
    }
  } catch (err) {
    console.error('Failed to reach local server. Is it running on port 3070?');
    console.error(err);
  }
}

main();
