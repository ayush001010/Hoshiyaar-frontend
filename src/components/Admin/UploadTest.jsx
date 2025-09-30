import React, { useState } from 'react';
import heroPoint from '../../Images/imageUpload.png';

export default function UploadTest() {
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [url, setUrl] = useState('');
  const [publicId, setPublicId] = useState('');
  const [itemId, setItemId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, type: 'success', text: '', hideAt: 0 });
  const [uploadedImages, setUploadedImages] = useState([]); // for multi
  const [maxCount, setMaxCount] = useState(5);

  // Curriculum selection state
  const [chapters, setChapters] = useState([]);
  const [modules, setModules] = useState([]);
  const [items, setItems] = useState([]);
  const [chapterId, setChapterId] = useState('');
  const [moduleId, setModuleId] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!file) return;
    try {
      setLoading(true);
      const form = new FormData();
      const many = files.length > 0;
      if (many) {
        files.slice(0, maxCount).forEach(f => form.append('files', f));
      } else if (file) {
        form.append('file', file);
      }
      form.append('folder', 'hoshiyaar-test');
      const res = await fetch(many ? '/api/upload/images' : '/api/upload/image', {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Upload failed');
      if (data.images) {
        setUrl('');
        setPublicId('');
        setUploadedImages(data.images);
        setToast({ open: true, type: 'success', text: `Uploaded ${data.images.length} images!`, hideAt: Date.now() + 2000 });
      } else {
        setUrl(data.secure_url || data.url);
        setPublicId(data.public_id || data.publicId || '');
        setToast({ open: true, type: 'success', text: 'Uploaded successfully!', hideAt: Date.now() + 2000 });
      }
    } catch (err) {
      setError(err.message);
      setToast({ open: true, type: 'error', text: err.message || 'Upload failed', hideAt: Date.now() + 2000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToDb = async () => {
    try {
      setError('');
      if (!itemId) throw new Error('Enter CurriculumItem ID');
      if (!url && uploadedImages.length === 0) throw new Error('Upload an image first');
      const body = uploadedImages.length > 0
        ? { images: uploadedImages.map(i => i.url), imagePublicIds: uploadedImages.map(i => i.public_id), append: true }
        : { images: [url], imagePublicIds: [publicId], append: true };
      const resp = await fetch(`/api/curriculum/items/${itemId}/image`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.message || 'Save failed');
      setToast({ open: true, type: 'success', text: 'Saved to DB!', hideAt: Date.now() + 2000 });
      // clear staged uploads after successful save
      setUploadedImages([]);
    } catch (e) {
      setError(e.message);
      setToast({ open: true, type: 'error', text: e.message || 'Save failed', hideAt: Date.now() + 2000 });
    }
  };

  // Load chapters on mount
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/curriculum/chapters?board=CBSE&subject=Science');
        const data = await res.json();
        setChapters(Array.isArray(data) ? data : []);
      } catch (_) {}
    })();
  }, []);

  // Load modules when chapter changes
  React.useEffect(() => {
    if (!chapterId) { setModules([]); setModuleId(''); setItems([]); setItemId(''); return; }
    (async () => {
      try {
        const res = await fetch(`/api/curriculum/modules?chapterId=${chapterId}`);
        const data = await res.json();
        setModules(Array.isArray(data) ? data : []);
      } catch (_) {}
    })();
  }, [chapterId]);

  // Load items when module changes
  React.useEffect(() => {
    if (!moduleId) { setItems([]); setItemId(''); return; }
    (async () => {
      try {
        const res = await fetch(`/api/curriculum/items?moduleId=${moduleId}`);
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (_) {}
    })();
  }, [moduleId]);

  return (
    <div className="min-h-screen bg-[#E5F0FE] p-6 md:p-8 flex items-center">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Left illustration */}
        <div className="flex justify-center md:justify-end">
          <img src={heroPoint} alt="Mascot pointing" className="w-[360px] md:w-[440px] h-auto drop-shadow-2xl" />
        </div>

        {/* Right upload card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-600 mb-2">Images Upload</h1>
          <p className="text-base text-gray-600 mb-5">Drop an image here or choose a file to upload.</p>

          {/* Drag-and-drop zone */}
          <label
            htmlFor="file-input"
            className="block border-2 border-dashed border-blue-300 rounded-3xl bg-blue-50/50 hover:bg-blue-50 transition-colors cursor-pointer p-6 md:p-8 mb-5"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const list = Array.from(e.dataTransfer.files || []);
              if (list.length > 1) setFiles(list);
              else if (list[0]) setFile(list[0]);
            }}
          >
            <div className="flex items-center gap-5">
              <div className="flex-1">
                <div className="font-bold text-lg md:text-xl">Click to choose or drag & drop</div>
                <div className="text-sm text-gray-500">PNG, JPG up to ~10MB (supports multiple)</div>
              </div>
              <div className="px-5 py-2.5 rounded-2xl bg-blue-500 text-white font-bold text-base shadow-lg">Browse</div>
            </div>
            <input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={(e) => {
              const list = Array.from(e.target.files || []);
              if (list.length > 1) setFiles(list);
              else setFile(list[0] || null);
            }} />
          </label>

          {(file || files.length > 0) && (
            <div className="mb-5 flex items-center gap-3">
              {files.length > 0 ? (
                <div className="text-sm text-gray-700 truncate max-w-[60%]">{files.length} files selected (max {maxCount} will upload)</div>
              ) : (
                <div className="text-sm text-gray-700 truncate max-w-[60%]">{file?.name}</div>
              )}
              <button
                onClick={() => setFile(null)}
                className="ml-auto text-sm text-red-600 hover:underline"
              >Remove</button>
            </div>
          )}

          {/* Limit selector */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mr-2">Max images to upload:</label>
            <select value={maxCount} onChange={(e) => setMaxCount(Number(e.target.value))} className="border rounded-xl px-3 py-1">
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-extrabold text-base md:text-lg disabled:opacity-50 shadow-xl"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>

          {error && <p className="text-red-600 mt-3">{error}</p>}

          {(url || uploadedImages.length > 0) && (
            <div className="mt-6">
              {uploadedImages.length > 0 ? (
                <div className="text-sm text-gray-700">{uploadedImages.length} images ready to save</div>
              ) : (
                <div className="flex items-center gap-3">
                  <a className="text-blue-600 underline" href={url} target="_blank" rel="noreferrer">Open uploaded image</a>
                  <span className="text-xs text-gray-500 truncate">{url}</span>
                </div>
              )}
          {/* Linked selectors (Board/Subject/Chapter/Module/Item) */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {/* Board (fixed CBSE for now) */}
                <select value={'CBSE'} disabled className="border rounded-xl px-3 py-2 bg-gray-100 text-gray-600">
                  <option>CBSE</option>
                </select>
                {/* Subject (fixed Science for now) */}
                <select value={'Science'} disabled className="border rounded-xl px-3 py-2 bg-gray-100 text-gray-600 hidden md:block">
                  <option>Science</option>
                </select>
                <select value={chapterId} onChange={(e) => setChapterId(e.target.value)} className="border rounded-xl px-3 py-2">
                  <option value="">Select Chapter</option>
                  {chapters.map(c => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
                <select value={moduleId} onChange={(e) => setModuleId(e.target.value)} className="border rounded-xl px-3 py-2" disabled={!chapterId}>
                  <option value="">Select Module</option>
                  {modules.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
                <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="border rounded-xl px-3 py-2" disabled={!moduleId}>
                  <option value="">Select Item</option>
                  {items.map(i => (
                    <option key={i._id} value={i._id}>{i.type} #{i.order}</option>
                  ))}
                </select>
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleSaveToDb}
                  className="px-4 py-2 rounded-xl bg-green-500 text-white font-bold"
                  disabled={!itemId}
                >Save to DB</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast.open && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-white transition-all duration-500 ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} ${Date.now() > toast.hideAt - 400 ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          onTransitionEnd={() => { if (Date.now() >= toast.hideAt) setToast((t) => ({ ...t, open: false })); }}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}


