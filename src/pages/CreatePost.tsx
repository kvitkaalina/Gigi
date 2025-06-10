import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import styles from './CreatePost.module.css';
import defaultPost from '../assets/default-post.svg';
import { postService } from '../services';

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(defaultPost);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);

      await postService.createPost(formData);
      navigate('/');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error('Error creating post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createPost}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Create New Post</h1>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div 
              className={styles.imageUpload}
              onClick={() => fileInputRef.current?.click()}
            >
              <img 
                src={preview} 
                alt="Preview" 
                className={styles.preview}
              />
              <div className={styles.uploadOverlay}>
                <i className="fas fa-camera"></i>
                <span>Click to upload image</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className={styles.fileInput}
              />
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className={styles.caption}
              maxLength={2200}
            />

            {error && <div className={styles.error}>{error}</div>}

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !image}
            >
              {loading ? 'Creating...' : 'Share'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreatePost; 