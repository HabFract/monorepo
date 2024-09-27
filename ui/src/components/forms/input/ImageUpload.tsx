import React, { useEffect, useState } from 'react';
import { LoadingOutlined, PlusCircleFilled, PlusOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import type { RcFile, UploadFile, UploadProps } from 'antd/es/upload/interface';

import { createAvatar } from '@dicebear/core';
import { icons } from '@dicebear/collection';

const getBase64 = (img: RcFile, callback: (url: string) => void) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result as string));
  reader.readAsDataURL(img);
};

const beforeUpload = (file: RcFile) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }
  return isJpgOrPng && isLt2M;
};

const ImageUpload = ({
  field,
  form: { touched, errors, setFieldValue, values },
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const [custom, setCustom] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>(field?.value || "");

  useEffect(() => {
    if(field?.value && Object.values(touched).length == 0) {
      // Then we are editing an existing value, don't seed one
      setImageUrl(field.value)
      return;
    }
    const avatar = createAvatar(icons, {
      "seed": "Annie" + values.name,
      backgroundColor: ["6B7D7F"],
      // shape3Color: ["50e3c2", "004955", "6B7D7F"],
      // shape2Color: ["36195b", "transparent"],
      // shape1Color: ["transparent"],
      translateX: -10,
      translateY: 20
    });
    const url = avatar.toDataUri();
    setFieldValue(field.name, url);
    setImageUrl(url)
  }, [values.name])

  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setCustom(true);
        setImageUrl(url);
        setFieldValue(field.name, url);
      });
    }
  };

  const uploadButton = (
    <div className='absolute z-10 top-4 left-4 text-gray-500 '>
      <div className='upload-img-btn absolute z-10 cursor-pointer bg-gray-500 opacity-75 text-white rounded-full p-2 transition-all duration-300'>Upload
        <span className="rounded-xl text-primary bg-secondary ml-2">{loading ? <LoadingOutlined /> : <PlusCircleFilled />}</span>
      </div>
    </div>
  );
  const dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  const showSeeded = true;
  return (
    <Upload
      name="avatar"
      listType="picture-circle"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
      customRequest={dummyRequest as any}
    >
      {imageUrl && (custom || showSeeded) ? <div className='relative w-full h-full overflow-hidden'><img src={imageUrl} alt="avatar" style={{ width: '100%' }} /><div className='absolute w-8 h-4 top-1 left-1'>{uploadButton}</div></div> : <div className='relative w-full h-full'>{uploadButton}</div>}
    </Upload>
  );
};

export default ImageUpload;