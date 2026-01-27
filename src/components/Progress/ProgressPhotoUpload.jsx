import React, { useState } from 'react';

export default function ProgressPhotoUpload({ onFileChange, previewFoto, loading, yaRegistrado }) {
  return (
    <div className="w-full flex flex-col items-center">
      <label htmlFor="progress-photo-input" className="font-bold text-blue-400">Seleccionar foto (debug)</label>
      <input
        id="progress-photo-input"
        type="file"
        accept="image/*"
        onChange={e => {
          const file = e.target.files[0];
          console.log('ProgressPhotoUpload input onChange, file:', file);
          if (onFileChange) onFileChange(file);
        }}
        className="mt-2 mb-2 text-xs text-gray-300 bg-yellow-200 border border-red-500"
        // disabled={loading || yaRegistrado}
        style={{ zIndex: 1000, position: 'relative' }}
      />
      {previewFoto && (
        <img
          src={previewFoto}
          alt="Foto progreso"
          className="w-full h-60 object-cover rounded-xl shadow-lg border-2 border-blue-400"
          style={{ maxWidth: '90%' }}
        />
      )}
    </div>
  );
}
