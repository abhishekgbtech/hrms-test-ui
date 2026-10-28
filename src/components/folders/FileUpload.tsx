"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import type { ChangeEvent, DragEvent, InputHTMLAttributes } from "react";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  FileArchive,
  FileText,
  Grid,
  Headphones,
  ImageIcon,
  List,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
  UploadCloud,
  Upload,
  Video,
  FileSpreadsheet,
} from "../icons";

import { Button } from "../ui/Button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/Table"

export type FileMetadata = {
  name: string
  size: number
  type: string
  url: string
  id: string
}

export type FileWithPreview = {
  file: File | FileMetadata
  id: string
  preview?: string
}

export type FileUploadOptions = {
  maxFiles?: number // Only used when multiple is true, defaults to Infinity
  maxSize?: number // in bytes
  accept?: string
  multiple?: boolean // Defaults to false
  initialFiles?: FileMetadata[]
  onFilesChange?: (files: FileWithPreview[]) => void // Callback when files change
  onFilesAdded?: (addedFiles: FileWithPreview[]) => void // Callback when new files are added
}

export type FileUploadState = {
  files: FileWithPreview[]
  isDragging: boolean
  errors: string[]
}

export type FileUploadActions = {
  addFiles: (files: FileList | File[]) => void
  removeFile: (id: string) => void
  clearFiles: () => void
  clearErrors: () => void
  handleDragEnter: (e: DragEvent<HTMLElement>) => void
  handleDragLeave: (e: DragEvent<HTMLElement>) => void
  handleDragOver: (e: DragEvent<HTMLElement>) => void
  handleDrop: (e: DragEvent<HTMLElement>) => void
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => void
  openFileDialog: () => void
  getInputProps: (
    props?: InputHTMLAttributes<HTMLInputElement>
  ) => InputHTMLAttributes<HTMLInputElement> & {
    ref: React.Ref<HTMLInputElement>
  }
}

