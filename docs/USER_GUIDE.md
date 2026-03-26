# SIMS Hospital User Guide

This guide is written for hospital staff who use the SIMS Hospital Management System every day. It explains the app in a practical, step-by-step way so a new user can log in, understand the screens, and complete common work without guesswork.

## 1. What This App Does

SIMS Hospital helps staff manage the full patient flow inside the hospital:

- Patient registration
- OPD visit creation and queue handling
- Doctor notes and prescriptions
- Billing and payment collection
- IPD admission and discharge tracking
- Prescription and invoice printing
- Reports and analytics
- Staff account and hospital settings management

The system is role-based, so each user sees only the screens needed for their job.

## 2. Roles and What They Can Access

### Admin

Admin users can access:

- Dashboard
- Reports
- Patients
- OPD
- IPD
- Billing
- Labs
- OT Module
- Prescription
- Doctors
- Users
- Settings

### Reception

Reception users can access:

- Dashboard
- Reports
- Patients
- OPD
- IPD
- Billing
- Labs
- OT Module
- Prescription

### Doctor

Doctor users can access:

- Dashboard
- Reports
- Patients
- IPD
- Billing
- Labs
- OT Module
- Prescription
- Doctor Portal

### Billing

Billing users can access:

- Dashboard
- Reports
- Billing
- Labs
- OT Module

### Pharmacy

Pharmacy users can access:

- Dashboard
- Reports
- Billing

### Lab Technician

Lab technician users can access:

- Dashboard
- Reports
- Billing
- Labs

## 3. First Login

### Step 1: Open the app

Launch the SIMS Hospital application from the browser, desktop shortcut, or deployed hospital URL provided by your administrator.

### Step 2: Sign in

On the login page:

1. Enter your `Username`.
2. Enter your `Password`.
3. Click `Login`.

### Step 3: Change password if required

Some users may be asked to change their password before continuing.

If you see the password update screen:

1. Enter your current password.
2. Enter a new password.
3. Re-enter the new password in `Confirm New Password`.
4. Click `Update Password`.

Password rules:

- Minimum 10 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

## 4. Main Screen Layout

After login, the app opens inside the main hospital dashboard layout.

### Left sidebar

The sidebar contains the modules available to your role, such as:

- Dashboard
- Patients
- OPD
- IPD
- Billing
- Prescription
- Reports
- Admin pages

### Top area

The top header shows hospital branding and keeps the current page easy to identify.

### Signed-in box

In the sidebar you can see:

- Your name
- Your role
- `Logout` button

## 5. Dashboard

The Dashboard gives a quick overview of current hospital activity.

It may show:

- Today's OPD patient count
- Current IPD admissions
- Today's revenue
- Doctors available
- Appointment counts
- Bed occupancy
- Care queue summary
- Recent collections

### How to use it

1. Review the top cards for live hospital activity.
2. Click a card to jump directly into the related module.
3. Use the care queue section to see current visit progress.
4. Use the recent collections panel to review the latest billing activity.

This page is ideal for a quick shift-start overview.

## 6. Patients Module

Use the `Patients` page to search, register, update, and review patient records.

### 6.1 Search for an existing patient

1. Open `Patients`.
2. In the search box, type:
   - patient name
   - phone number
   - MRN
3. Click `Search`.
4. Click `View` on the required patient row.

Use `Reset` to clear the search.

### 6.2 Register a new patient

Only Admin and Reception users can create or edit patient records.

1. Open `Patients`.
2. Click `+ New Patient`.
3. Fill in:
   - `Full Name`
   - `Phone`
   - `Age`
   - `Gender`
   - `Patient Type`
   - `ID Proof` if available
   - `Address`
4. Click `Register`.

What happens next:

- The system creates the patient profile.
- A unique MRN is assigned automatically.
- The patient becomes searchable for OPD or IPD workflows.

### 6.3 Edit a patient

1. Find the patient in the list.
2. Click `Edit`.
3. Update the required fields.
4. Click `Update`.

