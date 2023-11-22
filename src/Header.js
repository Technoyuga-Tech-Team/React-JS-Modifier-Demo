import React from 'react';
import { NavLink } from "react-router-dom";

const Header = () => {
    return (
        <nav>
            <NavLink
                to="/"
                className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""
                }
            >
               Home
            </NavLink>

            <NavLink
                to="/item-list"
                className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""
                }
            >
                Item List
            </NavLink>

            <NavLink
                to="/add-item"
                className={({ isActive, isPending }) =>
                    isPending ? "pending" : isActive ? "active" : ""
                }
            >
                Add Item
            </NavLink>
        </nav>
    );
}

export default Header