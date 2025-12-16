'use client';

// ==============================================
// TRIPZY - Toast Notification System
// ==============================================

import { create } from 'zustand';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

// -------------------- Toast Types --------------------

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

// -------------------- Toast Store --------------------

export const useToastStore = create<ToastState>((set) => ({
    toasts: [],

    addToast: (toast) => {
        const id = Math.random().toString(36).substring(7);
        const newToast = { ...toast, id };

        set((state) => ({
            toasts: [...state.toasts, newToast],
        }));

        // Auto-remove after duration
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }));
        }, toast.duration || 5000);
    },

    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
}));

// -------------------- Toast Component --------------------

const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return <CheckCircle className="text-success-600" size={20} />;
        case 'error':
            return <XCircle className="text-error-600" size={20} />;
        case 'warning':
            return <AlertCircle className="text-warning-600" size={20} />;
        case 'info':
            return <Info className="text-primary-600" size={20} />;
    }
};

const getToastStyles = (type: ToastType) => {
    switch (type) {
        case 'success':
            return 'bg-success-50 border-success-200';
        case 'error':
            return 'bg-error-50 border-error-200';
        case 'warning':
            return 'bg-warning-50 border-warning-200';
        case 'info':
            return 'bg-primary-50 border-primary-200';
    }
};

// -------------------- Toast Container --------------------

export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-up ${getToastStyles(toast.type)}`}
                >
                    <ToastIcon type={toast.type} />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{toast.title}</p>
                        {toast.message && (
                            <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
                        )}
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
}

// -------------------- Helper Functions --------------------

export const toast = {
    success: (title: string, message?: string) => {
        useToastStore.getState().addToast({ type: 'success', title, message });
    },
    error: (title: string, message?: string) => {
        useToastStore.getState().addToast({ type: 'error', title, message });
    },
    warning: (title: string, message?: string) => {
        useToastStore.getState().addToast({ type: 'warning', title, message });
    },
    info: (title: string, message?: string) => {
        useToastStore.getState().addToast({ type: 'info', title, message });
    },
};
