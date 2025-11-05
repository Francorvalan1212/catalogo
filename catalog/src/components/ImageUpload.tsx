import React, { useState, useRef } from 'react';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

// Función para comprimir imágenes
const comprimirImagen = (file: File, maxWidth: number = 800, calidad: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen comprimida
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir a JPEG comprimido
        const imagenComprimida = canvas.toDataURL('image/jpeg', calidad);
        
        console.log(`Imagen comprimida: ${(imagenComprimida.length / 1024).toFixed(2)}KB`);
        resolve(imagenComprimida);
      };
      
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
};

// Función para validar archivo
const validarArchivo = (file: File): string | null => {
  // Validar tipo
  if (!file.type.startsWith('image/')) {
    return 'Solo se permiten archivos de imagen';
  }
  
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    return 'La imagen es demasiado grande. Máximo 5MB.';
  }
  
  return null;
};

export const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onChange, 
  maxImages = 5 
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) return;

    setUploading(true);

    try {
      const newImages: string[] = [];
      const filesToProcess = Math.min(files.length, remainingSlots);
      const errores: string[] = [];

      for (let i = 0; i < filesToProcess; i++) {
        const file = files[i];
        
        // Validar archivo
        const error = validarArchivo(file);
        if (error) {
          errores.push(`${file.name}: ${error}`);
          continue;
        }

        try {
          // Comprimir imagen antes de agregar
          const imagenComprimida = await comprimirImagen(file, 800, 0.7);
          newImages.push(imagenComprimida);
        } catch (error) {
          console.error('Error comprimiendo imagen:', error);
          errores.push(`${file.name}: Error al procesar la imagen`);
        }
      }

      // Agregar imágenes comprimidas
      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
      }

      // Mostrar errores si los hay
      if (errores.length > 0) {
        alert(`Algunas imágenes no se pudieron procesar:\n${errores.join('\n')}`);
      }

    } catch (error) {
      console.error('Error procesando imágenes:', error);
      alert('Error al procesar las imágenes');
    } finally {
      setUploading(false);
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Calcular tamaño total de imágenes
  const calcularTamañoTotal = () => {
    const totalBytes = images.reduce((total, image) => total + (image.length * 3) / 4, 0);
    return (totalBytes / 1024 / 1024).toFixed(2); // MB
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-300">
          Imágenes de la Camiseta
        </label>
        {images.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Tamaño total: {calcularTamañoTotal()}MB
          </span>
        )}
      </div>

      {/* Upload Area */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer ${
            dragOver
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
          } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={uploading ? undefined : openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="flex flex-col items-center">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Comprimiendo imágenes...
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Por favor espera
                </p>
              </>
            ) : (
              <>
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Subir Imágenes
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  Arrastra y suelta las imágenes aquí o haz clic para seleccionar
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Máximo {maxImages} imágenes • PNG, JPG, JPEG • Máx. 5MB c/u
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  ({images.length}/{maxImages} imágenes subidas)
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden aspect-square"
            >
              <img
                src={image}
                alt={`Imagen ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 shadow-lg"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>

              {/* Image number indicator */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-medium">
                {index + 1}
              </div>

              {/* Image size indicator */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {((image.length * 3) / 4 / 1024).toFixed(1)}KB
              </div>
            </div>
          ))}

          {/* Add more button */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={openFileDialog}
              disabled={uploading}
              className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-all duration-200 group ${
                uploading
                  ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-400'
              }`}
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              ) : (
                <>
                  <Plus className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-sm font-medium">Agregar más</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <ImageIcon className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-semibold mb-1">Consejos para mejores imágenes:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Las imágenes se comprimen automáticamente a 800px de ancho máximo</li>
              <li>La primera imagen será la principal del catálogo</li>
              <li>Incluye diferentes ángulos de la camiseta</li>
              <li>Máximo 5MB por imagen (se comprimen a ~100-300KB)</li>
              <li>Total recomendado: menos de 1MB para todas las imágenes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Warning if total size is too large */}
      {parseFloat(calcularTamañoTotal()) > 1 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <p className="font-semibold">Advertencia: Las imágenes son muy grandes</p>
              <p>El tamaño total ({calcularTamañoTotal()}MB) puede causar errores. Considera eliminar algunas imágenes o usar imágenes más pequeñas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};