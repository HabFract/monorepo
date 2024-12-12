import React, { useEffect, useState } from "react";
import { message } from "antd";
import type { RcFile } from "antd/es/upload/interface";
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
const UPLOAD_IMAGE = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik0xNC4yNSAySDhDNS4yMzg1OCAyIDMgNC4yMzg1OCAzIDdWMTdDMyAxOS43NjE0IDUuMjM4NTggMjIgOCAyMkgxNkMxOC43NjE0IDIyIDIxIDE5Ljc2MTQgMjEgMTdWOC43NUgxOEMxNS45Mjg5IDguNzUgMTQuMjUgNy4wNzEwNyAxNC4yNSA1VjJaTTE1Ljc1IDVWMi44MTA2NkwyMC4xODkzIDcuMjVIMThDMTYuNzU3NCA3LjI1IDE1Ljc1IDYuMjQyNjQgMTUuNzUgNVpNMTIuNzI4IDguNzM5OThDMTIuMzgxNyA4LjIyMDQ3IDExLjYxODMgOC4yMjA0NyAxMS4yNzIgOC43Mzk5OEw5LjM3NTk2IDExLjU4NEM5LjE0NjIgMTEuOTI4NiA5LjIzOTMzIDEyLjM5NDMgOS41ODM5NyAxMi42MjRDOS45Mjg2MiAxMi44NTM4IDEwLjM5NDMgMTIuNzYwNyAxMC42MjQgMTIuNDE2TDExLjI1IDExLjQ3NzFWMTVDMTEuMjUgMTUuNDE0MiAxMS41ODU4IDE1Ljc1IDEyIDE1Ljc1QzEyLjQxNDIgMTUuNzUgMTIuNzUgMTUuNDE0MiAxMi43NSAxNVYxMS40NzcxTDEzLjM3NiAxMi40MTZDMTMuNjA1NyAxMi43NjA3IDE0LjA3MTQgMTIuODUzOCAxNC40MTYgMTIuNjI0QzE0Ljc2MDcgMTIuMzk0MyAxNC44NTM4IDExLjkyODYgMTQuNjI0IDExLjU4NEwxMi43MjggOC43Mzk5OFoiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC44KSIvPgo8L3N2Zz4K";

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
  defaultImage: string;
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
  defaultImage,
}) => {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
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
    const setInitial = async () => {
      const defaultB64 = await convertImageToBase64(defaultImage)
      if (field.value == '') {
        setFieldValue(field.name, defaultB64);
        setCustom(false);
      }
    }
    setInitial()
  }, [field.value, defaultImage, setFieldValue]);

  const handleClear = () => {
    setCustom(false);
    setFieldValue(field.name, defaultImage);
  };

  const handleOptionSelect = async (selectedImage: string) => {
    setLoading(true);
    try {
      const base64Image = await convertImageToBase64(selectedImage);
      setFieldValue(field.name, base64Image);
      setCustom(true);
    } catch (error) {
      console.error('Error handling image selection:', error);
      message.error('Failed to process image');
    } finally {
      setLoading(false);
      setIsOptionsOpen(false);
    }
  };

  const handleFileChange = (file: File | Blob) => {
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const url = reader.result as string;
      setLoading(false);
      setCustom(true);
      setFieldValue(field.name, url);
    });
    reader.readAsDataURL(file);
  };



  const defaultUploadButton = (
    <Button
      isLoading={loading}
      className="mt-4 ml-4"
      type="button"
      variant="neutral"
      isDisabled={false}
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

  return (
    <div className={!custom ? "default-image" : "custom-image"}>
      <div className="avatar-container">
        <Upload
          src={custom ? field.value : UPLOAD_IMAGE}
          aspect={1}
          onChange={(info: UploadChangeInfo) => {
            if (info.file.status === "uploading") {
              setLoading(true);
              return;
            }
            if (info.file.status === "error") {
              setLoading(false);
              return;
            }
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
          isDisabled: false,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation();
            setIsOptionsOpen(true);
          }
        })}
      </div>

      {custom && (
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
            <div className="bg-surface dark:bg-overlay-tab p-4 rounded-t-3xl min-h-[50vh]"> {/* Added min-height */}
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