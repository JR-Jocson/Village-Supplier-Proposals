# Invoice-Based System Migration Plan

## Overview

Migrating from a **project-based** price limitation system to an **invoice-based** system where each invoice has its own requirements.

## Current System (Project-Based)

- Single `projectPrice` determines requirements for entire project
- All invoices share the same requirements:
  - < 5,500₪: 1 proposal, no tender
  - < 159,000₪: 2 proposals, no tender
  - ≥ 159,000₪: 4 proposals + tender
- Files are associated with project, not individual invoices

## New System (Invoice-Based)

- Each invoice has its own price
- Each invoice has its own requirements based on its price
- One invoice might need 4 proposals + 1 tender (if ≥ 159,000₪)
- Another invoice might need only 1 proposal (if < 5,500₪)
- Still need to ask for **total project cost** (separate from invoice prices)
- Need to ask user how much each invoice is

## Required Changes

### 1. Database Schema Changes

#### Add Invoice Model
```prisma
model Invoice {
  id          String   @id @default(uuid())
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  price       Float    // Price of this specific invoice
  files       InvoiceFile[]
  proposals   ProposalFile[]
  tender      TenderFile?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([projectId])
}
```

#### Update Project Model
```prisma
model Project {
  // ... existing fields ...
  totalProjectCost Float?  // NEW: Total cost of entire project
  invoicePrice     Float?   // DEPRECATED: Remove or keep for backward compatibility
  invoices         Invoice[] // NEW: Relation to invoices
  // ... rest of fields ...
}
```

#### Update ProjectFile or Create Separate Models
Option A: Add `invoiceId` to ProjectFile (nullable)
```prisma
model ProjectFile {
  // ... existing fields ...
  invoiceId   String?  // NEW: Link to invoice if file is invoice-specific
  invoice     Invoice? @relation(fields: [invoiceId], references: [id])
  // ... rest of fields ...
}
```

Option B: Create separate models (cleaner)
```prisma
model InvoiceFile {
  id          String   @id @default(uuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ProposalFile {
  id          String   @id @default(uuid())
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  index       Int      // Which proposal number (1, 2, 3, or 4)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model TenderFile {
  id          String   @id @default(uuid())
  invoiceId   String   @unique
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  fileName    String
  filePath    String
  fileSize    Int
  mimeType    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 2. UI Flow Changes

#### Current Flow:
1. Enter project info + project price
2. Upload committee approval
3. Upload invoices (multiple)
4. Upload proposals/tenders (based on project price)

#### New Flow:
1. Enter project info + **total project cost**
2. Upload committee approval
3. Upload invoices (multiple)
4. **NEW STEP**: Enter price for each invoice
5. Upload proposals/tenders **per invoice** (based on each invoice's price)

### 3. Component Changes

#### UploadPage.tsx
- Change `projectPrice` to `totalProjectCost`
- Remove price-based requirements calculation (moved to invoice level)
- Pass invoices to ProposalUpload component

#### ProposalUpload.tsx
- Accept array of invoices with prices
- Show requirements per invoice
- Allow uploading proposals/tenders per invoice
- Each invoice section shows its own requirements

#### New Component: InvoicePriceInput.tsx
- Step between invoice upload and proposal upload
- Show each uploaded invoice
- Allow user to enter/confirm price for each
- Show requirements preview per invoice
- Continue to proposal upload step

### 4. API Changes

#### `/api/projects` POST route
- Accept `totalProjectCost` instead of `invoicePrice`
- Accept array of invoices with prices: `invoices: [{ file, price }]`
- Create Invoice records for each invoice
- Link proposal/tender files to specific invoices
- Structure:
  ```typescript
  {
    // Project data
    totalProjectCost: number,
    // Invoices with prices
    invoices: [
      {
        file: File,
        price: number,
        proposals: File[],
        tender?: File
      }
    ]
  }
  ```

### 5. Requirements Calculation

Move from project-level to invoice-level:
```typescript
function getInvoiceRequirements(price: number) {
  if (price < 5500) {
    return { proposals: 1, tender: false };
  } else if (price < 159000) {
    return { proposals: 2, tender: false };
  } else {
    return { proposals: 4, tender: true };
  }
}
```

## Migration Strategy

1. **Phase 1**: Update database schema (add Invoice model, add totalProjectCost)
2. **Phase 2**: Update UI to collect invoice prices
3. **Phase 3**: Update API to handle per-invoice requirements
4. **Phase 4**: Update admin dashboard to show per-invoice data
5. **Phase 5**: Clean up old projectPrice-based logic

## Testing Checklist

- [ ] Can create project with multiple invoices
- [ ] Each invoice can have different price
- [ ] Requirements calculated correctly per invoice
- [ ] Can upload proposals/tenders per invoice
- [ ] Total project cost captured separately
- [ ] Admin dashboard shows invoice-level data
- [ ] Backward compatibility (if needed)

## Files to Modify

1. `prisma/schema.prisma` - Database schema
2. `components/UploadPage.tsx` - Add total project cost, remove project price requirements
3. `components/ProposalUpload.tsx` - Per-invoice uploads
4. `components/InvoicePriceInput.tsx` - NEW component
5. `app/api/projects/route.ts` - Handle invoices with prices
6. `app/api/admin/dashboard/route.ts` - Update queries for invoice data
7. Translation files - Add new strings

