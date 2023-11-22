import React, { useEffect, useMemo } from 'react';

const ModifierTable = ({ groupList,editHandler,deleteHandler }) => {

    return (
        <table style={{ width: "100%" }}>
            <thead>
                <tr>
                    <th>Sr.No.</th>
                    <th>Group</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {groupList.map((el, i) => {
                    return (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{el["group"]}</td>
                            <td>
                                <span onClick={(e)=>{e.preventDefault(); editHandler(el["group"])}}> Edit</span>
                                <span onClick={(e)=>{e.preventDefault(); deleteHandler(el["group"])}}>Delete</span>

                            </td>
                        </tr>
                    )
                })}
            </tbody>

        </table>
    )
}

export default ModifierTable