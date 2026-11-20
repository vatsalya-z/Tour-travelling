"use client";

import React from "react";
import LeadEnquiryModal from "./LeadEnquiryModal";
import { EnquiryPackageInfo } from "@/types/lead";

export interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDestination?: string;
  packageInfo?: EnquiryPackageInfo;
}

/**
 * EnquiryModal
 * Professional multi-step tour enquiry & lead generation modal.
 * Preserves backward-compatibility while routing to LeadEnquiryModal.
 */
export default function EnquiryModal({
  isOpen,
  onClose,
  defaultDestination = "Kashmir",
  packageInfo,
}: EnquiryModalProps) {
  if (!isOpen) return null;

  return (
    <LeadEnquiryModal
      key={isOpen ? "lead-modal-open" : "lead-modal-closed"}
      isOpen={isOpen}
      onClose={onClose}
      defaultDestination={defaultDestination}
      packageInfo={packageInfo}
    />
  );
}
