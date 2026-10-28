"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Plus } from "../icons";

interface FloatingNavProps {
    onAddClick?: () => void;
}

const FloatingNav: React.FC<FloatingNavProps> = ({ onAddClick }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100]">
            <button 
                type="button"
                onClick={onAddClick}
                className="flex items-center justify-center w-14 h-14 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full shadow-lg shadow-cyan-900/20 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 active:scale-95"
                aria-label="Add Task"
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>
        </div>,
        document.body
    );
}

export default FloatingNav;