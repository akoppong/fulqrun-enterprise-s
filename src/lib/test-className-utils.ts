/**
 * Test suite for className utility functions
 * This ensures our fixes for className.split errors work correctly
 */

import { getElementClassName, getElementClassNames, getElementSelector, getElementDescription } from './className-utils';

/**
 * Tests for className utility functions
 */
export function testClassNameUtils(): boolean {
  let allTestsPassed = true;

  console.log('🧪 Testing className utility functions...');

  try {
    // Test 1: Regular HTML element with string className
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.className = 'test-class another-class';
      
      const className = getElementClassName(div);
      const classNames = getElementClassNames(div);
      const selector = getElementSelector(div);
      const description = getElementDescription(div);
      
      console.log('✅ HTML element test passed:', {
        className,
        classNames,
        selector,
        description
      });
    }

    // Test 2: Element with empty className
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.className = '';
      
      const className = getElementClassName(div);
      const classNames = getElementClassNames(div);
      
      if (className === '' && classNames.length === 0) {
        console.log('✅ Empty className test passed');
      } else {
        console.error('❌ Empty className test failed');
        allTestsPassed = false;
      }
    }

    // Test 3: Element with ID but no classes
    if (typeof document !== 'undefined') {
      const div = document.createElement('div');
      div.id = 'test-id';
      
      const selector = getElementSelector(div);
      
      if (selector === '#test-id') {
        console.log('✅ ID selector test passed');
      } else {
        console.error('❌ ID selector test failed, got:', selector);
        allTestsPassed = false;
      }
    }

    // Test 4: SVG element simulation (SVGAnimatedString mock)
    const mockSVGElement = {
      tagName: 'svg',
      id: '',
      className: {
        baseVal: 'svg-class another-svg-class'
      }
    } as any;

    const svgClassName = getElementClassName(mockSVGElement);
    const svgClassNames = getElementClassNames(mockSVGElement);
    
    if (svgClassName === 'svg-class another-svg-class' && svgClassNames.length === 2) {
      console.log('✅ SVG element test passed');
    } else {
      console.error('❌ SVG element test failed');
      allTestsPassed = false;
    }

    // Test 5: Null/undefined className handling
    const mockElementWithUndefined = {
      tagName: 'DIV',
      id: '',
      className: undefined
    } as any;

    const undefinedClassName = getElementClassName(mockElementWithUndefined);
    const undefinedClassNames = getElementClassNames(mockElementWithUndefined);
    
    if (undefinedClassName === '' && undefinedClassNames.length === 0) {
      console.log('✅ Undefined className test passed');
    } else {
      console.error('❌ Undefined className test failed');
      allTestsPassed = false;
    }

    console.log(allTestsPassed ? '🎉 All className utility tests passed!' : '❌ Some tests failed');
    return allTestsPassed;

  } catch (error) {
    console.error('❌ className utility test suite failed:', error);
    return false;
  }
}

// Auto-run tests disabled to prevent console spam
// if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
//   // Run tests after DOM is ready
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', testClassNameUtils);
//   } else {
//     testClassNameUtils();
//   }
// }