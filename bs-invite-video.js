// bs-invite-video.js
class BsInviteVideo extends HTMLElement {
  connectedCallback() {
    // Attributes supplied from WxCC layout
    this.webhookUrl = this.getAttribute('webhookUrl') || '';
    this.botToken   = this.getAttribute('botToken') || '';        // Optional, use Authorization: Bearer
    this.apiKey     = this.getAttribute('apiKey') || '';          // Optional, use X-API-Key
    this.ani        = this.getAttribute('ani') || '';
    this.dnis       = this.getAttribute('dnis') || '';
    this.agentEmail = this.getAttribute('agentEmail') || '';
    this.agentName  = this.getAttribute('agentName') || '';
    this.agentId    = this.getAttribute('agentId') || '';
    this.mediaType  = this.getAttribute('mediaType') || '';
    this.channel    = this.getAttribute('channel') || 'Voice';    // default for voice use

    // Render UI
    this.innerHTML = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; padding: 8px;">
        <button id="btnInvite" style="
          padding: 8px 12px; border-radius: 8px; cursor: pointer; border: 1px solid #d0d0d0;
          background: #ffffff; font-size: 14px;
        ">
          🎥 Invite to Video
        </button>
        <div id="status" style="margin-top: 8px; font-size: 12px; line-height: 1.4;"></div>
      </div>
    `;

    const btn = this.querySelector('#btnInvite');
    const status = this.querySelector('#status');

    // Hide if not a voice task, but still allow override via channel attribute
    if (this.channel === 'Voice' && this.mediaType && this.mediaType.toLowerCase() !== 'voice') {
      btn.disabled = true;
      status.textContent = 'Not available. No active voice task.';
    }

    btn.addEventListener('click', async () => {
      if (!this.webhookUrl) {
        status.textContent = 'Webhook URL missing.';
        return;
      }

      status.textContent = 'Creating video session…';

      const payload = {
        Channel: this.channel,
        ANI: this.ani,
        DNIS: this.dnis,
        AgentID: this.agentId,
        AgentEmailID: this.agentEmail,
        AgentName: this.agentName
      };

      const headers = { 'Content-Type': 'application/json' };
      if (this.botToken) headers['Authorization'] = `Bearer ${this.botToken}`;
      if (this.apiKey) headers['X-API-Key'] = this.apiKey;

      try {
        const res = await fetch(this.webhookUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        let body = {};
        try { body = await res.json(); } catch {}

        if (!res.ok) {
          status.textContent = `Failed. ${res.status} ${res.statusText}`;
          console.error('Invite error', body);
          return;
        }

        const hostLink  = body.hostLink  || body.host  || '';
        const guestLink = body.guestLink || body.guest || '';

        let html = '✅ Video session created.';
        if (hostLink)  html += `<br/><strong>Agent:</strong> <a href="${hostLink}" target="_blank" rel="noreferrer">Open host link</a>`;
        if (guestLink) html += `<br/><strong>Customer:</strong> ${guestLink}`;
        status.innerHTML = html;
      } catch (e) {
        status.textContent = 'Network error creating video session.';
        console.error(e);
      }
    });
  }
}

customElements.define('bs-invite-video', BsInviteVideo);
