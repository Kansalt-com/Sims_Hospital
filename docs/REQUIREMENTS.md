# SIMS Hospital Application Requirements

## 1. Purpose

This document defines the business and functional requirements for the SIMS Hospital application. It covers the current scope of the hospital management system and the additional requested enhancements that should be included in future planning and delivery.

The application is intended to support daily hospital operations across OPD, IPD, billing, prescriptions, reporting, user administration, and deployment-ready operations for a multi-user healthcare environment.

## 2. Product Goal

The goal of the system is to provide a unified hospital management platform that:

- registers and manages patients
- handles OPD and IPD workflows
- supports consultation, billing, prescriptions, and payments
- tracks bed allocation and discharge
- provides doctor, billing, reception, and admin workflows
- produces operational and financial reports

## 3. User Roles

The system shall support at least the following roles:

- Admin
- Reception
- Doctor
- Billing
- Pharmacy
- Lab Technician

Each role shall see only the modules and actions permitted for that role.

## 4. Current Functional Scope

### 4.1 Authentication and Access Control

- Users shall log in with username and password.
- The system shall support password change enforcement for new or reset users.
- The system shall use role-based access control.
- The system shall maintain audit logs for key actions such as authentication, billing changes, visit changes, and IPD actions.

### 4.2 Patient Management

- The system shall register new patients.
- The system shall generate and maintain a unique MRN for each patient.
- The system shall store patient demographic details including name, age or DOB, gender, phone, address, and ID proof.
- The system shall allow patient search by name, phone, MRN, or ID proof.
- The patient delete action in the UI shall behave as a safe delete for active lists while preserving linked medical and billing history in the database.

### 4.3 OPD Visit Management

- The system shall create OPD visits for registered patients.
- Each visit shall be associated with a doctor.
- The system shall support visit statuses such as scheduled, in progress, completed, and cancelled.
- The system shall allow notes, diagnosis, and prescription details to be added to the visit.

### 4.4 IPD Admission Management

- The system shall admit patients to IPD directly or via OPD-to-IPD transfer.
- The system shall assign rooms and beds based on actual availability.
- The system shall prevent oversubscription of beds.
- The system shall allow discharge workflow and release beds back to available status.
- The dashboard IPD count shall allow users to view the currently admitted patients list.

### 4.5 Billing and Invoicing

- The system shall create invoices for OPD, IPD, pharmacy, lab, and general billing cases.
- The system shall support itemized billing.
- The system shall support open billing, allowing charges to be appended to an existing visit bill over time.
- The system shall support split payments.
- Supported payment modes shall include cash, UPI, card, and insurance.
- The system shall calculate subtotal, discounts, taxes, total, paid amount, and due amount.
- The system shall support print-ready billing formats.
- The billing workflow shall support imported SIMS price masters for lab tests, X-ray, ultrasound, ward procedures, bed charges, and surgery package charges.
- The billing layout shall support bill heads reflected in the provided bill format, including doctor charges, bed charges, diagnostics, ward procedures, surgery package, surgeon fees, anesthetist fees, OT assistant charges, and medicines or consumables where applicable.

### 4.6 Prescription Workflow

- Doctors shall be able to create and update prescriptions.
- Prescription generation shall be linked with the patient visit.
- The system shall support a printable prescription or case-sheet output.
- Prescription release may depend on billing completion rules.

### 4.7 Doctor and Staff Administration

- The system shall maintain doctor and staff user records.
- The system shall allow admins to create, disable, and manage users.
- The system shall maintain doctor profile data.

### 4.8 Rooms and Beds

- The system shall maintain room and bed master data.
- Beds shall support statuses such as available, occupied, maintenance, and reserved.
- IPD admission and discharge shall update bed occupancy status automatically.

### 4.9 Reports and Dashboard

- The system shall provide dashboard widgets for revenue, bed occupancy, appointments, doctor availability, OPD volume, and IPD admissions.
- The system shall provide operational and financial reporting.
- The system shall support doctor-wise and department-wise reporting where data is available.

### 4.10 Hospital Settings

- The system shall allow management of hospital profile details.
- The system shall support invoice prefix and invoice sequencing.
- The system shall support branding assets such as logo and print footer information.

## 5. Additional Requested Feature Requirements

The following feature requests were provided separately and shall be treated as required enhancements to the application backlog.

### 5.1 Doctor Revenue

- The system shall provide doctor revenue reporting.
- Doctor revenue shall be viewable by doctor, date range, and billing type where applicable.
- The report shall show total consultation revenue and other doctor-linked bill amounts.

### 5.2 Labs Module

