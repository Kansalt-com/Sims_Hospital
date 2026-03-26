# SIMS Hospital Management System Requirements

## 1. Document Purpose

This document defines the current product requirements for the SIMS Hospital Management System (HMS). It is intended to act as the baseline requirements reference for:

- product planning
- development
- QA and UAT
- implementation handoff
- deployment and operations review

This version is updated to match the actual implemented scope of the application in this repository and to separate completed functionality from enhancement backlog items.

## 2. Product Overview

SIMS Hospital Management System is a role-based hospital operations platform used by front-desk, doctors, billing staff, administrators, pharmacy staff, and lab staff.

The system supports the following operational areas:

- patient registration and search
- OPD visit creation and queue management
- doctor notes and prescriptions
- IPD admission and discharge
- room and bed allocation
- billing and payment collection
- invoice and prescription printing
- hospital reporting and analytics
- user administration
- hospital branding and settings

## 3. Product Goals

The application shall provide a unified hospital workflow system that:

- reduces manual paperwork for patient, billing, and admission workflows
- gives staff role-based access to the tools relevant to their responsibilities
- supports both OPD and IPD care journeys in one application
- supports itemized and open billing with payment tracking
- improves visibility into hospital activity through dashboards and reports
- remains simple enough for daily use with minimal training

## 4. User Roles

The system shall support the following user roles:

- `ADMIN`
- `RECEPTION`
- `DOCTOR`
- `BILLING`
- `PHARMACY`
- `LAB_TECHNICIAN`

The system shall enforce role-based access control on routes and user actions.

## 5. Business Scope

The application shall support the daily operational flow below:

1. Register or find a patient.
2. Create an OPD visit or direct IPD admission.
3. Assign the patient to a doctor.
4. Record notes and prescription details.
5. Create a bill with catalog-based or manual charge lines.
6. Collect partial or full payment.
7. Print invoice and prescription when applicable.
8. Transfer OPD patients to IPD when admission is required.
9. Track inpatient status until discharge.
10. Review analytics, collections, and occupancy reports.

## 6. Functional Requirements

### 6.1 Authentication and Session Management

The system shall:

- allow users to log in using username and password
- deny access to inactive users
- issue an authenticated session token after successful login
- provide an authenticated `me` endpoint to restore the current session
- allow users to change their password
- enforce password complexity rules for password changes
- support forced password change for newly created or reset accounts
- invalidate stale sessions when user session state changes

Password policy shall require:

- minimum 10 characters
- uppercase letter
- lowercase letter
- numeric character
- special character

### 6.2 Authorization and Role-Based Access

The system shall:

- protect all internal modules behind authentication
- restrict access to pages and APIs by role
- display only allowed navigation items to the current user
- keep permission metadata available for future fine-grained expansion

### 6.3 Patient Management

The system shall:

- create new patient records
- generate a unique MRN for each patient
- store patient demographics including:
  - name
  - age
  - optional DOB
  - gender
  - phone
  - address
  - optional ID proof
- allow patient search by:
  - name
  - phone
  - MRN
- allow patient profile review
- show visit history for a patient
- show prescription history for a patient
- allow authorized staff to edit patient information
- allow authorized staff to delete accidental or duplicate patient records

### 6.4 Doctor Management

The system shall:

- maintain doctor user accounts
- maintain doctor profile records
- store doctor profile information including:
  - qualification
  - specialization
  - registration number
  - phone
  - email
  - experience years
- allow doctor selection in OPD and IPD workflows

### 6.5 OPD Visit Management

The system shall:

- create OPD visits for existing patients
- create OPD visits while registering a new patient in the same flow
- assign one doctor to each visit
- store consultation fee and visit reason
- allow date-based scheduling
- support visit statuses:
  - `SCHEDULED`
  - `IN_PROGRESS`
  - `COMPLETED`
  - `CANCELLED`
- allow search of the OPD queue by patient data
- allow status update from the queue
- allow creation of billing directly from an OPD visit
- allow prescription printing after billing conditions are met
- allow OPD to IPD transfer

### 6.6 Doctor Clinical Workflow

The system shall:

- provide a doctor-specific queue view for the day
- allow doctors to open one visit and review patient details
- allow doctors to add clinical notes to a visit
- allow doctors to create and update prescription items
- allow multiple medicines in one prescription
- store medicine fields including:
  - medicine name
  - dosage
  - frequency
  - duration in days
  - instruction
- allow doctors to mark the visit completed

### 6.7 Prescription Management

The system shall:

- link prescriptions to the patient, visit, doctor, and invoice where applicable
- support printable prescription sheets
- expose a prescription list for eligible visits
- allow re-printing of prescription sheets from patient history and dedicated workflow pages

Prescription eligibility rules shall include:

- prescription generation is tied to visit workflow
- prescription printing shall be available only when the related invoice due amount is zero

### 6.8 IPD Admission Management

The system shall:

