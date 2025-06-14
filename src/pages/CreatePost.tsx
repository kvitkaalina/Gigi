import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatePost.module.css';
import { postService } from '../services';

const CreatePost: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [caption, setCaption] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      await postService.createPost(formData);
      navigate('/');
    } catch (error: any) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.createPostCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Create New Post</h1>
          <button onClick={handleBack} className={styles.backButton}>
            Back →
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div
            className={styles.uploadArea}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            {preview ? (
              <img src={preview} alt="Preview" className={styles.previewImage} />
            ) : (
              <div>
                <img src="/images/img.png" alt="Upload" className={styles.uploadIcon} />
                <p className={styles.uploadText}>
                  Drag and drop your image here, or click to select
                </p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <textarea
            className={styles.caption}
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />
          {error && <div className={styles.error}>{error}</div>}
          <button
            className={styles.shareButton}
            type="submit"
            disabled={!image || isSubmitting}
          >
            {isSubmitting ? 'Sharing...' : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost; 