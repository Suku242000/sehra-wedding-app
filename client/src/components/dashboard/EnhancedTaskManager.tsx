import React from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import TaskManager from './TaskManager';
import MobileChecklist from '../checklist/MobileChecklist';

const EnhancedTaskManager: React.FC = () => {
  // Using media query to detect mobile devices
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  return (
    <>
      {isMobile ? (
        <MobileChecklist />
      ) : (
        <TaskManager />
      )}
    </>
  );
};

export default EnhancedTaskManager;