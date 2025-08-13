import React, { useRef, useEffect, useState } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import Paragraph from "@editorjs/paragraph";
import ImageTool from "@editorjs/image";
import Quote from "@editorjs/quote";

export default function EditorComponent({ data, onChange }) {
  const ejInstance = useRef(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!ejInstance.current) {
      ejInstance.current = new EditorJS({
        holder: "editorjs",
        data,
        autofocus: true,
        tools: {
          header: Header,
          paragraph: Paragraph,
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: "YOUR_API_ENDPOINT_TO_UPLOAD_IMAGE", // Configurer côté backend ou Supabase Storage
                byUrl: "YOUR_API_ENDPOINT_TO_UPLOAD_IMAGE",
              },
            },
          },
          quote: Quote,
        },
        onChange: async () => {
          const savedData = await ejInstance.current.save();
          onChange(savedData);
        },
      });
      setIsReady(true);
    }

    return () => {
      ejInstance.current?.destroy();
      ejInstance.current = null;
    };
  }, []);

  return (
    <div
      id="editorjs"
      style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "5px" }}
    />
  );
}
