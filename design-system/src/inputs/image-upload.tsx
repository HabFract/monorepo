import React, { useEffect, useState } from "react";
import { message, Upload } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
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
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
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
  defaultOptions?: Array<{
    src: string;
    alt: string;
  }>;
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
 */
const ImageUpload: React.FC<ImageUploadProps> = ({
  field,
  form: { touched, errors, setFieldValue, initialValues },
  uploadButton,
  clearButton,
  defaultOptions =  [
    { src: '/assets/icons/sphere-symbol-1.svg', alt: 'Symbol 1' },
    { src: '/assets/icons/sphere-symbol-2.svg', alt: 'Symbol 2' },
    { src: '/assets/icons/sphere-symbol-3.svg', alt: 'Symbol 3' },
    { src: '/assets/icons/sphere-symbol-4.svg', alt: 'Symbol 4' },
    { src: '/assets/icons/sphere-symbol-5.svg', alt: 'Symbol 5' },
  ],
  noDefaultImage = false
}) => {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);

  // Check if the form has been modified from initial values
  const isFormUnchanged = imageUrl === initialValues[field.name];

  useEffect(() => {
    if (field?.value && field.value !== DEFAULT_IMAGE) {
      setImageUrl(field.value);
      setCustom(true);
    } else if (!noDefaultImage) {
      setImageUrl(DEFAULT_IMAGE);
      setCustom(false);
      setFieldValue(field.name, DEFAULT_IMAGE);
    } else {
      setImageUrl("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgN0MzIDQuMjM4NTggNS4yMzg1OCAyIDggMkgxNC41ODRDMTQuODUwMyAyIDE1LjEwNTYgMi4xMDYyIDE1LjI5MzMgMi4yOTUwN0wyMC43MDkzIDcuNzQ0NDlDMjAuODk1NSA3LjkzMTg0IDIxIDguMTg1MjYgMjEgOC40NDk0MlYxN0MyMSAxOS43NjE0IDE4Ljc2MTQgMjIgMTYgMjJIOEM1LjIzODU4IDIyIDMgMTkuNzYxNCAzIDE3VjdaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8cGF0aCBkPSJNMTAgMTJMMTEuODk2IDkuMTU2MDFDMTEuOTQ1NSA5LjA4MTc5IDEyLjA1NDUgOS4wODE3OSAxMi4xMDQgOS4xNTYwMUwxNCAxMiIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPgo8cGF0aCBkPSJNMTIgMTBWMTUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPHBhdGggZD0iTTE1IDIuMjQxNDJDMTUgMi4xNTIzMyAxNS4xMDc3IDIuMTA3NzEgMTUuMTcwNyAyLjE3MDcxTDIwLjgyOTMgNy44MjkyOUMyMC44OTIzIDcuODkyMjkgMjAuODQ3NyA4IDIwLjc1ODYgOEgxOEMxNi4zNDMxIDggMTUgNi42NTY4NSAxNSA1VjIuMjQxNDJaIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K");
    }
  }, [field?.value, noDefaultImage]);

  const handleClear = () => {
    setImageUrl(noDefaultImage ? "" : DEFAULT_IMAGE);
    setCustom(false);
    setFieldValue(field.name, noDefaultImage ? "" : DEFAULT_IMAGE);
  };

  const handleChange: UploadProps["onChange"] = (
    info: UploadChangeParam<UploadFile>,
  ) => {
    if (info.file.status === "uploading") {
      setLoading(true);
      return;
    }
    if (info.file.status === "done") {
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setCustom(true);
        setImageUrl(url);
        setFieldValue(field.name, url);
      });
    }
  };

  const handleOptionSelect = (selectedImage: string) => {
    setImageUrl(selectedImage);
    setCustom(true);
    setFieldValue(field.name, selectedImage);
    setIsOptionsOpen(false);
  };

  const defaultUploadButton = (
    <Button 
      isLoading={loading} 
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
  const changedFromDefault = imageUrl && custom && imageUrl !== DEFAULT_IMAGE;

  return (
    <div className={!changedFromDefault ? "default-image" : "custom-image"}>
      <Upload
        name="avatar"
        listType="picture-circle"
        className="avatar-uploader"
        showUploadList={false}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        customRequest={dummyRequest as any}
      >
        {imageUrl ? (
          <div className="avatar-container">
            <img src={imageUrl} alt="avatar" style={{ width: "100%" }} />
            {React.cloneElement(uploadButton as React.ReactElement || defaultUploadButton, {
              isDisabled: isFormUnchanged,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setIsOptionsOpen(true);
              }
            })}
          </div>
        ) : (
          <div className="relative w-full h-full">
            {React.cloneElement(uploadButton as React.ReactElement || defaultUploadButton, {
              isDisabled: isFormUnchanged,
              onClick: (e: React.MouseEvent) => {
                e.stopPropagation();
                setIsOptionsOpen(true);
              }
            })}
          </div>
        )}
      </Upload>
      
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
              <div className="handle" {...bindDrag}>
                <span></span>
              </div>
              
              <div className="flex flex-col w-full h-screen gap-2">
                <h3 className="text-text dark:text-text-dark mt-2 text-base font-bold text-center">Choose Symbol</h3>
                <div className="grid w-full grid-cols-3 gap-4 px-2">
                  {defaultOptions.map((option, index) => (
                    <button
                      key={index}
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