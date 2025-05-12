import { useState, useEffect } from 'react';

const useTypingAnimation = (texts, speed = 50) => {
  const [displayText, setDisplayText] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Reset state if texts change or are first provided
    setDisplayText([]);
    setCurrentIndex(0);
    setCurrentTextIndex(0);
    setIsComplete(false);
  }, [JSON.stringify(texts)]); // This will properly detect changes in the texts array

  useEffect(() => {
    if (!Array.isArray(texts) || texts.length === 0) {
      return;
    }
    
    // If we've gone through all the texts, we're done
    if (currentTextIndex >= texts.length) {
      setIsComplete(true);
      return;
    }

    const currentText = texts[currentTextIndex];
    
    if (currentIndex < currentText.length) {
      // Continue typing the current text
      const timeout = setTimeout(() => {
        setDisplayText(prev => {
          // Create a copy of the previous display texts
          const newDisplayText = [...prev];
          
          // Ensure we have an entry for the current text index
          if (!newDisplayText[currentTextIndex]) {
            newDisplayText[currentTextIndex] = '';
          }
          
          // Add the next character
          newDisplayText[currentTextIndex] += currentText.charAt(currentIndex);
          
          return newDisplayText;
        });
        
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else {
      // Move to next text after a delay
      const timeout = setTimeout(() => {
        if (currentTextIndex < texts.length - 1) {
          setCurrentTextIndex(prev => prev + 1);
          setCurrentIndex(0);
        } else {
          setIsComplete(true);
        }
      }, 800);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, currentTextIndex, texts, speed]);

  // Return the complete texts array once animation is done
  if (isComplete) {
    return texts;
  }
  
  // During animation, return what's been typed so far
  return displayText;
}

export default useTypingAnimation;