### 6.4 Delete a patient

1. Find the patient.
2. Click `Delete`.
3. Confirm the action.

Delete carefully. This should usually be limited to accidental or duplicate records.

## 7. Patient Profile Page

The patient profile is the detailed history page for one patient.

It shows:

- MRN
- phone
- gender
- age
- address
- total billed amount
- visit history
- prescription history

### 7.1 Review visit history

1. Open the patient profile.
2. Stay on the `Visit History` tab.
3. Review each visit:
   - visit number
   - OPD/IPD type
   - doctor
   - date
   - status
   - consultation fee
   - notes
   - prescription summary

### 7.2 Print bill or prescription from patient history

If available, you can print directly from the visit row:

- `Print Bill`
- `Print Prescription`

Prescription printing is available only when the linked bill is fully paid.

### 7.3 Review all prescription sheets

1. Open the `Prescriptions` tab.
2. Check when the prescription sheet was created or printed.
3. Click `Print` to print the prescription again.

## 8. OPD Workflow

The `OPD` page is used mainly by Reception and Admin users to manage outpatient visits.

This is one of the most important daily workflows in the system.

### 8.1 Create an OPD visit for an existing patient

1. Open `OPD`.
2. In `Patient Mode`, select `Existing Patient`.
3. Choose the patient from `Select Patient`.
4. Select the doctor.
5. Enter the `Consultation Fee`.
6. Select the `Scheduled Date` if needed.
7. Enter the `Reason`.
8. Click `Create Visit`.

### 8.2 Create an OPD visit for a new patient

1. Open `OPD`.
2. In `Patient Mode`, select `New`.
3. Enter:
   - new patient name
   - doctor
   - consultation fee
   - scheduled date
   - reason
   - age
   - gender
   - phone
   - address
   - ID proof if available
4. Click `Create Visit`.

What happens next:

- The patient is created.
- The visit is created.
- The patient appears in the OPD queue.

### 8.3 Search the OPD queue

1. Use the `Search Queue` box.
2. Search by:
   - patient name
   - phone
   - MRN
3. Click `Search`.
4. Use `Reset` to clear filters.

### 8.4 Understand OPD status values

The visit status can move through:

- `SCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED` may exist in the system even if it is not commonly used from the page actions

### 8.5 Start a visit

1. Find the visit in the OPD queue.
2. Click `Start`.
3. The visit status changes to `IN_PROGRESS`.

### 8.6 Complete a visit

1. Find the visit row.
2. Click `Complete`.
3. The visit status changes to `COMPLETED`.

### 8.7 Create a bill from OPD

1. Find the patient in the OPD queue.
2. Click `Create Bill`.
3. The system opens the Billing page with that visit preselected.

### 8.8 Print a bill from OPD

If a bill already exists:

1. Find the visit row.
2. Click `Print Bill`.

### 8.9 Print a prescription from OPD

If the bill is fully paid:

1. Find the visit row.
2. Click `Prescription`.
3. Print the prescription sheet.

### 8.10 Transfer an OPD patient to IPD

If the patient must be admitted:

1. Find the visit row.
2. Click `Admit to IPD`.
3. Choose the required doctor, room, and bed.
4. Confirm the admission.

Once transferred, the visit shows as already moved to IPD.

## 9. Doctor Portal

The `Doctor Portal` is for doctors to handle today's appointments, record notes, and manage prescriptions.

### 9.1 Open today’s queue

1. Open `Doctor Portal`.
2. Review the queue on the left side.
3. Click a patient appointment to open details.

Each queue item shows:

- patient name
- visit date
- status

### 9.2 Review patient visit details

The detail panel shows:

- patient demographics
- phone
- visit ID
- reason
- status

### 9.3 Add clinical notes

1. In the `Clinical Notes` section, type examination notes, diagnosis, or treatment plan.
2. Click `Save Note`.

Saved notes appear below with time information.

