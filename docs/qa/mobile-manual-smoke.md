# Mobile Manual Smoke Test

## Scope

Validate critical consumer and partner flows after clean architecture migration (notification preferences and scanner module).

## Preconditions

- API running at http://localhost:3001
- Mobile app started with Expo
- Seed data loaded
- Test users available:
  - dev@listasmart.com / senha123 (consumer)
  - parceiro@atacadao.com / admin123 (partner)

## Exit Criteria

- All P0 cases pass
- No crash or app freeze
- No navigation dead end

## P0 - Consumer Auth and Session

### TC-C-001 Login Consumer

Steps:
1. Open app logged out.
2. Login with consumer credentials.

Expected:
- Redirect to consumer tabs.
- Profile data visible in consumer area.

### TC-C-002 Session Expired Handling

Steps:
1. Login as consumer.
2. Invalidate token via backend or wait for expired token scenario.
3. Trigger request (open profile or lists).

Expected:
- User is logged out.
- Toast indicates session expiration.
- App navigates to login screen.

## P0 - Scanner Fiscal and Contribution

### TC-C-003 Read Fiscal QR (Known Product)

Steps:
1. Open Scanner tab.
2. Scan valid NFe/NFC-e QR containing at least one known catalog product.
3. If multiple matches, select one item.
4. Confirm market and submit.

Expected:
- Fiscal flow detected automatically.
- Item list modal appears when multiple matched items exist.
- Contribution type treated as qr_code.
- Success feedback appears.
- User points increase according to rule.

### TC-C-004 Fiscal QR Without Catalog Match

Steps:
1. Scan valid fiscal QR with items not mapped in catalog.

Expected:
- Alert informs cupom read but no known items.
- Flow falls back to manual search without crash.

### TC-C-005 Manual Contribution Fallback

Steps:
1. In Scanner, open manual mode.
2. Search product by name.
3. Select market and submit positive price.

Expected:
- Contribution accepted.
- Success state visible.
- Points update on profile.

## P0 - Consumer Profile

### TC-C-006 Edit Profile Data

Steps:
1. Open consumer profile.
2. Edit name and/or email.
3. Save changes.

Expected:
- Success message shown.
- Updated values displayed after save.

### TC-C-007 Contribution History

Steps:
1. Open consumer profile.
2. Scroll to contribution history section.

Expected:
- Recent contributions are listed.
- Type/status/price/date shown coherently.

### TC-C-008 Notification Preferences

Steps:
1. Open profile notification preferences.
2. Toggle global enabled and specific toggles.
3. Reopen modal/screen.

Expected:
- Changes persist.
- Disabled categories are respected by notification service.

## P0 - Partner Flow

### TC-P-001 Login Partner Routing

Steps:
1. Login using partner credentials.

Expected:
- Redirect to partner stack.
- Consumer tabs are not shown.

### TC-P-002 Partner Profile Market Data

Steps:
1. Open partner profile.

Expected:
- Linked market data is displayed.
- Loading and retry states behave correctly on failure.

### TC-P-003 Partner Dashboard Access

Steps:
1. Open partner dashboard.

Expected:
- Dashboard sections load without authorization errors.

## P1 - Regression Sanity

### TC-R-001 Lists Tab Opens

Expected:
- No crash when opening lists.

### TC-R-002 Ranking Tab Opens

Expected:
- No crash when opening ranking.

### TC-R-003 Compare Tab Opens

Expected:
- No crash when opening compare screen.

## Defect Logging Template

- ID:
- Environment:
- User role:
- Steps to reproduce:
- Actual result:
- Expected result:
- Evidence:
- Severity:
