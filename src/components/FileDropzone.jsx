import { useRef, useState } from 'react'
import { UploadCloud, X } from 'lucide-react'
import Button from './Button'
import { formatBytes } from '../utils/format'

export default function FileDropzone({ files, setFiles }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  function addFiles(list) {
    const next = Array.from(list || [])
    if (!next.length) return
    setFiles((current) => [...current, ...next])
  }

  function handleChange(event) {
    addFiles(event.target.files)
    event.target.value = ''
  }

  function removeFile(index) {
    setFiles((current) => current.filter((_, currentIndex) => currentIndex !== index))
  }

  return (
    <div className="space-y-3">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          addFiles(event.dataTransfer.files)
        }}
        className={`group flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-8 text-center transition ${dragActive ? 'border-pink-300 bg-pink-50' : 'border-slate-200 bg-white/70 hover:border-pink-200 hover:bg-white'}`}
      >
        <div className="mb-4 rounded-2xl bg-pink-100 p-4 text-pink-500 transition group-hover:scale-105">
          <UploadCloud className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-slate-800">Drag and drop files here</h3>
        <p className="mt-2 max-w-md text-sm text-slate-600">
          Upload images, videos, PDFs, documents, ZIP files, or a mix of them together.
        </p>
        <div className="mt-4">
          <Button type="button" variant="secondary">Choose files</Button>
        </div>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={handleChange} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="text-sm font-medium text-slate-700">Selected files</p>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2">
                {file.type.startsWith('image/') ? (
                  <img src={URL.createObjectURL(file)} alt={file.name} className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-500 text-xs font-semibold">
                    FILE
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                </div>
                <button type="button" onClick={() => removeFile(index)} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-400">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
