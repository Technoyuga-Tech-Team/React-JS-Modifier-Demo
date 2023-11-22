import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from './firebase';
import {getDocs,collection,doc,deleteDoc} from '@firebase/firestore'

const ItemList = () => {
    const [itemList, setItemList] = useState([]);

    const navigate = useNavigate();

    const fetchPost = async () => {
       
        await getDocs(collection(firestore, "items"))
            .then((querySnapshot)=>{               
                const newData = querySnapshot.docs
                    .map((doc) => ({...doc.data(), id:doc.id }));
                setItemList(newData);                
            })
    }
   
    useEffect(()=>{
        fetchPost();
    },[]);

    useEffect(()=>{
        console.log(itemList);
    },[itemList]);

    const handleDeleteItem=(itemDetails)=>{
         if(window.confirm(`Are you sure to delete item: ${itemDetails.item}`)){
            const ref=doc(firestore,"items",itemDetails.id);
            deleteDoc(ref)
            .then(()=>{fetchPost()})
            .catch((error)=>{
                console.log(error);
            });
         }
         else{
            return;
         }
    }

    return (
        <div style={{width:"50%"}}> 
                {itemList.length>0 &&
                <table style={{ width: "100%" }}>
                    <thead>
                    <tr>
                        <th>Sr.No</th>
                        <th>Item Name</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {itemList.map((el,i)=>{
                        return(
                            <tr key={el.id}>
                          <td>{i+1}</td>
                          <td>{el.item}</td>
                          <td>
                          <span onClick={()=>navigate("/add-item",{state:el})}>Edit</span>
                          <span onClick={()=>{handleDeleteItem(el)}}>Delete</span>
                          </td>

                        </tr>
                        );   
                    })}
                </tbody>
            </table>}
                
        </div>
    )
}

export default ItemList