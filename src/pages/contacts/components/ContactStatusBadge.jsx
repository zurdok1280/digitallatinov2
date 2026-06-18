import React from "react";
import { CRM_STATUS_LABELS } from "../mockData";

const ContactStatusBadge = ({ status }) => {
  const label = CRM_STATUS_LABELS[status] || status;
  return (
    <span className={`crm-badge crm-badge--${status}`}>
      {label}
    </span>
  );
};

export default ContactStatusBadge;