### 9.4 Add or update a prescription

1. In the `Prescription` section, enter:
   - medicine
   - dosage
   - frequency
   - number of days
   - instruction
2. Click `+ Add Medicine` if more medicines are needed.
3. Click `Save Prescription`.

Important:

- At least one valid medicine entry is required.
- Existing prescription data is loaded automatically if already saved.

### 9.5 Mark the visit complete

1. Review notes and prescription.
2. Click `Mark Completed`.

This helps update the workflow for reception and billing teams.

## 10. Billing Desk

The `Billing` page is used to create bills, add charges, collect partial or full payments, and print invoices.

This page supports:

- OPD billing
- IPD billing
- lab billing
- OT billing items
- follow-up charge additions to an existing bill

## 11. Billing Workflow: Create a New Bill

### Step 1: Open Billing

Go to `Billing`.

If you came from OPD, the visit may already be selected automatically.

### Step 2: Select the visit

In `Patient Information`:

1. Open the `Visit` dropdown.
2. Select the patient visit.
3. Confirm the patient name, doctor name, and date shown automatically.

If the visit already has a bill, the screen shows:

- invoice number
- total
- paid amount
- due amount

### Step 3: Add charges from the service catalog

In `Service Catalog`:

1. Choose a department:
   - Labs
   - X-Ray
   - Ultrasound
   - OT / Package
   - Bed Charges
   - Ward
   - OPD
   - IPD
2. Choose a catalog item.
3. Click `Add Catalog Charge`.

### Step 4: Add a custom charge if needed

1. Click `Add Custom Charge`.
2. Enter the charge name.
3. Choose the category.
4. Enter quantity.
5. Enter rate.

### Step 5: Review and edit bill items

Each line item can be adjusted before saving:

- charge name
- category
- quantity
- rate

You can also remove any line with `Remove`.

### Step 6: Enter initial payment if collecting immediately

In the `Payment` section:

1. Select payment mode:
   - Cash
   - UPI
   - Card
   - Insurance
2. Enter `Paid Amount`.
3. Enter `Reference Number` if applicable.
4. Add notes if needed.

If you do not want to collect payment immediately, leave the paid amount as `0`.

### Step 7: Save the bill

1. Check the `Charge Addition Total`.
2. Click:
   - `Create Bill` for a new invoice
   - `Add Charges to Bill` if an invoice already exists

### Step 8: Print the bill

After saving successfully:

1. Click `Print Invoice`.
2. Use the browser print dialog.

If the bill is fully paid, you may also see `Print Prescription`.

## 12. Billing Workflow: Collect More Payment Later

If a bill is partially paid or unpaid:

1. Open `Billing`.
2. Search the invoice in the invoice list.
3. Click `Collect Payment`.
4. Select payment mode.
5. Enter amount.
6. Add reference number if needed.
7. Click `Collect Payment`.

The invoice status updates based on due amount:

- `PENDING`
- `PARTIAL`
- `PAID`

Prescription printing becomes available when the due amount reaches zero.

## 13. Billing Workflow: Add More Charges to an Existing Bill

1. Open `Billing`.
2. Search for the invoice.
3. Click `Add Charges`.
4. The related visit is loaded into the billing form.
5. Add additional catalog or custom items.
6. Optionally collect payment for the new charges.
7. Click `Add Charges to Bill`.

Use this when new lab tests, procedures, OT items, or IPD charges must be added after the first bill was created.

## 14. Prescription Module

The `Prescription` page lists bill-cleared OPD visits ready for prescription printing.

### How it works

- The page shows only eligible visits with fully paid billing.
- Prescription sheets are intended for print and doctor use.

### Step-by-step

1. Open `Prescription`.
2. Search by patient name or MRN if needed.
3. Review the visit, patient, doctor, and billing status.
4. Click `Print Prescription`.

You can also print the linked bill from the same page.

## 15. IPD Module

The `IPD` page manages inpatient admissions and status tracking.

Use it to:

