import logo from './logo.svg';
import './App.css';
import { useEffect, useState,useRef } from 'react';
import Switch from "react-switch";
import { Table } from 'react-bootstrap';
import ModifierTable from './ModifierTable';
import { firestore } from './firebase';
import { addDoc, doc, collection, updateDoc } from '@firebase/firestore'
import { useLocation } from 'react-router-dom';
import ImageModal from './ImageModal';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { type } from '@testing-library/user-event/dist/type';




const AddItem = () => {
  
  const [itemData, setItemData] = useState({
    item: "",
    image: "",
    description: "",
    price: "",
    category: "",
    avail_stock_chk: false,
    popular_item_chk: false,
    modifier_groups: []
  });
  const [groupList, setGroupList] = useState([]);
  const [group, setGroup] = useState();
  const [modifierList, setModifierList] = useState([
    {
      modifier_name: "",
      set_price: ""
    }
  ]);
  const [selectAs, setSelectAs] = useState();
  const [enableModifier_chk, setEnableModifier_chk] = useState(false);
  const [required_chk, setRequired_chk] = useState(false);
  // const [groupData, setGroupData] =useState({
  //   group:"",
  //   modifiers:[{modifier_name:"",set_price:""}],
  //   selectAs:"",
  //   enableModifier_chk:false,
  //   required_chk:false
  //   });

  const [isUpdatingGroup, setIsUpdatingGroup] = useState(false);
  const [editingGroup, setEditingGroup] = useState();
  const [isUpdatingItem, setIsUpdatingItem] = useState(false);
  const imageRef =useRef(null);
  const [previewImage, setPreviewImage] = useState();
  const [imageBlob, setImageBlob]= useState();
  


  const location = useLocation();

  useEffect(() => {
    const data = location?.state;
    if (data) {
      setItemData(data);
      setGroupList(data.modifier_groups);
      setIsUpdatingItem(true);
    }
  }, [location?.state]);

  useEffect(()=>{
    console.log(itemData);
  },[itemData]);


  const insertModifier = () => {
    // setGroupData((prevData)=>({
    //   ...prevData,
    //   modifiers:[...groupData.modifiers,{modifier_name: "", set_price: "" }]
    // }));
    const newModifierList = [...modifierList, { modifier_name: "", set_price: "" }];
    setModifierList(newModifierList);
  }

  const removeModifier = (index) => {
    const newModifierList = [...modifierList];
    newModifierList.splice(index, 1);
    setModifierList(newModifierList);
    // const newModifiers = [...groupData.modifiers];
    // newModifiers.splice(index, 1);
    // setGroupData((prevData)=>({
    //   ...prevData,
    //   modifiers: newModifiers
    // }))

  }

  const handleSaveModifier = async (e) => {
    e.preventDefault();


    if (!isUpdatingGroup && !groupList.some(el => el["group"] === group)) {
      const newGroupList = [...groupList];
      newGroupList.push({ "group": group, "modifiers": modifierList, "selectAs": selectAs, "enableModifier": enableModifier_chk, "required": required_chk });
      setGroupList(newGroupList);
      setItemData((data) => ({
        ...data,
        modifier_groups: newGroupList
      }));

      handleClearStates();
    }
    else if (isUpdatingGroup) {
      const newGroupList = [...groupList];
      const objIndex = newGroupList.findIndex(obj => obj["group"] === editingGroup);
      newGroupList[objIndex]["group"] = group;
      newGroupList[objIndex]["modifiers"] = modifierList;
      newGroupList[objIndex]["selectAs"] = selectAs;
      newGroupList[objIndex]["enableModifier"] = enableModifier_chk;
      newGroupList[objIndex]["required"] = required_chk;

      setGroupList(newGroupList);
      setItemData((data) => ({
        ...data,
        modifier_groups: newGroupList
      }));

      handleClearStates();

    }
    else {
      alert("This group is already added");
    }
  }

  const handleEditGroup = (selectedGroup) => {
    setIsUpdatingGroup(true);
    const groupObject = groupList.find(el => el["group"] === selectedGroup);
    const groupModifiers = groupObject["modifiers"];
    const groupSelectAs = groupObject["selectAs"];
    const groupEnableModifier = groupObject["enableModifier"];
    const groupRequired = groupObject["required"];

    setGroup(selectedGroup);
    setModifierList(groupModifiers);
    setSelectAs(groupSelectAs);
    setEnableModifier_chk(groupEnableModifier);
    setRequired_chk(groupRequired);
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
    setGroup("");
    setModifierList([
      {
        modifier_name: "",
        set_price: ""
      }
    ]);
    setSelectAs(null);
    setEnableModifier_chk(false);
    setRequired_chk(false);
    setIsUpdatingGroup(false);
  }

  const handleChangeItemData = (e) => {
    const name = e.target.name;
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setItemData((data) => ({ ...data, [name]: value }));
  }
 
  const fireStorageUpload =async ()=>{
    const storage = await getStorage();    
    const metadata = {
      contentType: 'image/jpeg'
    };
    const storageRef =await  ref(storage, `images/${Date.now()}`);
    await uploadBytesResumable(storageRef, imageBlob, metadata)
    .then((snapshot) => {
      console.log("uploaded");
      getDownloadURL(snapshot.ref).then((url) => {
        setItemData((data) => ({
          ...data,
          image: url,
        }));
      });
    });

  } 

  const handleSaveItem = async () => {
    await fireStorageUpload();
    
    let data = itemData;
    try {
      if (isUpdatingItem) {
        const ref = doc(firestore, "items", data.id);

        updateDoc(ref, data)
          .then(() => { alert("item is updated successfully!"); })
          .catch(error => {
            console.log(error);
          });
      }
      else {
        const ref = collection(firestore, "items");
        addDoc(ref, data)
          .then(response => { alert("item is Added successfully!"); })
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
              <div className="image-preview" onClick={()=>{imageRef.current.click()}}>
                {itemData.image ? <img src={itemData.image} alt="item" id="item-image"/> :
                 <div><i>Upload image here</i></div>}
                <input type="file" ref={imageRef} name="image" accept="image/png, image/jpeg,image/jpg" onChange={(e)=>{setPreviewImage(URL.createObjectURL(e.target.files[0]))}} />

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
                  <input type="text" name="group" value={group} onChange={(e) => setGroup(e.target.value)} required />
                </label>
              </div>
              {modifierList.map((mod, i) => {
                return (
                  <div className="modifier-space" key={i}>
                    <div className="modifier">
                      <label htmlFor={`modifier_name_${i}`} >Modifier Name</label>
                      <input type="text" name={`modifier_name_${i}`} value={mod.modifier_name} onChange={(e) => {
                        const newModifierList = [...modifierList];
                        newModifierList[i].modifier_name = e.target.value;
                        setModifierList(newModifierList);
                      }} required />
                    </div>

                    <div className="modifier">
                      <label htmlFor={`set_price_${i}`}>Set Price</label>
                      <input type="number" name={`set_price_${i}`} value={mod.set_price} onChange={(e) => {
                        const newModifierList = [...modifierList];
                        newModifierList[i].set_price = e.target.value;
                        setModifierList(newModifierList);
                      }} required />
                    </div>
                    <div style={{ display: "flex" }}>
                      {modifierList.length > 1 && <button type="button" onClick={() => removeModifier(i)}>Remove</button>}
                    </div>
                  </div>
                )
              })}

              <div className="button-add">
                <button type="button" onClick={insertModifier}>+Add</button>
              </div>

              <div>
                <span><b>Select as</b></span>
                <label htmlFor="selection">
                  <input type="radio" name="selection" value="single" checked={selectAs === "single"} onChange={(e) => setSelectAs(e.target.value)} />
                  <span>Single</span>
                  <input type="radio" name="selection" value="multiple" checked={selectAs === "multiple"} onChange={(e) => setSelectAs(e.target.value)} />
                  <span>Multiple</span>
                </label>
              </div>
                 
              <div>
                <label htmlFor='enable_modifier'>
                  <input type="checkbox" name="enable_modifier" checked={enableModifier_chk} onChange={() => setEnableModifier_chk(!enableModifier_chk)} />
                  <span>Enable Modifier</span>
                </label>

                <label htmlFor='required'>
                  <input type="checkbox" name="required" checked={required_chk} onChange={() => setRequired_chk(!required_chk)} />
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
      {previewImage && <ImageModal previewImage={previewImage} setPreviewImage={setPreviewImage} setItemData={setItemData} setImageBlob={setImageBlob}/>}
    </div>
  );
}

export default AddItem