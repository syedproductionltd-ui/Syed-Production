initAdminLayout();

let allVideos = [];
var videoMode = 'upload'; // 'upload' or 'url'

async function loadVideos() {
  try {
    allVideos = await apiCall('/videos');
    renderTable();
  } catch (err) {
    console.error(err);
  }
}

function renderTable() {
  const tbody = document.getElementById('videoBody');
  if (allVideos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;">No videos</td></tr>';
    return;
  }
  tbody.innerHTML = allVideos.map(v => `
    <tr>
      <td>${v.sortOrder}</td>
      <td><strong>${escapeHtml(v.title)}</strong><br><small style="color:#94a3b8;">${escapeHtml(v.description)}</small></td>
      <td><span class="badge">${escapeHtml(v.category || 'all')}</span></td>
      <td><span class="badge">${escapeHtml(v.tag)}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(v.videoUrl)}</td>
      <td>
        <button class="btn btn-sm btn-outline" onclick="editVideo('${v._id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteVideo('${v._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function setVideoMode(mode) {
  videoMode = mode;
  var uploadArea = document.getElementById('videoUploadArea');
  var urlArea = document.getElementById('videoUrlArea');
  var btnUpload = document.getElementById('btnUploadMode');
  var btnUrl = document.getElementById('btnUrlMode');

  if (mode === 'upload') {
    uploadArea.style.display = 'block';
    urlArea.style.display = 'none';
    btnUpload.style.fontWeight = '600';
    btnUpload.style.background = '#2D6A4F';
    btnUpload.style.color = '#fff';
    btnUrl.style.fontWeight = '400';
    btnUrl.style.background = '';
    btnUrl.style.color = '';
  } else {
    uploadArea.style.display = 'none';
    urlArea.style.display = 'block';
    btnUrl.style.fontWeight = '600';
    btnUrl.style.background = '#2D6A4F';
    btnUrl.style.color = '#fff';
    btnUpload.style.fontWeight = '400';
    btnUpload.style.background = '';
    btnUpload.style.color = '';
  }
}

function showAddModal() {
  document.getElementById('modalTitle').textContent = 'Add Video';
  document.getElementById('videoForm').reset();
  document.getElementById('editId').value = '';
  document.getElementById('vFinalUrl').value = '';
  document.getElementById('vFile').value = '';
  document.getElementById('uploadProgress').style.display = 'none';
  setVideoMode('upload');
  openModal('videoModal');
}

function editVideo(id) {
  const v = allVideos.find(x => x._id === id);
  if (!v) return;
  document.getElementById('modalTitle').textContent = 'Edit Video';
  document.getElementById('editId').value = v._id;
  document.getElementById('vTitle').value = v.title;
  document.getElementById('vDesc').value = v.description || '';
  document.getElementById('vCategory').value = v.category || 'all';
  document.getElementById('vTag').value = v.tag || 'Cinematic';
  document.getElementById('vOrder').value = v.sortOrder || 0;
  document.getElementById('vUrl').value = v.videoUrl;
  document.getElementById('vFinalUrl').value = v.videoUrl;
  document.getElementById('vFile').value = '';
  document.getElementById('uploadProgress').style.display = 'none';
  setVideoMode('url');
  openModal('videoModal');
}

async function uploadVideoFile() {
  var fileInput = document.getElementById('vFile');
  if (!fileInput.files[0]) return null;

  var formData = new FormData();
  formData.append('video', fileInput.files[0]);

  var progressDiv = document.getElementById('uploadProgress');
  var bar = document.getElementById('uploadBar');
  var status = document.getElementById('uploadStatus');
  progressDiv.style.display = 'block';
  bar.style.width = '0%';
  status.textContent = 'Uploading...';

  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/videos/upload');
    xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('admin_token'));

    xhr.upload.onprogress = function(e) {
      if (e.lengthComputable) {
        var pct = Math.round((e.loaded / e.total) * 100);
        bar.style.width = pct + '%';
        status.textContent = pct + '% uploaded...';
      }
    };

    xhr.onload = function() {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        bar.style.width = '100%';
        status.textContent = 'Upload complete!';
        resolve(data.videoUrl);
      } else {
        var err = JSON.parse(xhr.responseText);
        status.textContent = 'Upload failed: ' + (err.message || 'Unknown error');
        reject(new Error(err.message || 'Upload failed'));
      }
    };

    xhr.onerror = function() {
      status.textContent = 'Network error';
      reject(new Error('Network error'));
    };

    xhr.send(formData);
  });
}

async function saveVideo() {
  var title = document.getElementById('vTitle').value.trim();
  if (!title) {
    alert('Please enter a video title');
    document.getElementById('vTitle').focus();
    return;
  }

  try {
    var videoUrl = '';

    if (videoMode === 'upload' && document.getElementById('vFile').files[0]) {
      videoUrl = await uploadVideoFile();
    } else if (videoMode === 'url') {
      videoUrl = document.getElementById('vUrl').value.trim();
    } else {
      // Editing without changing the video — keep existing URL
      videoUrl = document.getElementById('vFinalUrl').value;
    }

    if (!videoUrl) {
      alert('Please upload a video or paste a URL');
      return;
    }

    const editId = document.getElementById('editId').value;
    const body = {
      title: title,
      description: document.getElementById('vDesc').value.trim(),
      category: document.getElementById('vCategory').value,
      tag: document.getElementById('vTag').value,
      sortOrder: parseInt(document.getElementById('vOrder').value) || 0,
      videoUrl: videoUrl
    };

    if (editId) {
      await apiCall('/videos/' + editId, { method: 'PUT', body: JSON.stringify(body) });
    } else {
      await apiCall('/videos', { method: 'POST', body: JSON.stringify(body) });
    }
    closeModal('videoModal');
    loadVideos();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

async function deleteVideo(id) {
  if (!confirm('Delete this video?')) return;
  try {
    await apiCall('/videos/' + id, { method: 'DELETE' });
    loadVideos();
  } catch (err) {
    alert('Error: ' + err.message);
  }
}

loadVideos();
