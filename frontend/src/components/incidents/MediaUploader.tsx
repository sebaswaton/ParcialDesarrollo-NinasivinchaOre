import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import clsx from 'clsx';

interface Props {
  files: File[];
  onChange: (files: File[]) => void;
}

const MAX_FILES = 5;
const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
  'video/*': ['.mp4', '.mov', '.avi'],
  'audio/*': ['.mp3', '.wav', '.ogg', '.m4a'],
};

function fileLabel(type: string): string {
  if (type.startsWith('image')) return 'Imagen';
  if (type.startsWith('video')) return 'Video';
  return 'Audio';
}

export function MediaUploader({ files, onChange }: Props) {
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newFiles = [...files, ...accepted].slice(0, MAX_FILES);
      onChange(newFiles);
      const newPreviews = accepted.slice(0, MAX_FILES - files.length).map((file) => ({
        file,
        url: file.type.startsWith('image') ? URL.createObjectURL(file) : '',
      }));
      setPreviews((prev) => [...prev, ...newPreviews].slice(0, MAX_FILES));
    },
    [files, onChange]
  );

  const remove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: MAX_FILES - files.length,
    disabled: files.length >= MAX_FILES,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-500 hover:bg-gray-50',
          files.length >= MAX_FILES && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <p className="text-sm font-medium text-gray-600 mb-1">
          {isDragActive ? 'Suelta los archivos aquí' : 'Arrastra archivos o haz clic para seleccionar'}
        </p>
        <p className="text-xs text-gray-400">JPG, PNG, MP4, MP3, WAV — máx. {MAX_FILES} archivos</p>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map((file, i) => {
            const preview = previews[i];
            return (
              <div key={i} className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                {preview?.url ? (
                  <img src={preview.url} alt="" className="h-24 w-full object-cover" />
                ) : (
                  <div className="h-24 flex flex-col items-center justify-center gap-1 px-2">
                    <span className="text-xs font-semibold text-gray-500">{fileLabel(file.type)}</span>
                    <span className="text-xs text-gray-400 text-center truncate w-full">{file.name}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-600 leading-none"
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
