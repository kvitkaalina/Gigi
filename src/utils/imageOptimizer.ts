export const optimizeImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Максимальные размеры для Instagram-подобных изображений
        const MAX_WIDTH = 1080;
        const MAX_HEIGHT = 1350;
        
        let width = img.width;
        let height = img.height;
        
        // Вычисляем новые размеры, сохраняя пропорции
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в JPEG с качеством 0.8
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              reject(new Error('Failed to optimize image'));
            }
          },
          'image/jpeg',
          0.8
        );
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
  });
};

export const validateImage = async (file: File): Promise<boolean> => {
  // Проверяем тип файла
  const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG or GIF image.');
  }

  // Проверяем размер файла (максимум 20MB)
  const maxSize = 20 * 1024 * 1024; // 20MB в байтах
  if (file.size > maxSize) {
    throw new Error('File is too large. Maximum size is 20MB.');
  }

  // Проверяем размеры изображения
  const dimensions = await getImageDimensions(file);
  const minDimension = 320; // минимальная ширина/высота
  if (dimensions.width < minDimension || dimensions.height < minDimension) {
    throw new Error(`Image is too small. Minimum dimension is ${minDimension}px.`);
  }

  return true;
}; 