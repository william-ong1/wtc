"use client";

import { useState, ReactNode } from "react";

interface DragAndDropProps {
  onFileDrop: (file: File) => void;
  children: ReactNode;
  className?: string;
  uploadBoxClassName?: string;
  dropMessageClassName?: string;
  dropMessage?: string;
  disabled?: boolean;
}

const DragAndDrop = ({
  onFileDrop,
  children,
  className = "",
  uploadBoxClassName = "inset-0 bg-[#101827] backdrop-blur-md z-50 flex items-center justify-center upload-box rounded-2xl",
  dropMessageClassName = "bg-white/10 p-8 rounded-2xl border-2 border-dashed border-white/50 text-white text-lg",
  dropMessage = "Drop your image here",
  disabled = false
}: DragAndDropProps) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    
    setIsDragging(false);

    // Get the drop target element
    const dropTarget = e.target as HTMLElement;
    const uploadBox = dropTarget.closest('.upload-box');
    
    // Only process the drop if it's in the upload box
    if (!uploadBox) return;

    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    onFileDrop(file);
  };

  return (
    <div
      className={className}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragging ? (
        <div className={uploadBoxClassName}>
          <div className={dropMessageClassName}>
            {dropMessage}
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  );
};

export default DragAndDrop; 