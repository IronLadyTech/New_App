/** Normalize learner uploads on one task submission (legacy single file + files[]). */
export function normalizeSubmissionFiles(sub) {
  const out = [];
  const push = (entry) => {
    const url = entry?.url || entry?.fileUrl || entry?.videoUrl;
    if (!url) return;
    if (out.some((x) => x.url === url)) return;
    out.push({
      url,
      name: entry.name || entry.fileName || 'Your file',
      type: entry.type || entry.fileType || null,
      kind: entry.kind || (entry.videoUrl ? 'video' : 'file'),
      uploadedAt: entry.uploadedAt || null,
    });
  };
  if (Array.isArray(sub?.files)) sub.files.forEach(push);
  if (sub?.fileUrl) push({ url: sub.fileUrl, name: sub.fileName, type: sub.fileType, kind: 'file' });
  if (sub?.videoUrl) push({ url: sub.videoUrl, name: sub.fileName, type: sub.fileType, kind: 'video' });
  return out;
}

export function isImageSubmissionFile(file) {
  const type = String(file?.type || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  return type.startsWith('image/') || /\.(jpe?g|png|gif|webp|heic)$/i.test(name);
}

function fileEntry(uploaded) {
  const url = uploaded?.videoUrl || uploaded?.fileUrl;
  if (!url) return null;
  return {
    url,
    name: uploaded.fileName || 'File',
    type: uploaded.fileType || null,
    uploadedAt: new Date().toISOString(),
    kind: uploaded.videoUrl ? 'video' : 'file',
  };
}

/**
 * Keep prior uploads when she adds more files on the same task (VIA report + photos).
 * `uploaded.batch` (several files picked together) are all appended, in pick order; the
 * single-file fields (fileUrl, fileName…) are the last one, as the web LMS expects.
 */
export function appendUploadFields(previousSubmission, uploaded) {
  if (!uploaded) return uploaded;
  const { batch, ...single } = uploaded;
  const added = (Array.isArray(batch) && batch.length ? batch : [single]).map(fileEntry).filter(Boolean);
  if (!added.length) return single;
  const urls = new Set(added.map((f) => f.url));
  const files = normalizeSubmissionFiles(previousSubmission).filter((f) => !urls.has(f.url));
  return { ...single, files: [...files, ...added] };
}

export function submissionFileLabel(file) {
  return file?.name || 'Your file';
}