- allow direct IPD admission creation
- allow OPD to IPD transfer
- link each IPD admission to:
  - a visit
  - a patient
  - an attending doctor
  - an optional room
  - an optional bed
- store:
  - ward
  - room label
  - bed label
  - diagnosis
  - reason for admission
  - admitted at time
  - discharged at time
- support admission status values:
  - `ADMITTED`
  - `UNDER_TREATMENT`
  - `RECOVERED`
  - `DISCHARGED`
- allow list filtering by search text and status
- allow discharge from the admission list

### 6.9 Rooms and Beds

The system shall:

- maintain room master data
- maintain bed master data
- relate beds to rooms
- support bed statuses:
  - `AVAILABLE`
  - `OCCUPIED`
  - `MAINTENANCE`
  - `RESERVED`
- show available beds when creating or updating admission workflows
- prevent use of beds that are not available for allocation
- release beds back to availability when a patient is discharged

### 6.10 Billing and Invoice Management

The system shall:

- create invoices linked to a visit
- support invoice types:
  - `OPD`
  - `IPD`
  - `PHARMACY`
  - `LAB`
  - `GENERAL`
- allow line-item billing
- support open bill behavior by allowing additional charges on an existing invoice
- calculate and store:
  - subtotal
  - discount
  - tax
  - total
  - paid amount
  - due amount
- support payment statuses:
  - `PENDING`
  - `PARTIAL`
  - `PAID`
- support payment modes:
  - `CASH`
  - `UPI`
  - `CARD`
  - `INSURANCE`
- allow multiple payments to be recorded over time against one invoice
- allow collecting zero payment at bill creation time
- allow adding notes to a bill
- auto-generate invoice number using hospital settings

The billing system shall support charge categories:

- `CONSULTATION`
- `LAB`
- `PROCEDURE`
- `MEDICINE`
- `MISC`

### 6.11 Service Catalog and Price Master Support

The system shall provide a service catalog for billable hospital services.

The catalog shall support at least the following departments:

- `OPD`
- `IPD`
- `BED`
- `WARD`
- `OT`
- `LAB`
- `XRAY`
- `ULTRASOUND`

The billing workflow shall:

- allow users to select catalog items by department
- prefill price-master values into bill lines
- allow custom charge lines when no master item exists
- support imported SIMS pricing for lab, OT, bed, and related service items

### 6.12 Billing Workflow Rules

The system shall:

- preload consultation fee as a bill item for new visits where applicable
- allow users to add additional charges to the same visit invoice later
- prevent invalid payment amounts larger than the amount being added in the current transaction
- allow payment collection after invoice creation from a separate payment collection action
- unlock prescription printing after full payment

### 6.13 Dashboard

The system shall provide a dashboard showing operational summaries.

The dashboard shall include, where data exists:

- today's OPD patient count
- current IPD admissions
- today's revenue
- doctors available
- appointments
- bed occupancy rate
- recent care queue items
- recent collections

The dashboard shall support quick navigation into operational modules.

### 6.14 Reports and Analytics

The system shall provide reporting for authorized roles.

The reports module shall support:

- date range selection
- operational summaries
- financial summaries
- export to Excel workbook
- print-friendly reporting

The report output shall include, where data is available:

- OPD count
- IPD count
- range revenue
- month-to-date revenue
- doctor-wise patient count
- bed occupancy summary
- payment mix
- invoice list for the selected range

### 6.15 User Administration

The system shall allow Admin users to:

- create staff users
- assign role during creation
- enable or disable users
- reset user passwords
- delete users when permitted

The system shall also:

- prevent deletion of the last remaining admin user
- identify the current signed-in user in the user list

### 6.16 Hospital Settings and Branding

The system shall allow Admin users to manage hospital-level settings.

The settings module shall support:

- hospital name
- address
- phone
- GSTIN
- default consultation fee
- invoice prefix
- invoice sequence
- footer note
- hospital logo upload

The system shall:

- use settings in application branding
- use settings in invoice numbering
- use settings in printable layouts
- validate uploaded logos by file type and size

Current logo upload rules:

- PNG, JPG, JPEG, and SVG
- maximum 3 MB

### 6.17 Printing

The system shall support print workflows for:

- invoices
- prescription sheets
- reports

The system shall render print-friendly views suitable for hospital front-desk and billing use.

### 6.18 Audit and Traceability

The system shall maintain audit logging for key actions, including:

- authentication activity
- visit state changes
- billing changes
- payment activity
- admission activity

The audit model shall support linking logs to:

- actor
- patient
- visit
- invoice
- admission

## 7. Implemented Modules in Current Scope

The following areas are implemented in the current application:

- authentication
- password change
- role-based protected routes
- patients module
- patient profile
- OPD queue and visit registration
- doctor portal
- prescription printing workflow
- IPD admissions and discharge
- room and bed-aware admission
- billing with line items
- partial and multi-step payment collection
- labs catalog browsing
- OT catalog browsing
- reports dashboard and analytics export
- user management
- hospital settings and branding
- audit-oriented backend data model

