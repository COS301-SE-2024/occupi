import { expect, test } from "bun:test";
import { columns, users, statusOptions } from "./Data"; // Adjust the import path as necessary

// Test the structure and integrity of columns
test("columns array has the correct structure", () => {
  expect(columns.length).toBe(9);
  columns.forEach((column: { name: any; uid: any; }) => {
    expect(column).toHaveProperty('name');
    expect(column).toHaveProperty('uid');
    expect(typeof column.name).toBe('string');
    expect(typeof column.uid).toBe('string');
  });
});

// Test the sortable property in columns
// test("sortable columns are correctly marked", () => {
//   const sortableColumns = columns.filter((col: { sortable: any; }) => col.sortable);
//   expect(sortableColumns.length).toBeGreaterThan(0);
//   sortableColumns.forEach((col: { sortable: any; }) => {
//     expect(col.sortable).toBeTruthy();
//   });
// });

// Test the integrity and structure of users
test("users array has the correct structure and content", () => {
  expect(users.length).toBe(20);
  users.forEach((user: { id: any; name: any; role: any; team: any; status: any; email: any; bookings: any; }) => {
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('role');
    expect(user).toHaveProperty('team');
    expect(user).toHaveProperty('status');
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('bookings');
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.role).toBe('string');
    expect(typeof user.team).toBe('string');
    expect(typeof user.status).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(typeof user.bookings).toBe('number');
  });
});

// Test the integrity and structure of statusOptions
test("statusOptions array has the correct entries", () => {
  expect(statusOptions.length).toBe(3);
  statusOptions.forEach((option: { name: any; uid: any; }) => {
    expect(option).toHaveProperty('name');
    expect(option).toHaveProperty('uid');
    expect(typeof option.name).toBe('string');
    expect(typeof option.uid).toBe('string');
  });
});