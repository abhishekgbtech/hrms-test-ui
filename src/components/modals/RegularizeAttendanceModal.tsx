"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "../ui/Dialog";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/Textarea";
import { Input } from "../ui/Input";
import { DatePicker } from "../ui/DatePicker";
import { MapPin } from "../icons";

interface RegularizeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegularizeAttendanceModal: React.FC<RegularizeAttendanceModalProps> = ({ isOpen, onClose }) => {
  const [punchInDate, setPunchInDate] = useState<Date | undefined>(new Date());
  const [punchInTime, setPunchInTime] = useState("10:00");
  const [punchOutDate, setPunchOutDate] = useState<Date | undefined>(new Date());
  const [punchOutTime, setPunchOutTime] = useState("18:30");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState("Fetching current location...");

  useEffect(() => {
    if (isOpen) {
      setLocation("Fetching current location...");
      
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Attempt reverse geocoding using OpenStreetMap (Nominatim)
              // Note: In a production app, use a dedicated backend service or Google Maps API with a key.
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              
              if (data && data.display_name) {
                setLocation(data.display_name);
              } else {
                setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              }
            } catch (error) {
              console.error("Failed to fetch address:", error);
              // Fallback address
              setLocation("349,Senapati Bapat Marg,Lower Parel,Mumbai,Mumbai City,Konkan Division,Maharashtra,India,400013");
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            // Fallback address on permission denied or error
            setLocation("349,Senapati Bapat Marg,Lower Parel,Mumbai,Mumbai City,Konkan Division,Maharashtra,India,400013");
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        setLocation("349,Senapati Bapat Marg,Lower Parel,Mumbai,Mumbai City,Konkan Division,Maharashtra,India,400013");
      }
    }
  }, [isOpen]);

  const handleAdd = () => {
    // Handle submission logic here
    console.log("Regularize Request:", {
        punchIn: { date: punchInDate, time: punchInTime },
        punchOut: { date: punchOutDate, time: punchOutTime },
        reason,
        location
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-normal text-slate-600 dark:text-slate-300">
            Add Request For Regularize Attendance
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Punch In Time */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-200">Punch In Time</Label>
            <div className="flex gap-2">
               <div className="flex-1">
                   <DatePicker date={punchInDate} setDate={setPunchInDate} />
               </div>
               <Input 
                 type="time" 
                 value={punchInTime} 
                 onChange={(e) => setPunchInTime(e.target.value)}
                 className="w-24"
               />
            </div>
          </div>

          {/* Punch Out Time */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-200">Punch Out Time</Label>
            <div className="flex gap-2">
               <div className="flex-1">
                   <DatePicker date={punchOutDate} setDate={setPunchOutDate} />
               </div>
               <Input 
                 type="time" 
                 value={punchOutTime} 
                 onChange={(e) => setPunchOutTime(e.target.value)}
                 className="w-24"
               />
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <Label className="text-slate-700 dark:text-slate-200">Reason</Label>
            <Textarea 
              placeholder="Missing Punch Reason" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="resize-none"
            />
          </div>

          {/* Location */}
          <div className="space-y-2 pt-2">
            <Label className="text-slate-900 dark:text-slate-100 font-bold">Your Current Location:</Label>
            <div className="flex gap-2 items-start text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-md border border-slate-100 dark:border-slate-700">
                <MapPin size={18} className={`mt-0.5 shrink-0 ${location.includes("Fetching") ? "animate-bounce text-cyan-500" : "text-slate-500"}`} />
                <p className="leading-relaxed break-words">{location}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-20" onClick={handleAdd}>
            Add
          </Button>
          <DialogClose asChild>
            <Button variant="outline" className="w-20">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
