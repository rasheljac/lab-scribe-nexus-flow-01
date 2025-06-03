
import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  className = ""
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize the editor content only once
  useEffect(() => {
    if (!isInitialized && quillRef.current && value) {
      console.log("Initializing RichTextEditor with value:", value);
      const quill = quillRef.current.getEditor();
      if (quill) {
        // Set content without triggering change events
        quill.clipboard.dangerouslyPasteHTML(value);
        setIsInitialized(true);
      }
    }
  }, [value, isInitialized]);

  // Custom image handler for uploading to Supabase storage
  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file || !user) return;

      try {
        // Create a unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/rich-text/${Date.now()}.${fileExt}`;

        // Upload to Supabase storage
        const { error: uploadError } = await supabase.storage
          .from('rich-text-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage
          .from('rich-text-images')
          .getPublicUrl(fileName);

        // Insert the image into the editor
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const range = quill.getSelection();
          quill.insertEmbed(range?.index || 0, 'image', data.publicUrl);
        }

        toast({
          title: "Success",
          description: "Image uploaded successfully",
        });
      } catch (error) {
        console.error('Error uploading image:', error);
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
        });
      }
    };
  };

  const handleChange = (content: string) => {
    console.log("ReactQuill onChange triggered:", content);
    onChange(content);
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote', 'code-block'],
        ['link', 'image'],
        [{ 'formula': true }],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'script',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
    'formula'
  ];

  console.log("Rendering RichTextEditor");

  return (
    <div className={className}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        defaultValue={value || ""}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        style={{ 
          minHeight: '150px',
          backgroundColor: 'white'
        }}
      />
    </div>
  );
};

export default RichTextEditor;
