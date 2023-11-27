import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { firestore } from './firebase';
import { getDocs, collection, doc, deleteDoc } from '@firebase/firestore';

const ItemList = () => {
    const [itemList, setItemList] = useState([]);
    const navigate = useNavigate();

    const fetchPost = async () => {
        const itemColRef = collection(firestore, "items");
        try {
            const querySnapshot = await getDocs(itemColRef);
            const itemDocs = querySnapshot.docs;

            const itemDetailsArray = await Promise.all(
                itemDocs.map(async (document) => {
                    const item_details = { ...document.data(), id: document.id };

                    const docRef = doc(itemColRef, document.id);
                    const snapshot = await getDocs(collection(docRef, "modifier_groups"));

                    const modifier_groups = snapshot.docs.map((group) => ({
                        ...group.data(),
                        id: group.id
                    }));

                    item_details["modifier_groups"] = modifier_groups;
                    return item_details;
                })
            );

            setItemList(itemDetailsArray);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchPost();
    }, []);

    const handleDeleteItem = async (itemDetails) => {
        if (window.confirm(`Are you sure to delete item: ${itemDetails.item}`)) {
            const ref = doc(firestore, "items", itemDetails.id);

            try {
                await deleteDoc(ref);
                const colRef = collection(ref,"modifier_groups");
                const modifierDocs = (await getDocs(colRef)).docs
                .map((group) => ({
                  ...group.data(),
                  id: group.id
              }));
              modifierDocs.forEach((el)=>{
                const docRef = doc(colRef,el.id);
                deleteDoc(docRef);
              });
                setItemList((prevData) => prevData.filter((item) => item.id !== itemDetails.id));
            } catch (error) {
                console.log(error);
            }
        } else {
            return;
        }
    };

    return (
        <div style={{ width: "50%" }}>
            {itemList.length > 0 && (
                <table style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Item Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemList.map((el, i) => {
                            return (
                                <tr key={el.id}>
                                    <td>{i + 1}</td>
                                    <td>{el.item}</td>
                                    <td>
                                        <span onClick={() => navigate("/add-item", { state: el })}>Edit</span>
                                        <span onClick={() => { handleDeleteItem(el) }}>Delete</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ItemList;
