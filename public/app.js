const uploadForm = document.getElementById('upload-form');
const accessForm = document.getElementById('access-form');
const uploadResult = document.getElementById('upload-result');
const accessResult = document.getElementById('access-result');

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const setResult = (element, type, title, rows, action) => {
  const rowsMarkup = rows
    .map(
      (row) =>
        `<li><span class="meta-key">${escapeHtml(row.label)}</span><span class="meta-value">${escapeHtml(row.value)}</span></li>`
    )
    .join('');

  element.className = `result result-${type}`;
  element.innerHTML = `
    <div class="result-title">${escapeHtml(title)}</div>
    <ul class="meta-list">${rowsMarkup}</ul>
    ${
      action
        ? `<a class="result-link" href="${escapeHtml(action.href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(action.label)}</a>`
        : ''
    }
  `;
};

uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setResult(uploadResult, 'info', 'Uploading', [{ label: 'Status', value: 'Sending file to secure storage...' }]);

  try {
    const formData = new FormData(uploadForm);
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    const shareUrl = `${window.location.origin}${data.shareLink}`;
    setResult(
      uploadResult,
      'success',
      'Upload complete',
      [
        { label: 'File ID', value: data.fileId },
        { label: 'Created', value: new Date(data.createdAt).toLocaleString() },
        { label: 'Expires', value: data.expiresAt ? new Date(data.expiresAt).toLocaleString() : 'No expiry' },
        { label: 'Max Downloads', value: data.maxDownloads ?? 'Unlimited' }
      ],
      { label: 'Open share page', href: shareUrl }
    );
  } catch (error) {
    setResult(uploadResult, 'error', 'Upload failed', [{ label: 'Reason', value: error.message }]);
  }
});

accessForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setResult(accessResult, 'info', 'Validating', [{ label: 'Status', value: 'Checking file and password...' }]);

  try {
    const payload = {
      fileId: document.getElementById('fileId').value,
      password: document.getElementById('accessPassword').value
    };

    const response = await fetch('/api/access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Access denied');
    }

    setResult(
      accessResult,
      'success',
      'Access granted',
      [
        { label: 'File ID', value: data.fileId },
        { label: 'File Name', value: data.fileName },
        { label: 'Link Validity', value: `${data.expiresInSeconds} seconds` }
      ],
      { label: 'Download file', href: data.signedUrl }
    );
  } catch (error) {
    setResult(accessResult, 'error', 'Access denied', [{ label: 'Reason', value: error.message }]);
  }
});
