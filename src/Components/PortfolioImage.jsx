import { useState } from 'react';

function ImageWithFallback({ src, alt, className = '' }) {
    const [state, setState] = useState('loading');
    return (
        <div className={`image portfolio-image ${className}`}>
            {(!src || state !== 'loaded') && <span className="portfolio-image-fallback">{alt || 'Image unavailable'}</span>}
            {src && <img
                src={src}
                alt={alt || ''}
                loading="lazy"
                decoding="async"
                style={{ opacity: state === 'loaded' ? 1 : 0 }}
                onLoad={() => setState('loaded')}
                onError={() => setState('error')}
            />}
        </div>
    );
}

export default function PortfolioImage(props) {
    // Reset loading/error state when a saved record replaces its image.
    return <ImageWithFallback key={props.src || 'empty'} {...props} />;
}
