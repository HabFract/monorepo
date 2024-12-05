import React, { useEffect, useState } from "react";
import { message } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import { ImageUpload as Upload } from "@cherrypulp/image-upload";
import '../common.css'
import { Button } from "../buttons";
import { SwipeUpScreenTab } from "../controls";
import { motion } from "framer-motion";

/**
 * Converts a file to base64 string
 * @param {RcFile} img - The image file to convert
 * @param {Function} callback - Callback function to handle the converted base64 string
 */
const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

/**
 * Validates the file before upload
 * @param {RcFile} file - The file to validate
 * @returns {boolean} Whether the file is valid
 */
const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG file!");
    return false;
  }
  
  // 512KB = 512 * 1024 bytes
  const isLt512KB = file.size / 1024 < 512;
  if (!isLt512KB) {
    message.error("Image must be smaller than 512KB!");
    return false;
  }
  
  return isJpgOrPng && isLt512KB;
};

/** Default avatar image in base64 format */
const DEFAULT_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDIiIGhlaWdodD0iNDIiIHZpZXdCb3g9IjAgMCA0MiA0MiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgY2xpcC1wYXRoPSJ1cmwoI2NsaXAwXzI0M18zNjY5KSI+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgcng9IjIxIiBmaWxsPSIjMjEzMjMwIi8+CjxwYXRoIGQ9Ik03IDM3LjYzOTZDNyAzMi41NTE5IDExLjUwNjIgMjguNjQzNyAxNi41NDI3IDI5LjM2MzJMMTkuNDU2NiAyOS43Nzk1QzIwLjQ4MDMgMjkuOTI1OCAyMS41MTk3IDI5LjkyNTggMjIuNTQzNCAyOS43Nzk1TDI1LjQ1NzMgMjkuMzYzMkMzMC40OTM5IDI4LjY0MzcgMzUgMzIuNTUxOSAzNSAzNy42Mzk2QzM1IDQyLjI1NjkgMzEuMjU2OSA0NiAyNi42Mzk2IDQ2SDE1LjM2MDRDMTAuNzQzMSA0NiA3IDQyLjI1NjkgNyAzNy42Mzk2WiIgZmlsbD0iIzAyQjE5NyIvPgo8Y2lyY2xlIGN4PSIyMSIgY3k9IjIwIiByPSI2IiBmaWxsPSIjMDJCMTk3Ii8+CjwvZz4KPHJlY3QgeD0iMC41IiB5PSIwLjUiIHdpZHRoPSI0MSIgaGVpZ2h0PSI0MSIgcng9IjIwLjUiIHN0cm9rZT0iIzAyQjE5NyIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPgo8ZGVmcz4KPGNsaXBQYXRoIGlkPSJjbGlwMF8yNDNfMzY2OSI+CjxyZWN0IHdpZHRoPSI0MiIgaGVpZ2h0PSI0MiIgcng9IjIxIiBmaWxsPSJ3aGl0ZSIvPgo8L2NsaXBQYXRoPgo8L2RlZnM+Cjwvc3ZnPgo=";