- create direct admissions
- assign room and bed
- track inpatient status
- review current admitted patients
- discharge patients

### 15.1 Create a new IPD admission directly

1. Open `IPD`.
2. In `New IPD Admission`, fill:
   - patient
   - attending doctor
   - admitted date and time
   - room
   - bed
   - ward
   - room label
   - bed label
   - diagnosis
   - reason for admission
3. Click `Admit Patient`.

### 15.2 IPD admission through OPD transfer

This may also happen from the OPD page using `Admit to IPD`, which carries the patient into the inpatient workflow.

### 15.3 Search IPD records

1. Use the search box to search by:
   - patient name
   - MRN
   - ward
   - room
   - bed
2. Select a status filter if needed.
3. Click `Apply`.

### 15.4 Understand IPD statuses

IPD records can move through:

- `ADMITTED`
- `UNDER_TREATMENT`
- `RECOVERED`
- `DISCHARGED`

### 15.5 Update IPD status

1. Find the patient row.
2. Open the status dropdown.
3. Choose the new status.

### 15.6 Discharge a patient

1. In the IPD list, open the status dropdown.
2. Select `DISCHARGED`.

What happens next:

- the patient is marked discharged
- discharge time is saved
- the bed is released back to availability in the system

## 16. Labs Module

The `Labs` page is a service catalog browser, not a result-entry screen.

Use it to review available priced services for:

- Lab tests
- X-Ray
- Ultrasound

### Step-by-step

1. Open `Labs`.
2. Choose the department.
3. Search for a service name if needed.
4. Review the listed price.
5. Click `Billing Desk` if you want to add those services to a patient bill.

## 17. OT Module

The `OT Module` helps staff review OT and surgery-related billing items.

### Step-by-step

1. Open `OT Module`.
2. Search for the required OT service or package.
3. Review price and pricing rule.
4. Click `Billing Desk` to add the service to the bill.

This page mainly supports billing preparation and rate reference.

## 18. Reports Module

The `Reports` page provides date-range analytics and exports.

It includes:

- OPD count
- IPD count
- range revenue
- month-to-date revenue
- doctor-wise patient count
- bed occupancy summary
- payment mix
- invoice listing for the selected period

### 18.1 Generate a report

1. Open `Reports`.
2. Select `From Date`.
3. Select `To Date`.
4. Click `Generate Report`.

### 18.2 Export the report

1. Set the date range.
2. Click `Export XLS`.
3. Save the downloaded file.

### 18.3 Print the report

1. Generate the desired date range.
2. Click `Print`.
3. Use the print dialog to print or save as PDF.

## 19. Admin: Users

The `Users` page is for managing staff accounts.

### 19.1 Create a user

1. Open `Users`.
2. In `Create New User`, enter:
   - full name
   - username
   - role
   - password
3. Click `Create User`.

### 19.2 Enable or disable a user

1. Find the user in the list.
2. Click:
   - `Disable` to block access
   - `Enable` to restore access

### 19.3 Reset a password

1. Find the user.
2. Click `Reset Password`.
3. Enter the new temporary password when prompted.

After reset, the user is expected to change the password at next login.

### 19.4 Delete a user

1. Find the user.
2. Click `Delete`.
3. Confirm the deletion.

Important:

- The last remaining admin user cannot be deleted.

## 20. Admin: Settings

The `Settings` page controls hospital identity and billing defaults.

### 20.1 Update hospital profile

1. Open `Settings`.
2. In `Hospital Profile`, update:
   - hospital name
   - phone number
   - address
   - GSTIN
3. Click `Save Settings`.

These details are used in the app and printed documents.

### 20.2 Update billing defaults

1. In `Billing Defaults`, set:
   - default consultation fee
   - invoice prefix
   - next invoice sequence
2. Click `Save Settings`.

### 20.3 Update print footer text

1. In `Print Footer`, enter the required note.
2. Click `Save Settings`.

### 20.4 Upload hospital logo