- The system shall include a lab management module.
- The lab module shall support lab test ordering, lab billing, and lab result status tracking.
- The lab module shall support inclusion of lab-related revenue in reports.
- The lab module shall expose pricing for lab tests, X-ray, and ultrasound from the provided SIMS price list.

### 5.3 Ultrasound Module

- The system shall include an ultrasound service workflow.
- Ultrasound services shall be billable and reportable.
- Ultrasound entries shall be linked to the patient and visit or admission.

### 5.4 Automatic X-Ray Fee Addition

- The system shall support automatic X-ray fee addition based on doctor consultation charge rules.
- The billing engine shall allow configuration of the rule that maps consultation type or doctor fee to X-ray fee amount.
- Users shall be able to review and override the auto-added amount if permission is granted.

### 5.5 OPD Date Without Time

- The OPD workflow shall support date-only entry where time is not required.
- Where appropriate, OPD registration and display screens shall show only the visit date and remove unnecessary time values.
- Reports and list views shall support date-only formatting for OPD records when configured.

### 5.6 Bed Charge

- The system shall support bed charges for IPD billing.
- Bed charges shall be configurable by room, ward, bed type, or package rule.
- Bed charges shall be automatically included in IPD billing based on admission duration and configured charging rules.

### 5.7 Package Bill

- The system shall support package billing for predefined treatment or admission packages.
- A package bill shall allow bundling of multiple billable services into a single package amount.
- Package billing shall support discounts, inclusions, exclusions, and package-level pricing rules.
- Surgery package pricing shall be configurable according to the imported SIMS price list.

### 5.8 Open Bill

- The system shall support open bill management for admissions or treatment episodes where charges are accumulated over time.
- Users shall be able to keep a bill open, append new charges, and settle it later.
- The system shall track outstanding amount and payment history for open bills.

### 5.9 Custom Doctor Charge

- The system shall support customized doctor charges at the patient, visit, or billing level.
- Authorized users shall be able to override standard consultation fees for a specific visit.
- The system shall preserve an audit trail for any customized charge changes.

### 5.10 Consent Form Auto Naming

- The system shall generate consent form filenames automatically based on the admitted patient.
- The naming convention shall include patient-identifying context such as patient name, MRN, admission ID, or date, according to final policy.
- Consent forms shall remain linked to the relevant IPD admission record.

### 5.11 OT Module

- The system shall include an Operation Theatre module.
- The OT module shall support OT booking, surgery scheduling, surgeon assignment, OT charges, and patient linkage.
- OT records shall be linked with IPD or OPD as applicable.
- OT billing shall support integration with package bill and open bill workflows.
- OT billing shall support package-based charges and manual charge heads from the bill format such as surgeon fees, anesthetist fees, OT assistant charges, OT medicine charges, and child or vaccination-related OT billing where applicable.

## 6. Functional Requirements Summary

The system shall:

- manage patients, visits, admissions, bills, payments, prescriptions, and reports
- support role-based access for hospital staff
- support OPD and IPD workflows in one application
- support configurable consultation and treatment charges
- support safe handling of hospital operational data and billing records
- support future expansion for lab, ultrasound, OT, package billing, and doctor revenue reporting

## 7. Non-Functional Requirements

### 7.1 Security

- All users shall authenticate before accessing protected modules.
- Passwords shall be stored securely using hashing.
- Sensitive operations shall be auditable.
- Access shall be restricted based on role and permission.

### 7.2 Reliability

- The application shall support persistent storage for database, uploads, and logs.
- The system shall support backup and restore procedures.
- The system shall avoid data loss during admission, billing, and discharge workflows.

### 7.3 Performance

- The application shall support responsive list and search operations for common workflows.
- Dashboard and report screens should load within acceptable operational time under normal clinic or hospital usage.

### 7.4 Usability

- The system shall provide simple workflows for reception, doctors, billing staff, and administrators.
- Actions such as patient registration, billing, prescription entry, and admission should be easy to complete with minimal training.

### 7.5 Deployment and Operations

- The application shall support browser-based usage through web deployment.
- The application shall support deployable builds for cloud or VPS hosting.
- The application shall support CI/CD integration through GitHub Actions and Azure DevOps pipelines.

## 8. Future Clarifications Required

The following requested items need detailed business-rule confirmation before implementation:

- doctor revenue calculation formula
- lab and ultrasound workflow details
- X-ray fee rule mapping logic
- bed charge calculation basis
- package bill inclusion and exclusion rules
- open bill settlement rules
- consent form naming format
- OT workflow and billing flow

## 9. Recommended Next Step

This document should be used as the baseline product requirements document. The next recommended step is to convert each enhancement requirement into:

- user stories
- acceptance criteria
- screen-level workflow changes
- database and API impact notes
