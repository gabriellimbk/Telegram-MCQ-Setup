document.getElementById('print-teacher-display').addEventListener('click', () => window.print());
document.getElementById('copy-teacher-message').addEventListener('click', async () => {
  const message = 'TELEGRAM MCQ — CONNECT YOUR CLASS\n\nUse Telegram on your phone and your class link from the coordinator.\n\n1. Create a class group, or use one where you can add the bot.\n2. Tap your complete class link on your phone.\n3. Select the group and add the bot. Allow messages, polls and images.\n4. Check for “Connected successfully” in the group, then tell your coordinator you’re ready.\n\nLink not working? Contact your coordinator.\n\n' + window.location.href.split('#')[0];
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(message);
    status.textContent = 'Copied. Send each teacher their class link separately.';
  } catch {
    status.textContent = 'Could not copy. Share this page’s link instead.';
  }
});
