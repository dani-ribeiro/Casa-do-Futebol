import React, { useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';

function ImageWithLoading({ src, alt, className, id }) {
  const [loaded, setLoaded] = useState(false);

  // load the real image when ready, otherwise display a spinner
  const handleLoad = () => {
    setLoaded(true);
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      {!loaded && 
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      }
      <img
        src={src}
        alt={alt}
        className={className}
        id={id}
        onLoad={handleLoad}
        style={{ display: loaded ? 'block' : 'none' }}
      />
    </div>
  );
}

export default ImageWithLoading;