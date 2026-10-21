import React from 'react';
import { CheckCircle2, Printer, Coffee } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { CartItem, User } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  currentUser?: User | null;
  cartItems: CartItem[];
  total: number;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  customerName,
  currentUser,
  cartItems,
  total,
}) => {
  const currentDate = new Date().toLocaleString();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-6 shadow-2xl rounded-2xl">
        <DialogHeader className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <DialogTitle className="font-display text-2xl font-bold text-brand-brown">
            Official Receipt 🧾
          </DialogTitle>
          <div className="flex items-center justify-center gap-1.5 text-xs text-brand-coffee font-semibold">
            <Coffee className="h-3.5 w-3.5" />
            <span>Mr. Boy SpecialTea</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Dela Costa V, Burgos Montalban, Rodriguez Rizal
          </p>
        </DialogHeader>

        <div className="my-2 rounded-xl bg-slate-50 p-4 border border-dashed border-slate-300 space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-semibold">{currentDate}</span>
          </div>

          <div className="flex justify-between border-b pb-2">
            <span className="text-muted-foreground">Customer:</span>
            <span className="font-bold text-brand-brown">{customerName}</span>
          </div>

          {currentUser && (
            <div className="flex justify-between border-b pb-2 text-[11px]">
              <span className="text-muted-foreground">Account:</span>
              <span className="text-brand-coffee font-semibold">
                @{currentUser.username} ({currentUser.email})
              </span>
            </div>
          )}

          <div className="space-y-2 py-1">
            <div className="font-semibold text-muted-foreground uppercase text-[10px]">
              Itemized Order:
            </div>
            {cartItems.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold">
                  <span>{item.item} ({item.size})</span>
                  <span>₱{item.price}</span>
                </div>
                {item.addons.map((add, aIdx) => (
                  <div key={aIdx} className="flex justify-between pl-2 text-muted-foreground text-[11px]">
                    <span>+ {add.name}</span>
                    <span>₱{add.price}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="border-t-2 border-slate-400 pt-2 flex justify-between text-sm font-bold">
            <span className="text-brand-brown">TOTAL:</span>
            <span className="text-brand-orange text-base">₱{total.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-center text-xs text-green-700 font-semibold bg-green-50 p-2 rounded-lg">
          ✅ Order successfully saved to database! Thank you for your support.
        </div>

        <DialogFooter className="flex gap-2 sm:justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-1.5"
          >
            <Printer className="h-4 w-4" />
            Print Receipt
          </Button>

          <Button
            variant="brand"
            size="sm"
            onClick={onClose}
          >
            Close & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
