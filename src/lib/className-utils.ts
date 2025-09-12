/**
 * Utility functions for safely handling className properties across different element types
 */

/**
 * Safely extracts className string from an element, handling both HTML and SVG elements
 * @param element - DOM Element with potential className property
 * @returns string representation of className
 */
export function getElementClassName(element: Element): string {
  if (!element.className) return '';
  
  // Handle both HTMLElement.className (string) and SVGElement.className (SVGAnimatedString)
  if (typeof element.className === 'string') {
    return element.className;
  }
  
  // For SVG elements, className is an SVGAnimatedString
  if (element.className && 'baseVal' in element.className) {
    return (element.className as any).baseVal || '';
  }
  
  return '';
}

/**
 * Safely splits className into an array, handling edge cases
 * @param element - DOM Element with potential className property
 * @returns array of class names
 */
export function getElementClassNames(element: Element): string[] {
  const className = getElementClassName(element);
  return className ? className.split(' ').filter(c => c.length > 0) : [];
}

/**
 * Creates a CSS selector from element's classes
 * @param element - DOM Element
 * @returns CSS selector string
 */
export function getElementSelector(element: Element): string {
  if (element.id) return `#${element.id}`;
  
  const classes = getElementClassNames(element);
  if (classes.length > 0) return `.${classes[0]}`;
  
  return element.tagName.toLowerCase();
}

/**
 * Gets a description of an element for debugging purposes
 * @param element - DOM Element
 * @returns string description
 */
export function getElementDescription(element: Element): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : '';
  const classes = getElementClassNames(element);
  const classStr = classes.length > 0 ? `.${classes.join('.')}` : '';
  
  return `${tag}${id}${classStr}`.substring(0, 50);
}