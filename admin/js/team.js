initAdminLayout();

let allMembers = [];

// ── Upload elements ──
const uploadArea = document.getElementById('tUploadArea');
const fileInput = document.getElementById('tImageFile');
const uploadPlaceholder = document.getElementById('tUploadPlaceholder');
const uploadPreview = document.getElementById('tUploadPreview');
const previewImg = document.getElementById('tPreviewImg');
const removeBtn = document.getElementById('tRemoveImage');
const hiddenInput = document.getElementById('tImage');
const progressDiv = document.getElementById('tUploadProgress');
const progressBar = document.getElementById('tUploadBar');
const statusEl = document.getElementById('tUploadStatus');

// ── Drag & drop + click to upload ──
uploadArea.addEventListener('click', (e) => {
  if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
    fileInput.click();
  }
});

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('drag-over');
  if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
});

fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

removeBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  clearImage();
});

function handleFile(file) {
  if (!file.type.startsWith('image/') && !file.name.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
    alert('Please select an image file (JPG, PNG, GIF, WEBP, HEIC)');
    return;
  }

  // Show local preview instantly
  const reader = new FileReader();
  reader.onload = (e) => {
    previewImg.src = e.target.result;
    uploadPlaceholder.hidden = true;
    uploadPreview.hidden = false;
  };
  reader.readAsDataURL(file);

  // Upload to server
  uploadImage(file);
}

function uploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  progressDiv.hidden = false;
  progressBar.style.width = '0%';
  statusEl.textContent = 'Uploading...';
  statusEl.style.color = '';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/api/team/upload');
  xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('admin_token'));

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      progressBar.style.width = pct + '%';
      statusEl.textContent = pct + '% uploaded...';
    }
  };

  xhr.onload = () => {
    try {
      const data = JSON.parse(xhr.responseText);
      if (xhr.status === 200) {
        progressBar.style.width = '100%';
        statusEl.textContent = 'Upload complete!';
        statusEl.style.color = '#16a34a';
        hiddenInput.value = data.imageUrl;
        // Update preview with server URL
        previewImg.src = '/' + data.imageUrl;
      } else {
        statusEl.textContent = 'Upload failed: ' + (data.message || 'Unknown error');
        statusEl.style.color = '#ef4444';
      }
    } catch (e) {
      statusEl.textContent = 'Upload failed: Server error';
      statusEl.style.color = '#ef4444';
    }
  };

  xhr.onerror = () => {
    statusEl.textContent = 'Upload failed: Network error';
    statusEl.style.color = '#ef4444';
  };

  xhr.send(formData);
}

function clearImage() {
  fileInput.value = '';
  hiddenInput.value = '';
  previewImg.src = '';
  uploadPlaceholder.hidden = false;
  uploadPreview.hidden = true;
  progressDiv.hidden = true;
  progressBar.style.width = '0%';
  statusEl.textContent = '';
}

// ── Load & render ──
async function loadMembers() {
  try {
    allMembers = await apiCall('/team');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('teamBody');
  if (allMembers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#94a3b8;">No team members</td></tr>';
    return;
  }
  tbody.innerHTML = allMembers.map(m => `
    <tr>
      <td><img class="thumb" src="${escapeHtml(m.image)}" alt="${escapeHtml(m.name)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22><rect fill=%22%23e2e8f0%22 width=%2240%22 height=%2240%22 rx=%228%22/><text x=%2220%22 y=%2225%22 text-anchor=%22middle%22 fill=%22%2394a3b8%22 font-size=%2214%22>👤</text></svg>'"></td>
      <td>${m.sortOrder}</td>
      <td><strong>${escapeHtml(m.name)}</strong></td>
      <td>${escapeHtml(m.role)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editMember('${m._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember('${m._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Team Member';
  document.getElementById('teamForm').reset();
  document.getElementById('editId').value = '';
  clearImage();
  openModal('teamModal');
}

function editMember(id) {
  const m = allMembers.find(x => x._id === id);
  if (!m) return;
  document.getElementById('modalTitle').textContent = 'Edit Team Member';
  document.getElementById('editId').value = m._id;
  document.getElementById('tName').value = m.name;
  document.getElementById('tRole').value = m.role;
  document.getElementById('tBio').value = m.bio || '';
  document.getElementById('tOrder').value = m.sortOrder || 0;

  // Set image
  clearImage();
  if (m.image) {
    hiddenInput.value = m.image;
    previewImg.src = m.image.startsWith('http') ? m.image : '/' + m.image;
    uploadPlaceholder.hidden = true;
    uploadPreview.hidden = false;
    progressDiv.hidden = true;
    statusEl.textContent = 'Current photo loaded';
    statusEl.style.color = '#16a34a';
  }

  openModal('teamModal');
}

async function saveMember() {
  const editId = document.getElementById('editId').value;
  const body = {
    name: document.getElementById('tName').value.trim(),
    role: document.getElementById('tRole').value.trim(),
    bio: document.getElementById('tBio').value.trim(),
    image: document.getElementById('tImage').value.trim(),
    facebook: document.getElementById('tFacebook').value.trim(),
    instagram: document.getElementById('tInstagram').value.trim(),
    sortOrder: parseInt(document.getElementById('tOrder').value) || 0
  };

  if (!body.image) {
    alert('Please upload a photo for the team member');
    return;
  }

  try {
    if (editId) {
      await apiCall('/team/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/team', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('teamModal');
    loadMembers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function deleteMember(id) {
  if (!confirm('Delete this team member?')) return;
  try {
    await apiCall('/team/' + id, { method: 'DELETE' });
    loadMembers();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadMembers();