## 8. Partially Implemented or Backlog Enhancements

The following items are important to the app but are not fully implemented as complete workflow modules yet. They should remain in the product backlog.

### 8.1 Full Labs Workflow

Current state:

- price catalog browsing exists
- billing support exists

Backlog requirement:

- test ordering workflow
- sample collection status
- result entry and result review
- lab turnaround tracking

### 8.2 Full Ultrasound Workflow

Current state:

- pricing and billing support exist through catalog usage

Backlog requirement:

- dedicated ultrasound booking and service workflow
- patient-service linkage with result/status handling

### 8.3 Full X-Ray Workflow

Current state:

- pricing and billing support exist through catalog usage

Backlog requirement:

- dedicated imaging workflow
- status, report, and result lifecycle

### 8.4 Automatic X-Ray Fee Logic

Current state:

- manual billing entry is supported

Backlog requirement:

- configurable rule-driven auto-add of X-ray fee based on consultation or doctor logic

### 8.5 Package Billing

Current state:

- OT and service catalog items can be billed manually
- open-bill style charge addition exists

Backlog requirement:

- packaged service bundles
- inclusion and exclusion rules
- package-level pricing rules
- package-aware bill presentation

### 8.6 Automated Bed Charge by Duration

Current state:

- bed-related catalog items exist
- IPD billing supports manual or catalog-based addition

Backlog requirement:

- automatic duration-based bed charge calculation
- configurable billing basis by ward, room, bed type, or tariff

### 8.7 Doctor Revenue Reporting

Current state:

- doctor-wise patient count reporting exists
- invoice data includes doctor linkage

Backlog requirement:

- doctor revenue report by date range and invoice type
- clearly defined revenue attribution formula

### 8.8 OT Scheduling Workflow

Current state:

- OT pricing catalog exists

Backlog requirement:

- OT booking
- surgery scheduling
- surgeon assignment workflow
- OT case lifecycle management

### 8.9 Consent Form Management

Current state:

- no dedicated consent form workflow is currently visible in the product

Backlog requirement:

- upload or generation of consent forms
- patient-linked naming convention
- admission-linked storage

## 9. Non-Functional Requirements

### 9.1 Security

The system shall:

- require authentication for protected modules
- store passwords as secure hashes
- restrict access by role
- validate request payloads
- avoid exposing sensitive internal errors to end users in production-facing behavior

### 9.2 Reliability

The system shall:

- persist application data in a relational database
- preserve billing and admission integrity during normal workflows
- support backups for database and uploaded assets
- retain logs required for troubleshooting and audit review

### 9.3 Performance

The system should:

- support responsive staff usage on common hospital hardware
- return paginated operational lists for high-use screens
- keep dashboard and report responses operationally usable under normal hospital load

### 9.4 Usability

The system shall:

- provide simple, role-focused navigation
- keep common workflows short and easy to learn
- support minimal-training adoption for front-desk and billing staff
- present lists, forms, and printing actions clearly

### 9.5 Maintainability

The system should:

- keep frontend and backend separated by responsibility
- use typed APIs and validated payloads
- support migration-based database evolution
- remain extensible for new hospital modules

### 9.6 Deployability

The system shall support:

- browser-based deployment
- Docker-based deployment
- VPS and cloud deployment
- CI/CD support through repository deployment assets
- optional Windows desktop packaging through Electron

## 10. Technical and Operational Constraints

The current repository is structured as:

- `frontend/` for React + Vite + TypeScript user interface
- `backend/` for Express + TypeScript APIs
- `backend/prisma/` for schema, migrations, and seed data
- `desktop-electron/` for Windows desktop packaging

The current data and domain design assumes:

- one invoice per visit
- one prescription record per visit
- one IPD admission per visit
- role-driven access control rather than fully custom per-user ACLs

## 11. Assumptions

This requirements document assumes:

- hospital staff operate the system in a trusted internal environment
- patient identity is verified operationally by staff before data entry
- pricing masters are maintained by administrators or product support processes
- billing, discharge, and reporting rules follow hospital policy outside the system where no explicit automation exists yet

## 12. Acceptance Baseline

The current version of the product should be considered acceptable when:

- authorized users can log in and reach only allowed modules
- patients can be registered, searched, and reviewed
- OPD visits can be created and progressed
- doctors can add notes and prescriptions
- invoices can be created, updated, paid, and printed
- prescription printing is blocked until payment is complete
- IPD admissions can be created with room and bed allocation
- bed release occurs on discharge
- dashboard and reports show operational data
- admins can manage users and hospital settings

## 13. Recommended Next Product Steps

The next recommended product work items are:

1. Convert backlog items into user stories with acceptance criteria.
2. Prioritize full lab, imaging, and OT operational workflows.
3. Define explicit tariff and package-billing business rules.
4. Add doctor revenue reporting with approved financial logic.
5. Add consent-form and document-management workflows.

