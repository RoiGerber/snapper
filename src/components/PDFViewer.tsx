import { Dialog } from "@headlessui/react"; // For modal functionality
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string;
  title: string;
}

export default function PDFViewer({ isOpen, onClose, fileUrl, title }: PDFViewerProps) {
  return (
    <>
      {isOpen && (
        <Dialog
          open={isOpen}
          onClose={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <Dialog.Panel className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-indigo-800">{title}</h3>
              <Button
                variant="ghost"
                className="text-gray-500 hover:text-gray-800"
                onClick={onClose}
              >
                סגור
              </Button>
            </div>
            <div className="h-[70vh]">
              <iframe
                src={fileUrl}
                title={title}
                className="w-full h-full rounded-lg"
                frameBorder="0"
              ></iframe>
            </div>
          </Dialog.Panel>
        </Dialog>
      )}
    </>
  );
}
