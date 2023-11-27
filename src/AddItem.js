import logo from './logo.svg';
import './App.css';
import { useEffect, useState, useRef } from 'react';
import Switch from "react-switch";
import { Table } from 'react-bootstrap';
import ModifierTable from './ModifierTable';
import { firestore } from './firebase';
import { addDoc, doc, collection, updateDoc, getDocs } from '@firebase/firestore'
import { useLocation } from 'react-router-dom';
import ImageModal from './ImageModal';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { type } from '@testing-library/user-event/dist/type';




const AddItem = () => {
  const initialGroupData = {
    group: "",
    modifiers: [{ modifier_name: "", set_price: "" }],
    selectAs: "",
    enableModifier: false,
    required: false
  }

  const [itemData, setItemData] = useState({
    item: "",
    image: "",
    description: "",
    price: "",
    category: "",
    avail_stock_chk: false,
    popular_item_chk: false,
    // modifier_groups: []
  });
  const [groupList, setGroupList] = useState([]);
  const [groupData, setGroupData] = useState(initialGroupData);
  const [resetGroupData,setResetGroupData] = useState([]);
  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState();
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const imageRef = useRef(null);
  const [previewImage, setPreviewImage] = useState();
  const [imageBlob, setImageBlob] = useState();
  
  const location = useLocation();

  useEffect(() => {
    const data = location?.state;
    if (data) {
      let{modifier_groups, ...item_data} = data;
      setItemData(item_data);
      setGroupList(data.modifier_groups);
      setIsUpdatingItem(true);
    }
  }, [location?.state]);

  const insertModifier = () => {
    setGroupData((prevData) => ({
      ...prevData,
      modifiers: [...groupData.modifiers, { modifier_name: "", set_price: "" }]
    }));
  }

  const removeModifier = (index) => {
    const newModifiers = [...groupData.modifiers];
    newModifiers.splice(index, 1);
    setGroupData((prevData) => ({
      ...prevData,
      modifiers: newModifiers
    }))
  }

  const handleSaveModifier = async (e) => {
    e.preventDefault();
    if (!isUpdatingGroup && !groupList.some(el => el["group"] === groupData.group)) {
      const newGroupList = [...groupList];
      newGroupList.push({ "group": groupData.group, "modifiers": groupData.modifiers, "selectAs": groupData.selectAs, "enableModifier": groupData.enableModifier, "required": groupData.required });
      setGroupList(newGroupList);
      // setItemData((data) => ({
      //   ...data,
      //   modifier_groups: newGroupList
      // })); 
     setGroupData(initialGroupData);
    }
    else if (isUpdatingGroup) {
      console.log("updating group");
      const newGroupList = [...groupList];
      const objIndex = newGroupList.findIndex(obj => obj["group"] === editingGroup);
      newGroupList[objIndex]["group"] = groupData.group;
      newGroupList[objIndex]["modifiers"] = groupData.modifiers;
      newGroupList[objIndex]["selectAs"] = groupData.selectAs;
      newGroupList[objIndex]["enableModifier"] = groupData.enableModifier;
      newGroupList[objIndex]["required"] = groupData.required;
     
      setGroupList(newGroupList);
      // setItemData((data) => ({
      //   ...data,
      //   modifier_groups: newGroupList
      // }));
      setIsUpdatingGroup(false);
      setGroupData(initialGroupData);
    }
    else {
      alert("This group is already added");
    }
  }

  const handleEditGroup = (selectedGroup) => {
    setIsUpdatingGroup(true);
    const groupObject = groupList.find(el => el["group"] === selectedGroup);
    console.log(groupObject);
    setResetGroupData(groupObject);
    const groupModifiers = groupObject["modifiers"];
    const groupSelectAs = groupObject["selectAs"];
    const groupEnableModifier = groupObject["enableModifier"];
    const groupRequired = groupObject["required"];

    setGroupData({
      group: selectedGroup,
      modifiers: groupModifiers,
      selectAs: groupSelectAs,
      enableModifier: groupEnableModifier,
      required: groupRequired
    });
    setEditingGroup(selectedGroup);
  }

  const handleDeleteGroup = (selectedGroup) => {
    if (window.confirm(`Are you sure to delete group ${selectedGroup}`)) {
      const newGroupList = [...groupList];
      const objIndex = newGroupList.findIndex(el => el["group"] === selectedGroup);
      newGroupList.splice(objIndex, 1);
      setGroupList(newGroupList);
    }
    else {
      return;
    }
  }

  const handleClearStates = () => {
    if(isUpdatingGroup){
      console.log("not expected");
      setGroupData(resetGroupData);
    }
    else{
      console.log("clearing form");
      setGroupData(initialGroupData);
    }
      
    // setIsUpdatingGroup(false);
  }

  const handleChangeItemData = (e) => {
    const name = e.target.name;
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setItemData((data) => ({ ...data, [name]: value }));
  }

  const handleChangeGroupData = (e) =>{
   const name = e.target.name;
   const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
   setGroupData(data=>({...data, [name]:value}));
  }

  const fireStorageUpload = async () => {
    const storage = await getStorage();
    const metadata = {
        contentType: 'image/jpeg'
    };
    const storageRef = await ref(storage, `images/${Date.now()}`);
    try {
        const snapshot = await uploadBytesResumable(storageRef, imageBlob, metadata);
        const url = await getDownloadURL(snapshot.ref);

        const updatedItemData = {
            ...itemData,
            image: url,
        };
        setItemData(updatedItemData);

        return updatedItemData;
    } catch (error) {
        console.error('Error uploading image:', error);
        return itemData;
    }
}   

  const handleSaveItem = async () => {
   let data = await fireStorageUpload();
    
    try {
      if (isUpdatingItem) {
        const ref = doc(firestore, "items", data.id);

        updateDoc(ref, data)
          .then(() => { alert("item is updated successfully!"); })
          .catch(error => {
            console.log(error);
          });
            
          const colRef = collection(ref,"modifier_groups");
          const modifierDocs = (await getDocs(colRef)).docs
                                .map((group) => ({
                                  ...group.data(),
                                  id: group.id
                              }));
           modifierDocs.forEach((el)=>{
           const updatedGroup= groupList.find(group=> group.id===el.id);
           const docRef = doc(colRef,el.id);
           updateDoc(docRef,updatedGroup);
         })
          

      }
      else {
        // const itemDocRef= doc(firestore,"items",'item-id');
        // const colRef = collection(itemDocRef,"modifiers_collection");
        // groupList.forEach(async (el)=>{
        //   addDoc(colRef,el);
        // });
        

        const ref = collection(firestore, "items");
        addDoc(ref, data)
          .then(snapshot =>{
            const itemDocRef= doc(ref, snapshot.id);
            const colRef = collection(itemDocRef,"modifier_groups");
            groupList.forEach((el)=>{
              addDoc(colRef,el);
            });
          })
          .catch(error => {
            console.log(error);
          });
      }

    }
    catch (e) {
      console.log(e);
    }
   
  }


  return (
    <div className="container-style">
      <div className="item-container">
        <div className="header">
          Item Details
        </div>
        <div className="form-style">
          <form>
            <div className='image-upload'>
              <div className="image-preview" onClick={() => { imageRef.current.click() }}>
                {itemData.image ? <img src={itemData.image} alt="item" id="item-image" /> :
                  <div><i>Upload image here</i></div>}
                <input type="file" ref={imageRef} name="image" accept="image/png, image/jpeg,image/jpg" onChange={(e) => { setPreviewImage(URL.createObjectURL(e.target.files[0])) }} />

              </div>
            </div>

            <div>
              <label htmlFor="item-name">
                <span>Item Name</span>
                <input type="text" name="item" value={itemData.item} placeholder='Enter Item Name' onChange={handleChangeItemData} />
              </label>
            </div>

            <div className="description-style">
              <label htmlFor="description">Description  </label>
              <textarea name="description" value={itemData.description} placeholder="Description" rows="4" cols="50" onChange={handleChangeItemData} />
            </div>

            <div>
              <label htmlFor="price">
                <span>Price</span>
                <input type="number" name="price" value={itemData.price} placeholder="$" onChange={handleChangeItemData} />
              </label>
            </div>

            <div>
              <label htmlFor="category">
                <span>Category</span>
                <select name="category" onChange={handleChangeItemData}>
                  <option value={itemData?.category ?? ""}>{itemData?.category ?? "Select Category"}</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Pasta">Pasta</option>
                  <option value="Rice">Rice</option>
                  <option value="Burger">Burger</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </label>
            </div>
              
            <div>
              <label htmlFor="avail_stock_chk">
                <input type="checkbox" name="avail_stock_chk" checked={itemData.avail_stock_chk} onChange={handleChangeItemData} />
                <span>Available in Stock</span>
              </label>
            </div>

            <div>
              <label htmlFor="popular_item_chk">
                <input type="checkbox" name="popular_item_chk" checked={itemData.popular_item_chk} onChange={handleChangeItemData} />
                <span>Show in Popular Item</span>
              </label>
            </div>
          </form>
        </div>
      </div>

      <div>
        <div className="modifier-container">
          <div className="header">
            Modifier Group
          </div>
          <div className="form-style">
            <form onSubmit={(e) => handleSaveModifier(e)}>
              <div>
                <label htmlFor="group">
                  <span>Group Name</span>
                  <input type="text" name="group" value={groupData.group} onChange={handleChangeGroupData} required />
                </label>
              </div>
              {groupData.modifiers.map((mod, i) => {
                return (
                  <div className="modifier-space" key={i}>
                    <div className="modifier">
                      <label htmlFor={`modifier_name_${i}`} >Modifier Name</label>
                      <input type="text" name={`modifier_name_${i}`} value={mod.modifier_name} onChange={(e) => {
                        const newModifiers = [...groupData.modifiers];
                        newModifiers[i].modifier_name = e.target.value;
                        setGroupData((data)=>({...data, modifiers:newModifiers}));
                      }} required />
                    </div>

                    <div className="modifier">
                      <label htmlFor={`set_price_${i}`}>Set Price</label>
                      <input type="number" name={`set_price_${i}`} value={mod.set_price} onChange={(e) => {
                        const newModifiers = [...groupData.modifiers];
                        newModifiers[i].set_price = e.target.value;
                        setGroupData((data)=>({...data, modifiers:newModifiers}));
                      }} required />
                    </div>
                    <div style={{ display: "flex" }}>
                      {groupData.modifiers.length > 1 && <button type="button" onClick={() => removeModifier(i)}>Remove</button>}
                    </div>
                  </div>
                )
              })}

              <div className="button-add">
                <button type="button" onClick={insertModifier}>+Add</button>
              </div>

              <div>
                <span><b>Select as</b></span>
                <label htmlFor="selectAs">
                  <input type="radio" name="selectAs" value="single" checked={groupData.selectAs === "single"} onChange={handleChangeGroupData} />
                  <span>Single</span>
                  <input type="radio" name="selectAs" value="multiple" checked={groupData.selectAs === "multiple"} onChange={handleChangeGroupData} />
                  <span>Multiple</span>
                </label>
              </div>

              <div>
                <label htmlFor='enableModifier'>
                  <input type="checkbox" name="enableModifier" checked={groupData.enableModifier} onChange={handleChangeGroupData} />
                  <span>Enable Modifier</span>
                </label>

                <label htmlFor='required'>
                  <input type="checkbox" name="required" checked={groupData.required} onChange={handleChangeGroupData} />
                  <span>Required</span>
                </label>
              </div>
              <div>
                <button type="submit" >{!isUpdatingGroup ? "Save Modifier" : "Update Modifier"}</button>
                <button type="button" onClick={handleClearStates}>{!isUpdatingGroup ? "Clear" : "Reset"}</button>
              </div>
            </form>
          </div>
          {groupList.length > 0 && <ModifierTable groupList={groupList} editHandler={handleEditGroup} deleteHandler={handleDeleteGroup} />}
        </div>
        {<div>
          <button type="button" onClick={handleSaveItem}>{!isUpdatingItem ? "Save Item" : "Update Item"}</button>
        </div>}
      </div>
      {previewImage && <ImageModal previewImage={previewImage} setPreviewImage={setPreviewImage} setItemData={setItemData} setImageBlob={setImageBlob} />}
    </div>
  );
}

export default AddItem