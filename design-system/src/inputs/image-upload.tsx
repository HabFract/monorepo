import React, { useEffect, useState } from "react";
import { message, Upload } from "antd";
import type { UploadChangeParam } from "antd/es/upload";
import type { RcFile, UploadFile, UploadProps } from "antd/es/upload/interface";
import '../common.css'
import { Button } from "../buttons";

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
  noDefaultImage = false
}) => {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

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

  const defaultUploadButton = (
    <Button 
      isLoading={loading} 
      type="button" 
      variant="neutral"
      isDisabled={isFormUnchanged}
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
console.log('isFormUnchanged :>> ', isFormUnchanged);
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
              isDisabled: isFormUnchanged
            })}
          </div>
        ) : (
          <div className="relative w-full h-full">
            {React.cloneElement(uploadButton as React.ReactElement || defaultUploadButton, {
              isDisabled: isFormUnchanged
            })}
          </div>
        )}
      </Upload>
      {changedFromDefault ? (
        <div onClick={handleClear}>
          {clearButton}
        </div>
      ) : <span></span>}
    </div>
  );
};

export default ImageUpload;