import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';
import { ImageInput } from '@/components/image-input';
import { useEffect, useState } from 'react';

const AvatarUpload = ({ value, onChange }) => {
  const [avatar, setAvatar] = useState(value || []);

  // Sync with value prop changes (like Formik setValues)
  useEffect(() => {
    setAvatar(value || []);
  }, [value]);

  const handleChange = (selectedAvatar) => {
    setAvatar(selectedAvatar);
    if (onChange) {
      onChange(selectedAvatar);
    }
  };


  return (
    <ImageInput value={avatar} onChange={handleChange}>
      {({ onImageUpload }) => (
        <div className="image-input size-16" onClick={onImageUpload}>
          <div
            className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -end-0.5 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              handleChange([]);
            }}
          >
            <KeenIcon icon="cross" />
          </div>
          <span className="tooltip" id="image_input_tooltip">Click to remove or revert</span>
          <div
            className="image-input-placeholder cursor-pointer rounded-full border-2 border-success image-input-empty:border-gray-300"
            style={{
              backgroundImage: `url(${toAbsoluteUrl(`/media/avatars/blank.png`)})`,
            }}
          >
            {avatar.length > 0 && <img src={avatar[0].dataURL} className='h-full object-fit-cover' alt="avatar" />}
          </div>
        </div>
      )}
    </ImageInput>
  );
};

export { AvatarUpload };