export const useFileUpload = (
  options: FileUploadOptions = {}
): [FileUploadState, FileUploadActions] => {
  const {
    maxFiles = Infinity,
    maxSize = Infinity,
    accept = "*",
    multiple = false,
    initialFiles = [],
    onFilesChange,
    onFilesAdded,
  } = options

  const [state, setState] = useState<FileUploadState>({
    files: initialFiles.map((file) => ({
      file,
      id: file.id,
      preview: file.url,
    })),
    isDragging: false,
    errors: [],
  })

  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback(
    (file: File | FileMetadata): string | null => {
      if (file instanceof File) {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
        }
      } else {
        if (file.size > maxSize) {
          return `File "${file.name}" exceeds the maximum size of ${formatBytes(maxSize)}.`
        }
      }

      if (accept !== "*") {
        const acceptedTypes = accept.split(",").map((type) => type.trim())
        const fileType = file instanceof File ? file.type || "" : file.type
        const fileExtension = `.${file instanceof File ? file.name.split(".").pop() : file.name.split(".").pop()}`

        const isAccepted = acceptedTypes.some((type) => {
          if (type.startsWith(".")) {
            return fileExtension.toLowerCase() === type.toLowerCase()
          }
          if (type.endsWith("/*")) {
            const baseType = type.split("/")[0]
            return fileType.startsWith(`${baseType}/`)
          }
          return fileType === type
        })

        if (!isAccepted) {
          return `File "${file instanceof File ? file.name : file.name}" is not an accepted file type.`
        }
      }

      return null
    },
    [accept, maxSize]
  )

  const createPreview = useCallback(
    (file: File | FileMetadata): string | undefined => {
      if (file instanceof File) {
        return URL.createObjectURL(file)
      }
      return file.url
    },
    []
  )

  const generateUniqueId = useCallback((file: File | FileMetadata): string => {
    if (file instanceof File) {
      return `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
    return file.id
  }, [])

  const clearFiles = useCallback(() => {
    setState((prev) => {
      // Clean up object URLs
      prev.files.forEach((file) => {
        if (
          file.preview &&
          file.file instanceof File &&
          file.file.type.startsWith("image/")
        ) {
          URL.revokeObjectURL(file.preview)
        }
      })

      if (inputRef.current) {
        inputRef.current.value = ""
      }

      const newState = {
        ...prev,
        files: [],
        errors: [],
      }

      onFilesChange?.(newState.files)
      return newState
    })
  }, [onFilesChange])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      if (!newFiles || newFiles.length === 0) return

      const newFilesArray = Array.from(newFiles)
      const errors: string[] = []

      // Clear existing errors when new files are uploaded
      setState((prev) => ({ ...prev, errors: [] }))

      // In single file mode, clear existing files first
      if (!multiple) {
        clearFiles()
      }

      // Check if adding these files would exceed maxFiles (only in multiple mode)
      if (
        multiple &&
        maxFiles !== Infinity &&
        state.files.length + newFilesArray.length > maxFiles
      ) {
        errors.push(`You can only upload a maximum of ${maxFiles} files.`)
        setState((prev) => ({ ...prev, errors }))
        return
      }

      const validFiles: FileWithPreview[] = []

      newFilesArray.forEach((file) => {
        // Only check for duplicates if multiple files are allowed
        if (multiple) {
          const isDuplicate = state.files.some(
            (existingFile) =>
              existingFile.file.name === file.name &&
              existingFile.file.size === file.size
          )

          // Skip duplicate files silently
          if (isDuplicate) {
            return
          }
        }

        // Check file size
        if (file.size > maxSize) {
          errors.push(
            multiple
              ? `Some files exceed the maximum size of ${formatBytes(maxSize)}.`
              : `File exceeds the maximum size of ${formatBytes(maxSize)}.`
          )
          return
        }

        const error = validateFile(file)
        if (error) {
          errors.push(error)
        } else {
          validFiles.push({
            file,
            id: generateUniqueId(file),
            preview: createPreview(file),
          })
        }
      })

      // Only update state if we have valid files to add
      if (validFiles.length > 0) {
        // Call the onFilesAdded callback with the newly added valid files
        onFilesAdded?.(validFiles)

        setState((prev) => {
          const newFiles = !multiple
            ? validFiles
            : [...prev.files, ...validFiles]
          onFilesChange?.(newFiles)
          return {
            ...prev,
            files: newFiles,
            errors,
          }
        })
      } else if (errors.length > 0) {
        setState((prev) => ({
          ...prev,
          errors,
        }))
      }

      // Reset input value after handling files
      if (inputRef.current) {
        inputRef.current.value = ""
      }
    },
    [
      state.files,
      maxFiles,
      multiple,
      maxSize,
      validateFile,
      createPreview,
      generateUniqueId,
      clearFiles,
      onFilesChange,
      onFilesAdded,
    ]
  )

  const removeFile = useCallback(
    (id: string) => {
      setState((prev) => {
        const fileToRemove = prev.files.find((file) => file.id === id)
        if (
          fileToRemove &&
          fileToRemove.preview &&
          fileToRemove.file instanceof File &&
          fileToRemove.file.type.startsWith("image/")
        ) {
          URL.revokeObjectURL(fileToRemove.preview)
        }

        const newFiles = prev.files.filter((file) => file.id !== id)
        onFilesChange?.(newFiles)

        return {
          ...prev,
          files: newFiles,
          errors: [],
        }
      })
    },
    [onFilesChange]
  )
  
  useEffect(() => {
    // This effect synchronizes the internal state with the `initialFiles` prop.
    // It's useful if the parent component changes the folder and passes new initial files.
    const newFiles = initialFiles.map((item) => ({
      file: item,
      id: item.id,
      preview: item.url,
    }));

    setState(prevState => ({ ...prevState, files: newFiles }));
  }, [initialFiles]);


  const clearErrors = useCallback(() => {
    setState((prev) => ({
      ...prev,
      errors: [],
    }))
  }, [])

  const handleDragEnter = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setState((prev) => ({ ...prev, isDragging: true }))
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return
    }

    setState((prev) => ({ ...prev, isDragging: false }))
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setState((prev) => ({ ...prev, isDragging: false }))

      // Don't process files if the input is disabled
      if (inputRef.current?.disabled) {
        return
      }

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // In single file mode, only use the first file
        if (!multiple) {
          const droppedFile = e.dataTransfer.files[0]
          addFiles([droppedFile])
        } else {
          addFiles(e.dataTransfer.files)
        }
      }
    },
    [addFiles, multiple]
  )

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
      }
    },
    [addFiles]
  )

  const openFileDialog = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }, [])

  const getInputProps = useCallback(
    (props: InputHTMLAttributes<HTMLInputElement> = {}) => {
      return {
        ...props,
        type: "file" as const,
        onChange: handleFileChange,
        accept: props.accept || accept,
        multiple: props.multiple !== undefined ? props.multiple : multiple,
        ref: inputRef,
      }
    },
    [accept, multiple, handleFileChange]
  )

  return [
    state,
    {
      addFiles,
      removeFile,
      clearFiles,
      clearErrors,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      handleFileChange,
      openFileDialog,
      getInputProps,
    },
  ]
}

// Helper function to format bytes to human-readable format
export const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i]
}

// ---------- Types ----------
type UploadEntry = {
  id: string
  file: File | { name: string; type: string; size: number }
  preview?: string // object URL or remote URL injected by hook
}

// ---------- Utilities ----------
const isRealFile = (f: unknown): f is File =>
  typeof window !== "undefined" && typeof File !== "undefined" && f instanceof File

const getName = (e: UploadEntry) => (isRealFile(e.file) ? e.file.name : e.file.name)
const getType = (e: UploadEntry) => (isRealFile(e.file) ? e.file.type : e.file.type || "")
const getSize = (e: UploadEntry) => (isRealFile(e.file) ? e.file.size : e.file.size ?? 0)

const getExt = (name: string) => {
  const dot = name.lastIndexOf(".")
  return dot > -1 ? name.slice(dot + 1).toLowerCase() : ""
}

const getPreviewUrl = (e: UploadEntry) => {
  // prefer preview; fall back to any url that the hook might have placed on entry
  return e.preview || (e as unknown as { url?: string }).url || ""
}

const niceSubtype = (mime: string) => {
  if (!mime) return "UNKNOWN"
  const parts = mime.split("/")
  return (parts[1] || parts[0] || "unknown").toUpperCase()
}

const getFileIcon = (entry: UploadEntry) => {
  const name = getName(entry)
  const type = getType(entry)
  const ext = getExt(name)

  if (
    type.includes("pdf") ||
    ext === "pdf" ||
    type.includes("word") ||
    ext === "doc" ||
    ext === "docx" ||
    type.includes("text") ||
    ext === "txt" ||
    ext === "md"
  ) {
    return <FileText size={16} className="opacity-60" aria-hidden="true" />
  }
  if (
    type.includes("zip") ||
    type.includes("archive") ||
    ext === "zip" ||
    ext === "rar" ||
    ext === "7z" ||
    ext === "tar"
  ) {
    return <FileArchive size={16} className="opacity-60" aria-hidden="true" />
  }
  if (
    type.includes("excel") ||
    ext === "xls" ||
    ext === "xlsx" ||
    ext === "csv"
  ) {
    return <FileSpreadsheet size={16} className="opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("video/") || ["mp4", "mov", "webm", "mkv"].includes(ext)) {
    return <Video size={16} className="opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "flac", "m4a"].includes(ext)) {
    return <Headphones size={16} className="opacity-60" aria-hidden="true" />
  }
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) {
    return <ImageIcon size={16} className="opacity-60" aria-hidden="true" />
  }
  return <FileText size={16} className="opacity-60" aria-hidden="true" />
}

// ---------- Component ----------
export default function FileUpload({ initialFiles, onFilesChange }: { initialFiles: FileMetadata[], onFilesChange: (files: FileWithPreview[]) => void }) {
  // Tunables
  const maxSize = 20 * 1024 * 1024 // 20MB
  const maxFiles = 20
  const [view, setView] = useState<"list" | "grid">("list")
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"name" | "type" | "size">("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState<string | null>(null)

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    multiple: true,
    maxFiles,
    maxSize,
    initialFiles,
    onFilesChange,
  })

  // Only compute total size, avoiding complex memoization if unnecessary for basic rendering
  // but keeping standard useMemo if imports are correct.
  const totalSize = useMemo(
    () => files.reduce((acc, f) => acc + getSize(f as UploadEntry), 0),
    [files]
  )

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(null), 1200)
    return () => clearTimeout(t)
  }, [copied])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base = q
      ? files.filter((f: UploadEntry) => {
          const name = getName(f).toLowerCase()
          const type = getType(f).toLowerCase()
          const ext = getExt(name)
          return name.includes(q) || type.includes(q) || ext.includes(q)
        })
      : files

    const sorter = (a: UploadEntry, b: UploadEntry) => {
      let cmp = 0
      if (sortBy === "name") {
        cmp = getName(a).localeCompare(getName(b))
      } else if (sortBy === "type") {
        cmp = getType(a).localeCompare(getType(b))
      } else {
        cmp = getSize(a) - getSize(b)
      }
      return sortDir === "asc" ? cmp : -cmp
    }

    return [...base].sort(sorter)
  }, [files, query, sortBy, sortDir])

  const allSelected = selected.size > 0 && filtered.every((f) => selected.has(f.id))
  const noneSelected = selected.size === 0

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () =>
    setSelected((prev) => {
      if (filtered.length === 0) return prev
      const everySelected = filtered.every((f) => prev.has(f.id))
      if (everySelected) return new Set()
      return new Set(filtered.map((f) => f.id))
    })

  const removeSelected = () => {
    filtered.forEach((f) => {
      if (selected.has(f.id)) removeFile(f.id)
    })
    setSelected(new Set())
  }

  const downloadOne = (entry: UploadEntry) => {
    const url = getPreviewUrl(entry)
    if (!url) return
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const downloadSelected = () => {
    filtered.forEach((f) => {
      if (selected.has(f.id)) downloadOne(f as UploadEntry)
    })
  }

  const copyLink = async (entry: UploadEntry) => {
    const url = getPreviewUrl(entry)
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(entry.id)
    } catch {
      // noop
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* -- Top toolbar -- */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Files <span className="text-slate-500 dark:text-slate-400">({files.length})</span>
          </h3>
          <span className="text-slate-500 dark:text-slate-400 text-xs">
            Total: {formatBytes(totalSize)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search files..."
              className="bg-white dark:bg-slate-800 ring-offset-white dark:ring-offset-slate-900 focus-visible:ring-cyan-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 h-8 w-40 sm:w-56 rounded-md border border-slate-200 dark:border-slate-700 px-7 text-[13px] outline-none focus-visible:ring-2"
              aria-label="Search files"
            />
            <Search
              className="text-slate-400 pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 opacity-70"
              aria-hidden="true"
            />
          </div>

          <div className="flex items-center gap-1">
            <label htmlFor="sortby" className="text-slate-500 sr-only">
              Sort by
            </label>
            <select
              id="sortby"
              className="bg-white dark:bg-slate-800 h-8 rounded-md border border-slate-200 dark:border-slate-700 px-2 text-[13px]"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort files"
            >
              <option value="name">Name</option>
              <option value="type">Type</option>
              <option value="size">Size</option>
            </select>

            <Button
              variant="secondary"
              size="icon"
              className="size-8"
              onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
              aria-label={`Toggle sort direction to ${sortDir === "asc" ? "descending" : "ascending"}`}
            >
              {sortDir === "asc" ? (
                <SortAsc size={16} />
              ) : (
                <SortDesc size={16} />
              )}
            </Button>
          </div>

          <div className="ms-1 flex items-center gap-1">
            <Button
              variant={view === "list" ? "default" : "secondary"}
              size="icon"
              className="size-8"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
              title="List view"
            >
              <List size={16} />
            </Button>
            <Button
              variant={view === "grid" ? "default" : "secondary"}
              size="icon"
              className="size-8"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
              title="Grid view"
            >
              <Grid size={16} />
            </Button>
          </div>

        </div>
      </div>

      {/* -- Drop area (always shown) -- */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        data-dragging={isDragging || undefined}
        className="border-slate-300 dark:border-slate-700 data-[dragging=true]:bg-slate-100/50 dark:data-[dragging=true]:bg-slate-800/50 has-[input:focus]:border-cyan-500 has-[input:focus]:ring-cyan-500/50 rounded-xl border-2 border-dashed p-3 transition-colors has-[input:focus]:ring-2"
        aria-label="Drop files here or use the select button to upload"
      >
        <input
          {...getInputProps({
            "aria-label": "Upload files",
          })}
          className="sr-only"
        />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-white dark:bg-slate-800 me-1 flex size-9 shrink-0 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700">
              <FileText size={16} className="opacity-60" aria-hidden="true" />
            </div>
            <div className="text-xs">
              <p className="font-medium text-slate-800 dark:text-slate-200">Drop files to upload</p>
              <p className="text-slate-500 dark:text-slate-400">
                Up to {maxFiles} files · {formatBytes(maxSize)} per file
              </p>
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={openFileDialog}>
            <Upload size={14} className="-ms-1 mr-1.5 opacity-60" aria-hidden="true" />
            Select files
          </Button>
        </div>
      </div>

      {/* -- When we have files -- */}
      {filtered.length > 0 ? (
        <>
          {/* Bulk actions bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[13px]">
              <label className="inline-flex cursor-pointer items-center gap-1">
                <input
                  type="checkbox"
                  className="accent-cyan-600 dark:accent-cyan-500 size-3.5"
                  checked={allSelected}
                  onChange={toggleAll}
                  aria-label={allSelected ? "Unselect all" : "Select all"}
                />
                <span className="text-slate-500 dark:text-slate-400">
                  {selected.size}/{filtered.length} selected
                </span>
              </label>
              {!noneSelected && (
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">
                  • {formatBytes(
                    filtered
                      .filter((f) => selected.has(f.id))
                      .reduce((acc, f) => acc + getSize(f as UploadEntry), 0)
                  )}{" "}
                  total
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={downloadSelected}
                disabled={noneSelected}
                aria-disabled={noneSelected}
                title={noneSelected ? "Select files to download" : "Download selected"}
              >
                <Download size={14} className="-ms-0.5 mr-1.5 opacity-60" aria-hidden="true" />
                Download
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={removeSelected}
                disabled={noneSelected}
                aria-disabled={noneSelected}
                title={noneSelected ? "Select files to remove" : "Remove selected"}
              >
                <Trash2 size={14} className="-ms-0.5 mr-1.5 opacity-60" aria-hidden="true" />
                Remove
              </Button>
            </div>
          </div>

          {view === "list" ? (
            <div className="bg-white dark:bg-slate-800 overflow-hidden rounded-md border border-slate-200 dark:border-slate-700">
              <Table>
                <TableHeader className="text-xs">
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                    <TableHead className="h-9 w-10 py-2">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead className="h-9 py-2">Name</TableHead>
                    <TableHead className="h-9 py-2">Type</TableHead>
                    <TableHead className="h-9 py-2">Size</TableHead>
                    <TableHead className="h-9 w-0 py-2 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[13px]">
                  {filtered.map((entry: UploadEntry) => {
                    const name = getName(entry)
                    const type = getType(entry)
                    const size = getSize(entry)
                    const url = getPreviewUrl(entry)
                    const isSelected = selected.has(entry.id)
                    const percentOfMax = Math.min(100, Math.round((size / maxSize) * 100))

                    return (
                      <TableRow key={entry.id} data-selected={isSelected || undefined}>
                        <TableCell className="py-2">
                          <input
                            type="checkbox"
                            className="accent-cyan-600 dark:accent-cyan-500 size-3.5"
                            checked={isSelected}
                            onChange={() => toggleOne(entry.id)}
                            aria-label={`Select ${name}`}
                          />
                        </TableCell>
                        <TableCell className="max-w-64 py-2 font-medium">
                          <span className="flex items-center gap-2">
                            <span className="shrink-0">{getFileIcon(entry)}</span>
                            <span className="truncate">{name}</span>
                          </span>
                          {/* Size bar */}
                          <div className="mt-1 h-1.5 w-44 overflow-hidden rounded bg-slate-200/80 dark:bg-slate-700/80">
                            <div
                              className="h-full bg-slate-500/60 dark:bg-slate-400/60"
                              style={{ width: `${percentOfMax}%` }}
                              aria-hidden="true"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 py-2">
                          {niceSubtype(type)}
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-400 py-2">
                          {formatBytes(size)}
                        </TableCell>
                        <TableCell className="py-2 text-right whitespace-nowrap">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-500 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 size-8"
                            aria-label={`Open ${name}`}
                            onClick={() => url && window.open(url, "_blank", "noopener,noreferrer")}
                            title="Open preview"
                          >
                            <ExternalLink size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-500 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 size-8"
                            aria-label={`Download ${name}`}
                            onClick={() => downloadOne(entry)}
                            title="Download"
                          >
                            <Download size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-slate-500 dark:text-slate-400/80 hover:text-slate-800 dark:hover:text-slate-200 size-8"
                            aria-label={`Copy link for ${name}`}
                            onClick={() => copyLink(entry)}
                            title="Copy link"
                          >
                            {copied === entry.id ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-red-500/80 hover:text-red-600 dark:hover:text-red-500 size-8"
                            aria-label={`Remove ${name}`}
                            onClick={() => removeFile(entry.id)}
                            title="Remove"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            // Grid view
            <div
              className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
              role="grid"
              aria-label="Files grid"
            >
              {filtered.map((entry: UploadEntry) => {
                const name = getName(entry)
                const size = getSize(entry)
                const url = getPreviewUrl(entry)
                const isSelected = selected.has(entry.id)

                return (
                  <div
                    key={entry.id}
                    className={`group relative flex flex-col justify-between rounded-xl border bg-white p-3 text-sm shadow-sm transition-all hover:shadow-md dark:bg-slate-800 ${
                      isSelected
                        ? "border-cyan-500 ring-1 ring-cyan-500 dark:border-cyan-400 dark:ring-cyan-400"
                        : "border-slate-200 hover:border-cyan-300 dark:border-slate-700 dark:hover:border-cyan-700"
                    }`}
                    role="gridcell"
                    aria-selected={isSelected}
                    onClick={() => toggleOne(entry.id)}
                  >
                    {/* Selection checkbox */}
                    <div className="absolute right-2 top-2 z-10">
                      <input
                        type="checkbox"
                        className={`size-4 rounded border-slate-300 accent-cyan-600 dark:border-slate-600 dark:accent-cyan-500 ${
                          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                        } transition-opacity`}
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleOne(entry.id)
                        }}
                        aria-label={`Select ${name}`}
                      />
                    </div>

                    <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900">
                      {url &&
                      (getType(entry).startsWith("image/") ||
                        ["png", "jpg", "jpeg", "gif", "webp"].includes(getExt(name))) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={url}
                          alt={name}
                          className="size-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
                        />
                      ) : (
                        <div className="opacity-60 transition-opacity group-hover:opacity-100 scale-125">
                           {getFileIcon(entry)}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="truncate font-medium text-slate-700 dark:text-slate-200" title={name}>
                        {name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(size)}</p>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-white/90 via-white/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 dark:from-slate-900/90 dark:via-slate-900/60">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 bg-white/80 text-slate-600 hover:text-slate-900 shadow-sm dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-slate-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          downloadOne(entry)
                        }}
                        title="Download"
                      >
                        <Download size={14} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 bg-white/80 text-red-500 hover:text-red-700 shadow-sm dark:bg-slate-800/80 dark:text-red-400 dark:hover:text-red-300"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFile(entry.id)
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}