interface ImageUploadProps {
  field: {
    name: string;
    value: string;
  };
  form: {
    touched: Record<string, boolean>;
    errors: Record<string, string>;
    setFieldValue: (field: string, value: any) => void;
    initialValues: Record<string, any>;
  };
  uploadButton?: React.ReactNode;
  clearButton?: React.ReactNode;
  noDefaultImage?: boolean;
  defaultImage?: string;
  defaultOptions?: Array<{
    src: string;
    alt: string;
  }>;
}
interface UploadChangeInfo {
  file: {
    originFileObj?: File;
    status?: string;
  };
  fileList: any[];
}
/**
 * ImageUpload Component
 * 
 * A form component for handling image uploads with preview and clear functionality.
 * Integrates with Formik for form state management.
 * 
 * @param {Object} field - Formik field object
 * @param {Object} form - Formik form object
 * @param {ReactNode} uploadButton - Custom upload button component
 * @param {ReactNode} clearButton - Custom clear button component
 * @param {boolean} noDefaultImage - Whether to show default image when no image is uploaded
 * @param {string} defaultImage - Provide a base64 default image
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  field,
  form: { touched, errors, setFieldValue, initialValues },
  uploadButton,
  clearButton,
  defaultOptions,
  defaultImage = DEFAULT_IMAGE,
  noDefaultImage = false
}) => {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  const convertImageToBase64 = async (imageUrl: string): Promise<string> => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert to base64
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return imageUrl;
    }
  };

  useEffect(() => {
    const initializeImage = async () => {
      // If there's no field value, use the default image
      if (!field?.value) {
        try {
          setLoading(true);
          // Convert default image to base64 if it's not already a data URI
          if (!defaultImage.startsWith('data:')) {
            const base64Image = await convertImageToBase64(defaultImage);
            setImageUrl(base64Image);
            setCustom(false);
            setFieldValue(field.name, base64Image);
          } else {
            setImageUrl(defaultImage);
            setCustom(false);
            setFieldValue(field.name, defaultImage);
          }
        } catch (error) {
          console.error('Error initializing default image:', error);
        } finally {
          setLoading(false);
        }
      }
      // If there's an existing value
      else {
        setImageUrl(field.value);
        setCustom(true);
      }
    };
    initializeImage();
  }, [field?.value, defaultImage, setFieldValue]);

  // Check if the form has been modified from initial values
  const isFormUnchanged = imageUrl === initialValues[field.name];

  useEffect(() => {
    // If there's no field value or it's the same as defaultImage
    if (!field?.value || field.value === defaultImage) {
      setImageUrl(defaultImage);
      setCustom(false);
      setFieldValue(field.name, defaultImage); // Ensure the form field is set
    }
    // If there's a different value
    else {
      setImageUrl(field.value);
      setCustom(true);
    }
  }, [field?.value, defaultImage, setFieldValue]);

  const handleClear = () => {
    setImageUrl(noDefaultImage ? "" : defaultImage);
    setCustom(false);
    setFieldValue(field.name, noDefaultImage ? "" : defaultImage);
  };

  const handleOptionSelect = async (selectedImage: string) => {
    setLoading(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      setImageUrl(base64Image);
      setCustom(true);
      setFieldValue(field.name, base64Image);
    } catch (error) {
      console.error('Error handling image selection:', error);
      message.error('Failed to process image');
    } finally {
      setLoading(false);
      setIsOptionsOpen(false);
    }
  };


  const defaultUploadButton = (
    <Button
      isLoading={loading}
      className="mt-4 ml-4"
      type="button"
      variant="neutral"
      isDisabled={isFormUnchanged}
      onClick={() => setIsOptionsOpen(true)}
    >
      Choose Symbol
    </Button>
  );

  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const changedFromDefault = imageUrl && custom && imageUrl !== defaultImage;

  const handleFileChange = (file: File | Blob) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const url = reader.result as string;
      setLoading(false);
      setCustom(true);
      setImageUrl(url);
      setFieldValue(field.name, url);
    });
    reader.readAsDataURL(file);
  };


  return (
    <div className={!changedFromDefault ? "default-image" : "custom-image"}>
      <div className="avatar-container">
        <Upload
          src={imageUrl}
          aspect={1}
          onChange={(info: UploadChangeInfo) => {
            if (info.file.status === "uploading") {
              setLoading(true);
              return;
            }
            // If the file was rejected due to size/type
            if (info.file.status === "error") {
              setLoading(false);
              return;
            }
          
            // Double-check size here as well
            if (info.file.originFileObj && info.file.originFileObj.size / 1024 > 512) {
              setLoading(false);
              message.error("Image must be smaller than 512KB!");
              return;
            }
            
            if (info.file.status === "done" && info.file.originFileObj) {
              handleFileChange(info.file.originFileObj);
            }
          }}
          maxSize={1}
          uploadOptions={{
            listType: "picture-circle",
            showUploadList: false,
            beforeUpload,
            customRequest: dummyRequest
          }}
          cropOptions={{ rotate: false }}
        >
        </Upload>
        {React.cloneElement(uploadButton as React.ReactElement || defaultUploadButton, {
          isDisabled: isFormUnchanged,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsOptionsOpen(true);
          }
        })}
      </div>

      {changedFromDefault && (
        <div onClick={handleClear}>
          {clearButton}
        </div>
      )}

      {isOptionsOpen && (
        <SwipeUpScreenTab
          verticalOffset={50} // This means it starts 50vh from the top
          useViewportHeight={true}
          onExpansionChange={(expanded) => {
            if (!expanded) setIsOptionsOpen(false);
          }}
        >
          {({ bindDrag }) => (
            <div className="bg-surface dark:bg-surface-top-dark p-4 rounded-t-3xl min-h-[50vh]"> {/* Added min-height */}
              <motion.div className="handle" {...bindDrag}>
                <span></span>
              </motion.div>

              <div className="flex flex-col w-full h-screen gap-2 pt-4">
                <h3 className="text-text dark:text-text-dark z-20 mt-2 text-base font-bold text-center">Choose Symbol</h3>
                <div className="z-20 grid w-full grid-cols-3 gap-4 px-2">
                  {defaultOptions?.map((option, index) => (
                    <button
                      key={index}
                      type="button"
                      className="aspect-square hover:bg-surface-elevated-dark flex items-center justify-center w-full p-2 transition-colors rounded-lg"
                      onClick={() => handleOptionSelect(option.src)}
                    >
                      <div className="aspect-square relative w-full">
                        <img
                          src={option.src}
                          alt={option.alt}
                          className="absolute inset-0 object-contain w-full h-full"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </SwipeUpScreenTab>
      )}
    </div>
  );
};

export default ImageUpload;