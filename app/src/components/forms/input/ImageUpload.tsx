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
  useEffect(() => {
    const avatar = createAvatar(icons, {
      "seed": "Annie" + values.name,
      backgroundColor: ["6B7D7F"],
      // shape3Color: ["50e3c2", "004955", "6B7D7F"],
      // shape2Color: ["36195b", "transparent"],
      // shape1Color: ["transparent"],
      translateX: -10,
      translateY: 20
    });
    const url = avatar.toDataUriSync();
    setFieldValue(field.name, url);
    setImageUrl(url)
  }, [values.name])
  
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();
  const handleChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    if (info.file.status === 'uploading') {
      setLoading(true);
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      getBase64(info.file.originFileObj as RcFile, (url) => {
        setLoading(false);
        setImageUrl(url);
        setFieldValue(field.name, url);
      });
    }
  };

  const uploadButton = (
    <div className='absolute z-10 top-2 left-5 text-gray-500 '>
      <div className='upload-img-btn absolute bg-secondary text-white hover:bg-secondary rounded-full p-2 transition-all duration-300'>Upload
        <span className="rounded-xl text-primary bg-secondary">{loading ? <LoadingOutlined /> : <PlusCircleFilled />}</span>
      </div>
    </div>
  );

  return (
    <Upload
      name="avatar"
      listType="picture-circle"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <div className='relative w-full h-full'><img src={imageUrl} alt="avatar" style={{ width: '100%' }} />{uploadButton}</div> : uploadButton}
    </Upload>
  );
};

export default ImageUpload;