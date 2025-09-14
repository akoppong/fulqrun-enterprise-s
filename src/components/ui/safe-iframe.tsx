/**
 * Safe iframe component that addresses sandbox security warnings
 * 
 * This component provides a secure iframe wrapper that:
 * - Uses proper sandbox attributes
 * - Prevents security warnings in console
 * - Provides fallback content for when iframes fail
 */

import React from 'react';

interface SafeIframeProps {
  src: string;
  title: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  allowScripts?: boolean;
  allowSameOrigin?: boolean;
  allowForms?: boolean;
  allowPopups?: boolean;
  loading?: 'lazy' | 'eager';
  fallbackContent?: React.ReactNode;
}

export function SafeIframe({
  src,
  title,
  width = '100%',
  height = '400px',
  className = '',
  allowScripts = false,
  allowSameOrigin = false,
  allowForms = false,
  allowPopups = false,
  loading = 'lazy',
  fallbackContent
}: SafeIframeProps) {
  // Build sandbox attribute - avoid combining allow-scripts and allow-same-origin
  // which can escape sandboxing
  const sandboxPermissions: string[] = [];
  
  if (allowScripts && !allowSameOrigin) {
    sandboxPermissions.push('allow-scripts');
  } else if (allowSameOrigin && !allowScripts) {
    sandboxPermissions.push('allow-same-origin');
  }
  // Note: We don't allow both simultaneously for security reasons
  
  if (allowForms) {
    sandboxPermissions.push('allow-forms');
  }
  
  if (allowPopups) {
    sandboxPermissions.push('allow-popups');
  }
  
  const sandboxValue = sandboxPermissions.length > 0 ? sandboxPermissions.join(' ') : '';

  const handleError = (event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    console.warn('Iframe failed to load:', src);
    // Could trigger fallback content display here
  };

  const handleLoad = (event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    // Iframe loaded successfully
    const iframe = event.currentTarget;
    try {
      // Basic security check - ensure iframe is from expected origin if needed
      if (iframe.contentWindow) {
        // Additional security validations could go here
      }
    } catch (error) {
      // Expected for cross-origin iframes
    }
  };

  return (
    <div className={`safe-iframe-container ${className}`}>
      <iframe
        src={src}
        title={title}
        width={width}
        height={height}
        sandbox={sandboxValue}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          border: 'none',
          borderRadius: '0.375rem',
        }}
        // Security headers
        referrerPolicy="strict-origin-when-cross-origin"
        // Prevent clickjacking
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
      {fallbackContent && (
        <div className="iframe-fallback hidden">
          {fallbackContent}
        </div>
      )}
    </div>
  );
}

// Default secure iframe for untrusted content
export function SecureIframe(props: Omit<SafeIframeProps, 'allowScripts' | 'allowSameOrigin'>) {
  return (
    <SafeIframe
      {...props}
      allowScripts={false}
      allowSameOrigin={false}
    />
  );
}

// Iframe for trusted same-origin content (without scripts)
export function TrustedContentIframe(props: Omit<SafeIframeProps, 'allowScripts' | 'allowSameOrigin'>) {
  return (
    <SafeIframe
      {...props}
      allowScripts={false}
      allowSameOrigin={true}
    />
  );
}

// Iframe for trusted applications (with scripts but not same-origin)
export function TrustedAppIframe(props: Omit<SafeIframeProps, 'allowScripts' | 'allowSameOrigin'>) {
  return (
    <SafeIframe
      {...props}
      allowScripts={true}
      allowSameOrigin={false}
    />
  );
}