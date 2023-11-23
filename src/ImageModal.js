import React, { useState, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Cropper from 'react-easy-crop';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import getCroppedImg from './cropImage';

const ImageModal = ({ previewImage, setPreviewImage, setItemData, setImageBlob }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState({ width: 0, height: 0, x: 0, y: 0 });

    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, []);

    const saveCroppedImage = async () => {
        try {
          const blobObj = await getCroppedImg(
            previewImage,
            croppedAreaPixels,
            rotation
          );
       
          setImageBlob(blobObj);
          const croppedImage = await URL.createObjectURL(blobObj);
          setItemData((data)=>({...data, image:croppedImage}));
          setPreviewImage(null);
        } catch (e) {
          console.error(e)
        }
      }


    return (
        <Modal show={true} onHide={()=>setPreviewImage(null)} size='md'>
            <Modal.Header>
                <Modal.Title>Crop the Image</Modal.Title>
                {/* <span className="close-button" onClick={() => handleCloseFullScreen(false)}>
        &#10006; 
      </span> */}
            </Modal.Header>


            <Modal.Body>
                <div className='crop-container'>
                    <Cropper
                        image={previewImage}
                        crop={crop}
                        rotation={rotation}
                        zoom={zoom}
                        aspect={1}
                        showGrid={false}
                        onCropChange={setCrop}
                        onRotationChange={setRotation}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />

                </div>
                <div>
                    <label htmlFor='Zoom'>
                        <span>Zoom</span>
                        <input
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        aria-labelledby="Zoom"
                        onChange={(e) => {
                            setZoom(e.target.value)
                        }}
                    />
                    </label>  
                    <label htmlFor='Rotation'>
                        <span>Rotation</span>
                        <input
                        type="range"
                          value={rotation}
                          min={0}
                          max={360}
                          step={1}
                          aria-labelledby="Rotation"
                          onChange={(e) => setRotation(e.target.value)}
                    />
                    </label>  
                </div>
                <div>
                    <button type="button" onClick={saveCroppedImage}>Save Image</button>
                    <button type="button" onClick={()=>setPreviewImage(null)}>Close</button>
                </div>

            </Modal.Body>

        </Modal>
    );
}

export default ImageModal