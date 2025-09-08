# Auto-Save Testing Guide

## Quick Start Testing

Follow these steps to test the auto-save functionality with different field types and refresh scenarios:

### 1. Basic Auto-Save Test
1. Navigate to **Auto-Save Demo** in the sidebar
2. Fill out the "Task Title" field with some text
3. Wait 2 seconds and observe the auto-save indicator change from "Unsaved changes" to "Saved"
4. Refresh the page (F5 or Ctrl+R)
5. Confirm the draft restoration dialog appears
6. Click "OK" to restore your data

### 2. Interactive Demo Test
1. Navigate to **Interactive Demo** in the sidebar
2. Click "Populate Sample Data" to fill all field types
3. Watch the auto-save indicator and test results log
4. Switch between tabs to view:
   - **Interactive Form**: Test different field types
   - **Test Runner**: Run automated test scenarios
   - **Test Results**: View real-time operation logs
   - **Data Inspector**: Examine form state and auto-save status

### 3. Field Type Coverage Test
The Interactive Demo includes comprehensive field type testing:

- **Text Inputs**: Name, email, phone, website
- **Text Areas**: Biography, comments
- **Select Dropdowns**: Country, department, priority
- **Date/Time**: Birth date, start time
- **Boolean Controls**: Checkboxes, switches
- **Radio Groups**: Contact method preferences
- **Number Controls**: Sliders, number inputs
- **Dynamic Arrays**: Tags system

### 4. Refresh Scenarios

#### Scenario A: Mid-Form Refresh
1. Fill out 3-4 fields in any demo form
2. Do NOT submit the form
3. Refresh the page immediately
4. Confirm draft restoration works

#### Scenario B: Gradual Input Refresh
1. Type slowly in a text field
2. Wait for auto-save indicator to show "Saved"
3. Refresh page
4. Verify all entered data is restored

#### Scenario C: Complex Data Refresh
1. Use the Interactive Demo
2. Fill various field types (text, select, checkbox, etc.)
3. Add multiple tags
4. Adjust sliders and number inputs
5. Refresh page and verify complete restoration

### 5. Manual Save Testing
1. Fill out form fields
2. Click "Save now" button before auto-save triggers
3. Verify immediate save indication
4. Refresh page to confirm persistence

### 6. Draft Clearing Test
1. Fill out form data
2. Wait for auto-save
3. Click "Clear draft" button
4. Refresh page
5. Confirm no draft restoration dialog appears

## Expected Behaviors

### ✅ Auto-Save Indicator States
- **Ready to save**: Gray, no data entered
- **Unsaved changes**: Orange, data entered but not yet saved
- **Saving...**: Blue with spinner, save in progress
- **Saved [time]**: Green, successfully saved with timestamp

### ✅ Draft Restoration
- Restoration dialog appears on page load if draft exists
- User can choose to restore or discard draft
- All field types are accurately restored
- Complex data structures (arrays, objects) preserve state

### ✅ Performance
- Auto-save triggers every 1.5-2 seconds after changes
- No save operations for identical data
- Smooth UI with no blocking operations
- Manual save provides immediate feedback

## Troubleshooting

### Draft Not Restoring?
1. Check browser's local storage isn't disabled
2. Verify you're using the same browser/tab
3. Ensure sufficient data was entered to trigger auto-save
4. Try the "Manual Save" button before refreshing

### Auto-Save Not Triggering?
1. Verify the auto-save indicator shows "Unsaved changes"
2. Wait the full 2-second delay
3. Check that you're actually changing field values
4. Try different field types (text, select, checkbox)

### Performance Issues?
1. Check browser console for errors
2. Verify you're not rapidly triggering saves
3. Try reducing the amount of data in complex fields
4. Use the Data Inspector to monitor form state

## Advanced Testing Features

The **Interactive Demo** provides additional testing capabilities:

- **Test Runner**: Automated test scenarios
- **Real-time Monitoring**: Live view of auto-save operations
- **Data Export**: Export form data as JSON
- **Comprehensive Logging**: Detailed test result tracking
- **Multi-field Type Testing**: All input types in one form

Use these tools to thoroughly validate auto-save functionality across different scenarios and edge cases.