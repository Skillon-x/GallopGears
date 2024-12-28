import React from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';

const MODAL_TYPES = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    iconColor: 'text-green-500',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-red-100',
    iconColor: 'text-red-500',
    buttonColor: 'bg-red-500 hover:bg-red-600'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-orange-100',
    iconColor: 'text-orange-500',
    buttonColor: 'bg-orange-500 hover:bg-orange-600'
  },
  confirm: {
    icon: AlertCircle,
    bgColor: 'bg-primary/10',
    iconColor: 'text-primary',
    buttonColor: 'bg-primary hover:bg-primary/90'
  }
};

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'confirm',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  isLoading = false,
  showCancel = true,
  autoClose = false,
  autoCloseDelay = 3000
}) => {
  const modalType = MODAL_TYPES[type] || MODAL_TYPES.confirm;
  const Icon = modalType.icon;

  React.useEffect(() => {
    if (autoClose && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/30 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-tertiary/70 hover:text-tertiary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6">
            {/* Icon */}
            <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${modalType.bgColor}`}>
              <Icon className={`h-8 w-8 ${modalType.iconColor}`} />
            </div>

            {/* Content */}
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-tertiary">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-tertiary/70">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-center gap-3">
              {showCancel && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-tertiary bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {cancelText}
                </button>
              )}
              {onConfirm && (
                <button
                  onClick={onConfirm}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center gap-2 ${modalType.buttonColor}`}
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {confirmText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertModal; 