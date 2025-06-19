// frontend/src/hooks/useScrollSpy.ts

import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(
  sectionIds: string[],
  offset: number = 0
): string {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observer.current) {
      observer.current.disconnect();
    }

    // Use IntersectionObserver for performance
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // The rootMargin shifts the "intersection" point.
        // A negative top margin means the section becomes "active"
        // shortly after its top edge enters the screen.
        rootMargin: `-${offset}px 0px 0px 0px`,
        threshold: 0.2, // Trigger when 20% of the section is visible
      }
    );

    const { current: currentObserver } = observer;

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        currentObserver.observe(element);
      }
    });

    return () => currentObserver.disconnect();
  }, [sectionIds, offset]);

  return activeId;
}