1. In `Brand Assets`, click `Upload Hospital Logo`.
2. Choose a valid image file.
3. Wait for upload to complete.

Current rules:

- accepted image formats only
- maximum file size 3 MB

The uploaded logo appears in:

- app header
- invoices
- prescription print layouts

## 21. Printing Documents

The system supports printing for important patient-facing documents.

### You can print:

- invoices
- prescription sheets
- reports

### General printing steps

1. Open the required print page.
2. Click the print action if available.
3. Use the system print dialog.
4. Choose printer or save as PDF.

## 22. Recommended Daily Workflows

### Reception workflow

1. Log in.
2. Open `Dashboard` for the shift overview.
3. Search or register the patient in `Patients`.
4. Create the visit in `OPD`.
5. Start the visit when the patient is sent to the doctor.
6. Create billing after consultation or as per hospital policy.
7. Collect payment if needed.
8. Print the invoice.
9. Print prescription after bill clearance.
10. Transfer the patient to `IPD` if admission is required.

### Doctor workflow

1. Log in.
2. Open `Doctor Portal`.
3. Select a patient from today’s queue.
4. Review visit reason and patient details.
5. Add clinical notes.
6. Add or update prescription.
7. Mark the visit completed.

### Billing workflow

1. Log in.
2. Open `Billing`.
3. Search the visit or invoice.
4. Add consultation, lab, OT, bed, or custom charges.
5. Save the bill.
6. Collect full or partial payment.
7. Re-open the invoice later if more charges or payments are needed.

### Admin workflow

1. Log in.
2. Review `Dashboard` and `Reports`.
3. Create or update staff accounts in `Users`.
4. Maintain branding and invoice defaults in `Settings`.
5. Monitor revenue, occupancy, and billing patterns in `Reports`.

## 23. Common Tips

- Search before creating a new patient to avoid duplicates.
- Confirm the correct doctor and visit before billing.
- Use catalog charges where possible for consistent billing.
- Check due amount before promising prescription print availability.
- Review IPD bed assignment carefully before admission.
- Use reports at the end of the day for reconciliation.

## 24. Common Issues and What to Check

### Cannot print prescription

Check whether:

- the visit has a linked invoice
- the invoice due amount is zero
- the visit is visible in the Prescription workflow

### A patient does not appear in OPD billing

Check whether:

- the visit was created successfully
- the correct visit is selected
- you are searching with the correct patient or visit details

### Unable to log in

Check whether:

- username is correct
- password is correct
- the user account is active
- the password needs to be reset by Admin

### A bed is not available in IPD

Check whether:

- the selected room has available or reserved beds
- the bed is already occupied
- the patient needs a different room assignment

## 25. Good Security Practices

- Never share your password.
- Log out when leaving the workstation.
- Use strong passwords.
- Reset temporary passwords immediately.
- Limit admin access to authorized staff only.
- Verify patient identity before registration, billing, or admission.

## 26. Quick Reference

### To register a patient

`Patients` -> `+ New Patient` -> fill form -> `Register`

### To create an OPD visit

`OPD` -> fill visit form -> `Create Visit`

### To mark a visit started

`OPD` -> patient row -> `Start`

### To create a bill

`OPD` -> `Create Bill`

or

`Billing` -> select visit -> add items -> `Create Bill`

### To collect payment

`Billing` -> invoice row -> `Collect Payment`

### To print prescription

`Prescription` -> patient row -> `Print Prescription`

or from patient history / billing success actions

### To admit to IPD

`OPD` -> `Admit to IPD`

or

`IPD` -> fill admission form -> `Admit Patient`

### To discharge a patient

`IPD` -> status dropdown -> `DISCHARGED`

---

If you are new to the system, start with this order:

1. Learn `Patients`
2. Learn `OPD`
3. Learn `Billing`
4. Learn `Prescription`
5. Learn `IPD`
6. Learn `Reports`

That sequence matches how most daily hospital operations move through the app.
